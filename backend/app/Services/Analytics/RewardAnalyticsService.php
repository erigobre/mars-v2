<?php

namespace App\Services\Analytics;

use App\Models\Campaign;
use App\Models\PointTransaction;
use App\Models\RewardClaim;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class RewardAnalyticsService
{
    /**
     * Total de premios entregados
     */
    public function getTotalDelivered(?int $campaignId = null, ?int $distributorId = null): array
    {
        $cacheKey = "analytics:total_delivered:{$campaignId}:{$distributorId}";

        return Cache::remember($cacheKey, now()->addMinutes(15), function ()
        use ($campaignId, $distributorId) {

            $query = RewardClaim::whereIn('status', ['delivered']);

            if ($campaignId) {
                $campaign = Campaign::find($campaignId);
                if ($campaign) {
                    $query->whereBetween('claimed_at', [
                        $campaign->start_date,
                        $campaign->end_date
                    ]);
                }
            }

            if ($distributorId) {
                $query->whereHas(
                    'seller',
                    fn($q) =>
                    $q->where('distributor_id', $distributorId)
                );
            }

            $total = $query->count();
            $totalPoints = $query->sum('points_spent');

            return [
                'total_delivered' => $total,
                'total_points_spent' => (int) $totalPoints,
            ];
        });
    }

    /**
     * Premios más populares (top claims)
     */
    public function getTopRewards(int $limit = 10, ?int $campaignId = null, ?int $distributorId = null): array
    {
        $cacheKey = "analytics:top_rewards:{$limit}:{$campaignId}:{$distributorId}";

        return Cache::remember($cacheKey, now()->addMinutes(20), function ()
        use ($limit, $campaignId, $distributorId) {

            $query = DB::table('reward_claims')
                ->join('rewards', 'rewards.id', '=', 'reward_claims.reward_id')
                ->select(
                    'rewards.id',
                    'rewards.name',
                    'rewards.image_url',
                    'rewards.points_required',
                    DB::raw('COUNT(reward_claims.id) as claim_count'),
                    DB::raw('SUM(reward_claims.points_spent) as total_points_spent')
                )
                ->whereIn('reward_claims.status', ['pending', 'approved', 'shipped', 'delivered']);

            if ($campaignId) {
                $campaign = Campaign::find($campaignId);
                if ($campaign) {
                    $query->whereBetween('reward_claims.claimed_at', [
                        $campaign->start_date,
                        $campaign->end_date
                    ]);
                }
            }

            if ($distributorId) {
                $query->join('sellers', 'sellers.id', '=', 'reward_claims.seller_id')
                    ->where('sellers.distributor_id', $distributorId);
            }

            $rewards = $query->groupBy('rewards.id', 'rewards.name', 'rewards.image_url', 'rewards.points_required')
                ->orderByDesc('claim_count')
                ->limit($limit)
                ->get();

            $totalClaims = $rewards->sum('claim_count');

            return $rewards->map(function ($reward) use ($totalClaims) {
                return [
                    'reward_id' => $reward->id,
                    'name' => $reward->name,
                    'image' => $reward->image_url ? Storage::disk('public')->url($reward->image_url) : null,
                    'points_required' => (int) $reward->points_required,
                    'claim_count' => (int) $reward->claim_count,
                    'total_points_spent' => (int) $reward->total_points_spent,
                    'percentage_of_total' => $totalClaims > 0
                        ? round(($reward->claim_count / $totalClaims) * 100, 1)
                        : 0,
                ];
            })->values()->all();
        });
    }

    /**
     * Estado del embudo de reclamos
     */
    public function getClaimsFunnel(?int $campaignId = null, ?int $distributorId = null): array
    {
        $cacheKey = "analytics:claims_funnel:{$campaignId}:{$distributorId}";

        return Cache::remember($cacheKey, now()->addMinutes(10), function ()
        use ($campaignId, $distributorId) {

            $query = RewardClaim::query();

            if ($campaignId) {
                $campaign = Campaign::find($campaignId);
                if ($campaign) {
                    $query->whereBetween('claimed_at', [
                        $campaign->start_date,
                        $campaign->end_date
                    ]);
                }
            }

            if ($distributorId) {
                $query->whereHas(
                    'seller',
                    fn($q) =>
                    $q->where('distributor_id', $distributorId)
                );
            }

            $statuses = $query->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get()
                ->keyBy('status');

            $total = $statuses->sum('count');

            return [
                'reserved' => (int) ($statuses->get('reserved')->count ?? 0),
                'pending' => (int) ($statuses->get('pending')->count ?? 0),
                'approved' => (int) ($statuses->get('approved')->count ?? 0),
                'shipped' => (int) ($statuses->get('shipped')->count ?? 0),
                'delivered' => (int) ($statuses->get('delivered')->count ?? 0),
                'rejected' => (int) ($statuses->get('rejected')->count ?? 0),
                'total' => $total,
                'conversion_rate' => $total > 0
                    ? round((($statuses->get('delivered')->count ?? 0) / $total) * 100, 1)
                    : 0,
            ];
        });
    }

    /**
     * Volumen de canjes por ciclo/ventana
     */
    public function getClaimsVolumeByCycle(?int $campaignId = null, ?int $distributorId = null): array
    {
        $cacheKey = "analytics:claims_by_cycle:{$campaignId}:{$distributorId}";

        return Cache::remember($cacheKey, now()->addMinutes(20), function ()
        use ($campaignId, $distributorId) {

            $query = DB::table('reward_claims')
                ->join('redemption_cycles', 'redemption_cycles.id', '=', 'reward_claims.redemption_cycle_id')
                ->select(
                    'redemption_cycles.id as cycle_id',
                    'redemption_cycles.name as cycle_name',
                    'redemption_cycles.start_date',
                    'redemption_cycles.end_date',
                    DB::raw('COUNT(reward_claims.id) as claim_count'),
                    DB::raw('SUM(reward_claims.points_spent) as total_points')
                );

            if ($campaignId) {
                $query->where('redemption_cycles.campaign_id', $campaignId);
            } else {
                // Solo ciclos de la campaña actual
                $campaign = Campaign::current()->first();
                if ($campaign) {
                    $query->where('redemption_cycles.campaign_id', $campaign->id);
                }
            }

            if ($distributorId) {
                $query->join('sellers', 'sellers.id', '=', 'reward_claims.seller_id')
                    ->where('sellers.distributor_id', $distributorId);
            }

            $cycles = $query->groupBy('redemption_cycles.id', 'redemption_cycles.name', 'redemption_cycles.start_date', 'redemption_cycles.end_date')
                ->orderBy('redemption_cycles.start_date')
                ->get();

            return $cycles->map(function ($cycle) {
                return [
                    'cycle_id' => $cycle->cycle_id,
                    'cycle_name' => $cycle->cycle_name,
                    'period' => [
                        'start' => $cycle->start_date,
                        'end' => $cycle->end_date,
                    ],
                    'claim_count' => (int) $cycle->claim_count,
                    'total_points' => (int) $cycle->total_points,
                ];
            })->values()->all();
        });
    }

    public function getWeeklyEvolution(?int $distributorId = null): array
    {
        $startDate = now()->startOfWeek(); // Lunes
        $endDate = now()->endOfWeek();     // Domingo

        $query = PointTransaction::whereBetween('created_at', [$startDate, $endDate]);

        if ($distributorId) {
            $query->whereHas('seller', fn($q) => $q->where('distributor_id', $distributorId));
        }

        $results = $query->select(
            DB::raw("DAYNAME(created_at) as day_name"),
            DB::raw("DAYOFWEEK(created_at) as day_num"),
            DB::raw("SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as issued"),
            DB::raw("ABS(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END)) as redeemed")
        )
            ->groupBy('day_name', 'day_num')
            ->orderBy('day_num')
            ->get();

        // Formatear para el frontend
        $days = ['Monday' => 'LUN', 'Tuesday' => 'MAR', 'Wednesday' => 'MIE', 'Thursday' => 'JUE', 'Friday' => 'VIE', 'Saturday' => 'SAB', 'Sunday' => 'DOM'];

        return $results->map(function ($row) use ($days) {
            return [
                'day' => $days[$row->day_name] ?? $row->day_name,
                'issued' => (int) $row->issued,
                'redeemed' => (int) $row->redeemed,
            ];
        })->values()->all();
    }

    /**
     * Obtiene la cantidad de canjes solicitados el día de hoy
     */
    public function getTodayClaimsCount(?int $distributorId = null): int
    {
        $query = RewardClaim::whereDate('created_at', today());
        if ($distributorId) {
            $query->whereHas('seller', fn($q) => $q->where('distributor_id', $distributorId));
        }
        return $query->count();
    }

    /**
     * Obtiene los últimos canjes para llenar la tabla rápida del Dashboard
     */
    public function getRecentClaims(int $limit = 5, ?int $distributorId = null): array
    {
        $query = RewardClaim::with(['seller.user', 'reward'])->latest();

        if ($distributorId) {
            $query->whereHas('seller', fn($q) => $q->where('distributor_id', $distributorId));
        }

        return $query->limit($limit)->get()->map(function ($claim) {
            return [
                'id' => $claim->id,
                'folio' => $claim->folio,
                'user_name' => $claim->seller->user->username ?? 'Desconocido',
                'user_avatar' => $claim->seller->user->avatarUrl() ?? null,
                'user_initials' => strtoupper(substr($claim->seller->user->username ?? 'D', 0, 2)),
                'reward_name' => $claim->reward->name ?? 'Premio Eliminado',
                'reward_image' => $claim->reward->imageUrl() ?? null,
                'reward_name' => $claim->reward->name ?? 'Premio Eliminado',
                'status' => $claim->status->value, // Para pintarlo de color en el frontend
                'date' => $claim->claimed_at ? $claim->claimed_at->format('d M Y') : $claim->created_at->format('d M Y'),
            ];
        })->toArray();
    }

    public function getDistributorRewardsKpis(?int $campaignId, int $distributorId): array
    {
        $cacheKey = "analytics:distributor_rewards_kpis:{$campaignId}:{$distributorId}";

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($campaignId, $distributorId) {

            $query = RewardClaim::whereHas('seller', fn($q) => $q->where('distributor_id', $distributorId));

            if ($campaignId) {
                $campaign = Campaign::find($campaignId);
                if ($campaign) {
                    $query->whereBetween('claimed_at', [$campaign->start_date, $campaign->end_date]);
                }
            }

            // Canjes Hoy
            $claimsToday = $query->clone()->whereDate('claimed_at', today())->count();

            // Tendencia: Canjes Ayer (Para mostrar "+X% vs ayer")
            $claimsYesterday = $query->clone()->whereDate('claimed_at', today()->subDay())->count();
            $trendToday = $claimsYesterday > 0 ? round((($claimsToday - $claimsYesterday) / $claimsYesterday) * 100, 1) : 0;

            // Canjes de la Semana
            $claimsThisWeek = $query->clone()->whereBetween('claimed_at', [now()->startOfWeek(), now()->endOfWeek()])->count();

            // Entregados y Puntos Gastados
            $deliveredQuery = $query->clone()->where('status', 'delivered');
            $totalDelivered = $deliveredQuery->count();
            $totalPointsSpent = $deliveredQuery->sum('points_spent');

            // Total de canjes históricos (para sacar efectividad de entrega)
            $totalClaimsEver = $query->clone()->count();
            $deliveryEffectiveness = $totalClaimsEver > 0 ? round(($totalDelivered / $totalClaimsEver) * 100, 1) : 0;

            return [
                'claims_today' => [
                    'value' => $claimsToday,
                    'trend' => $trendToday,
                    'trend_label' => 'vs ayer',
                ],
                'claims_week' => [
                    'value' => $claimsThisWeek,
                ],
                'total_delivered' => [
                    'value' => $totalDelivered,
                    'effectiveness_percentage' => $deliveryEffectiveness, // Ej. 98% de efectividad
                ],
                'points_spent' => [
                    'value' => (int) $totalPointsSpent,
                ],
            ];
        });
    }
}
