<?php

namespace App\Services\Redemption;

use App\Enums\PointTransactionTypes;
use App\Models\Campaign;
use App\Models\PointTransaction;
use App\Models\RedemptionCycle;
use App\Models\RedemptionCycleRanking;
use App\Services\Campaign\CampaignService;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;

class RedemptionCycleService
{
    public function __construct(protected CampaignService $campaignService) {}

    // ------------------------- CRUD de Ciclos -------------------------

    public function create(Campaign $campaign, array $data): RedemptionCycle
    {
        return DB::transaction(function () use ($campaign, $data) {
            $cycle = RedemptionCycle::create([
                'campaign_id' => $campaign->id,
                'name'        => $data['name'],
                'start_date'  => $data['start_date'],
                'end_date'    => $data['end_date'],
                'is_active'   => $data['is_active'] ?? true,
            ]);

            // Si se pide auto-generar ventanas al crear el ciclo
            if (!empty($data['auto_generate_windows']) && $data['auto_generate_windows']) {
                $this->campaignService->generateWindowsForCycle(
                    $cycle,
                    Carbon::parse($cycle->start_date),
                    Carbon::parse($cycle->end_date),
                );
            }

            return $cycle->load('windows');
        });
    }

    public function update(RedemptionCycle $cycle, array $data): RedemptionCycle
    {
        return DB::transaction(function () use ($cycle, $data) {

            $data = array_filter([
                'name'       => $data['name']       ?? null,
                'start_date' => $data['start_date'] ?? null,
                'end_date'   => $data['end_date']   ?? null,
                'is_active'  => $data['is_active']  ?? null,
            ], fn($v) => $v !== null);

            $cycle->update($data);

            return $cycle->fresh('windows');
        });
    }

    public function delete(RedemptionCycle $cycle): void
    {
        if ($cycle->claims()->exists()) {
            throw new Exception(
                'No se puede eliminar un ciclo que ya tiene canjes registrados.'
            );
        }

        DB::transaction(function () use ($cycle) {
            $cycle->windows()->delete();
            $cycle->delete();
        });
    }

    public function snapshotCycleRanking(RedemptionCycle $cycle, int $top = 10): void
    {
        DB::transaction(function () use ($cycle, $top) {
            $cycle->rankings()->delete();

            $ranking = PointTransaction::query()
                ->leftJoin('sales', 'sales.id', '=', 'point_transactions.sale_id')
                ->where(function($q) use ($cycle) {
                    $q->whereBetween('sales.sale_date', [$cycle->start_date, $cycle->end_date])
                      ->orWhere(function($subq) use ($cycle) {
                          $subq->whereNull('point_transactions.sale_id')
                               ->whereBetween('point_transactions.created_at', [$cycle->start_date . ' 00:00:00', $cycle->end_date . ' 23:59:59']);
                      });
                })
                ->whereIn('point_transactions.type', PointTransactionTypes::incrementValues())
                ->selectRaw('point_transactions.seller_id, sum(point_transactions.amount) as total_points')
                ->groupBy('point_transactions.seller_id')
                ->having('total_points', '>', 0)
                ->orderByDesc('total_points')
                ->limit($top)
                ->get();

            foreach ($ranking as $index => $entry) {
                RedemptionCycleRanking::create([
                    'redemption_cycle_id' => $cycle->id,
                    'seller_id'           => $entry->seller_id,
                    'points_earned'       => $entry->total_points,
                    'rank_position'       => $index + 1,
                ]);
            }
        });
    }
}
