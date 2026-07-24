<?php

namespace App\Services\Campaign;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use App\Models\CampaignRanking;
use App\Models\PointTransaction;
use App\Models\RedemptionCycle;
use App\Models\RedemptionCycleRanking;
use App\Models\RedemptionWindow;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;


class CampaignService
{

    // ---------------------- CRUD ----------------------

    public function create(array $data): Campaign
    {
        return DB::transaction(function () use ($data) {
            $campaign = Campaign::create([
                'name'       => $data['name'],
                'start_date' => $data['start_date'],
                'end_date'   => $data['end_date'],
                'is_active'  => $data['is_active'] ?? true,
            ]);

            if (!empty($data['auto_generate'])) {
                $this->generateCyclesAndWindows($campaign);
                log_action(
                    'CAMPAIGN_CREATED_WITH_CYCLES',
                    $campaign,
                    "Campaña '{$campaign->name}' creada con ciclos y ventanas auto-generados.",
                );
            }

            return $campaign->load('cycles.windows');
        });
    }

    public function update(Campaign $campaign, array $data): Campaign
    {
        return DB::transaction(function () use ($campaign, $data) {

            $data = array_filter([
                'name'       => $data['name']       ?? null,
                'start_date' => $data['start_date'] ?? null,
                'end_date'   => $data['end_date']   ?? null,
                'is_active'  => $data['is_active']  ?? null,
            ], fn($v) => $v !== null);

            $campaign->update($data);

            return $campaign->fresh('cycles.windows');
        });
    }

    public function delete(Campaign $campaign): void
    {
        DB::transaction(fn() => $campaign->delete());
    }

    public function close(Campaign $campaign, int $top = 10): array
    {
        return DB::transaction(function () use ($campaign, $top) {

            if (!$campaign->is_active) {
                throw new Exception('La campaña ya está cerrada.');
            }

            // Snapshot del ranking
            $ranking = $this->snapshotRanking($campaign, $top);

            // Desactivar campaña y ciclos
            $campaign->update([
                'is_active' => false,
                'status'    => CampaignStatus::COMPLETED
            ]);
            $campaign->cycles()->update(['is_active' => false]);

            log_action(
                'CAMPAIGN_CLOSED',
                $campaign,
                "Campaña '{$campaign->name}' cerrada. Top-{$top} guardado."
            );

            return [
                'campaign' => $campaign->fresh(),
                'ranking'  => $ranking,
            ];
        });
    }

    public function changeStatus(Campaign $campaign, CampaignStatus $status): Campaign
    {
        return DB::transaction(function () use ($campaign, $status) {
            $campaign->update(['status' => $status]);

            log_action(
                'CAMPAIGN_STATUS_CHANGED',
                $campaign,
                "El estatus de la campaña '{$campaign->name}' cambió a {$status->value}."
            );

            return $campaign->fresh('cycles.windows');
        });
    }

    // ---------------------- Ranking y snapshot ----------------------

    public function getRanking(
        Campaign  $campaign,
        ?int      $distributorId = null,
        int       $limit         = 0,
    ): Collection {

        $query = PointTransaction::ranking($campaign)
            ->orderByDesc('total_points');

        // Filtro por distribuidor (vendedor ve los de su distrib, distrib ve los suyos, admin puede filtrar)
        if ($distributorId !== null) {
            $query->where('sellers.distributor_id', $distributorId);
        }

        if ($limit > 0) {
            $query->limit($limit);
        }

        // Cargar datos de seller + distribuidor en batch
        $rows = $query->with(['seller.user', 'seller.distributor'])->get();

        return $rows->map(function ($row, $index) {
            $seller      = $row->seller;
            $distributor = $seller?->distributor;
            $user        = $seller?->user;


            return [
                'rank'             => $index + 1,
                'seller_id'        => $row->seller_id,
                'seller_name'      => $seller?->user?->username,
                'avatar_url'       => $user?->thumbAvatarUrl(),
                'employee_code'    => $seller?->employee_code,
                'distributor_id'   => $distributor?->id,
                'distributor_name' => $distributor?->company_name,
                'total_points'     => (int) $row->total_points,
            ];
        });
    }

    public function snapshotRanking(Campaign $campaign, int $top = 10): array
    {
        return DB::transaction(function () use ($campaign, $top) {

            $campaign->rankings()->delete();

            $ranking = $this->getRanking($campaign, null, $top);

            $savedRankings = [];

            foreach ($ranking as $entry) {
                $savedRankings[] = CampaignRanking::create([
                    'campaign_id'   => $campaign->id,
                    'seller_id'     => $entry['seller_id'],
                    'points_earned' => $entry['total_points'],
                    'rank_position' => $entry['rank'],
                ]);
            }

            log_action(
                'CAMPAIGN_RANKING_SNAPSHOT',
                $campaign,
                "Ranking histórico guardado: top {$top} de campaña '{$campaign->name}'"
            );

            return $savedRankings;
        });
    }

    public function getPersistedCampaignRanking(
        Campaign $campaign,
        ?int     $distributorId = null,
        int      $limit         = 0
    ): Collection {
        $query = CampaignRanking::with(['seller.user', 'seller.distributor'])
            ->where('campaign_id', $campaign->id)
            ->orderBy('rank_position');

        if ($distributorId !== null) {
            $query->whereHas('seller', function ($q) use ($distributorId) {
                $q->where('distributor_id', $distributorId);
            });
        }

        if ($limit > 0) {
            $query->limit($limit);
        }

        return $query->get()->map(function ($row) use ($distributorId) {
            $seller      = $row->seller;
            $distributor = $seller?->distributor;
            $user        = $seller?->user;


            return [
                'rank'             => $row->rank_position,
                'seller_id'        => $row->seller_id,
                'seller_name'      => $seller?->user?->username,
                'avatar_url'       => $user?->thumbAvatarUrl(),
                'employee_code'    => $seller?->employee_code,
                'distributor_name' => $distributorId === null ? $distributor?->company_name : null,
                'total_points'     => $row->points_earned,
            ];
        });
    }

    public function getPersistedCycleRanking(
        RedemptionCycle $cycle,
        ?int            $distributorId = null,
        int             $limit         = 0
    ): Collection {
        $query = RedemptionCycleRanking::with(['seller.user', 'seller.distributor'])
            ->where('redemption_cycle_id', $cycle->id)
            ->orderBy('rank_position');

        if ($distributorId !== null) {
            $query->whereHas('seller', function ($q) use ($distributorId) {
                $q->where('distributor_id', $distributorId);
            });
        }

        if ($limit > 0) {
            $query->limit($limit);
        }

        return $query->get()->map(function ($row, $index) use ($distributorId) {
            $seller      = $row->seller;
            $distributor = $seller?->distributor;
            $user        = $seller?->user;

            return [
                'rank'             => $distributorId !== null ? ($index + 1) : $row->rank_position,
                'global_rank'      => $row->rank_position,
                'seller_id'        => $row->seller_id,
                'seller_name'      => $seller?->user?->username,
                'avatar_url'       => $user?->thumbAvatarUrl(),
                'employee_code'    => $seller?->employee_code,
                'distributor_name' => $distributorId === null ? $distributor?->company_name : null,
                'total_points'     => $row->points_earned,
            ];
        });
    }

    // ---------------------- Auto-generación de ciclos y ventanas ----------------------

    public function generateCyclesAndWindows(Campaign $campaign): void
    {
        $fortnights = $this->buildFortnights(
            Carbon::parse($campaign->start_date),
            Carbon::parse($campaign->end_date)
        );

        $cycleNumber = 1;

        foreach ($fortnights as [$cycleStart, $cycleEnd]) {
            $cycle = RedemptionCycle::create([
                'campaign_id' => $campaign->id,
                'name'        => "Quincena {$cycleNumber} — " . $cycleStart->translatedFormat('F Y'),
                'start_date'  => $cycleStart,
                'end_date'    => $cycleEnd,
                'is_active'   => true,
            ]);

            $this->generateWindowsForCycle($cycle, $cycleStart, $cycleEnd);

            $cycleNumber++;
        }
    }

    private function buildFortnights(Carbon $campaignStart, Carbon $campaignEnd): array
    {
        $fortnights = [];
        $tz = config('app.display_timezone', 'America/Mexico_City');

        $cursor = $campaignStart->copy()->setTimezone($tz)->startOfDay();
        $localEnd = $campaignEnd->copy()->setTimezone($tz)->endOfDay();

        while ($cursor->lte($localEnd)) {
            $day = (int) $cursor->format('j');

            if ($day <= 15) {
                $qStart = $cursor->copy()->startOfDay();
                $qEnd   = $cursor->copy()->setDay(15)->endOfDay();
            } else {
                $qStart = $cursor->copy()->startOfDay();
                $qEnd   = $cursor->copy()->endOfMonth()->endOfDay();
            }

            $qStart = $qStart->max($campaignStart->copy()->setTimezone($tz)->startOfDay());
            $qEnd   = $qEnd->min($campaignEnd->copy()->setTimezone($tz)->endOfDay());

            if ($qStart->lte($qEnd)) {
                $fortnights[] = [
                    $qStart->copy()->setTimezone('UTC'),
                    $qEnd->copy()->setTimezone('UTC')
                ];
            }

            $cursor = $qEnd->copy()->addDay()->startOfDay();
        }

        return $fortnights;
    }

    public function generateWindowsForCycle(
        RedemptionCycle $cycle,
        Carbon $start,
        Carbon $end,
        bool $deletePrevious = false
    ): int {

        $windowsCreated = 0;

        if ($deletePrevious) $cycle->windows()->delete();

        $tz = config('app.display_timezone', 'America/Mexico_City');

        // Encontrar el primer viernes igual o posterior al start
        $cursor = $start->copy()->setTimezone($tz)->startOfDay();
        $localEnd = $end->copy()->setTimezone($tz)->endOfDay();

        // Avanzar hasta el próximo viernes (Carbon: 5 = Friday)
        while ($cursor->dayOfWeek !== Carbon::FRIDAY) {
            $cursor->addDay();
        }

        while ($cursor->lte($localEnd)) { // Si el viernes cae dentro del ciclo
            $localOpensAt  = $cursor->copy()->startOfDay();                    // Viernes 00:00 (MX)
            $localClosesAt = $cursor->copy()->addDays(2)->setTime(23, 59, 59); // Domingo 23:59:59

            // Recortar si el cierre sobrepasa el fin del ciclo
            if ($localClosesAt->gt($localEnd)) {
                $localClosesAt = $localEnd->copy()->setTime(23, 59, 59);
            }

            $opensAtUtc  = $localOpensAt->copy()->setTimezone('UTC');
            $closesAtUtc = $localClosesAt->copy()->setTimezone('UTC');

            // Solo crear si la apertura cae dentro del ciclo
            if ($localOpensAt->lte($localEnd)) {
                RedemptionWindow::create([
                    'cycle_id'  => $cycle->id,
                    'opens_at'  => $opensAtUtc,
                    'closes_at' => $closesAtUtc,
                ]);

                $windowsCreated++; // Incrementamos el contador por cada inserción exitosa
            }

            // Siguiente viernes
            $cursor->addWeek();
        }

        return $windowsCreated; // Retornamos el total
    }
}
