<?php

namespace App\Services\Analytics;

use App\Models\Campaign;
use App\Models\PointTransaction;
use App\Models\Seller;
use Illuminate\Support\Facades\Cache;

class AdoptionAnalyticsService
{
    /**
     * Tasa de usuarios activos vs inactivos
     */
    public function getUserActivityRate(?int $distributorId = null, int $periodDays = 30): array
    {
        $cacheKey = "analytics:user_activity:{$distributorId}:{$periodDays}";

        return Cache::remember($cacheKey, now()->addMinutes(15), function ()
        use ($distributorId, $periodDays) {

            $cutoffDate = now()->subDays($periodDays);

            $query = Seller::whereHas('user', fn($q) => $q->where('is_active', true));

            if ($distributorId) {
                $query->where('distributor_id', $distributorId);
            }

            $totalSellers = $query->count();

            // Vendedores activos (que han registrado ventas o ganado puntos)
            $activeSellers = $query->clone()
                ->where(function ($q) use ($cutoffDate) {
                    $q->whereHas(
                        'sales',
                        fn($sq) =>
                        $sq->where('created_at', '>=', $cutoffDate)
                    )
                        ->orWhereHas(
                            'pointTransactions',
                            fn($pq) =>
                            $pq->where('created_at', '>=', $cutoffDate)
                                ->whereIn('type', ['sale_earned', 'goal_bonus'])
                        );
                })
                ->count();

            $sampleAvatars = Seller::whereHas('user', fn($q) => $q->where('is_active', true))
                ->when($distributorId, fn($q) => $q->where('distributor_id', $distributorId))
                ->whereHas('sales', fn($q) => $q->where('created_at', '>=', $cutoffDate))
                ->with('user')
                ->limit(3)
                ->get()
                ->map(fn($seller) => $seller->user->avatarUrl() ?? null)
                ->filter()
                ->values()
                ->toArray();

            $inactiveSellers = $totalSellers - $activeSellers;
            $adoptionRate = $totalSellers > 0
                ? round(($activeSellers / $totalSellers) * 100, 1)
                : 0;

            return [
                'active_users' => $activeSellers,
                'inactive_users' => $inactiveSellers,
                'total_users' => $totalSellers,
                'adoption_rate' => $adoptionRate,
                'sample_avatars' => $sampleAvatars,
                'period_days' => $periodDays,
                'status' => $this->getAdoptionStatus($adoptionRate),
            ];
        });
    }

    /**
     * Participación por campaña
     */
    public function getCampaignParticipation(?int $campaignId = null, ?int $distributorId = null): array
    {
        $cacheKey = "analytics:campaign_participation:{$campaignId}:{$distributorId}";

        return Cache::remember($cacheKey, now()->addMinutes(20), function ()
        use ($campaignId, $distributorId) {

            $campaign = $campaignId
                ? Campaign::find($campaignId)
                : Campaign::current()->first();

            if (!$campaign) {
                return [
                    'campaign_name' => null,
                    'participants' => 0,
                    'total_eligible' => 0,
                    'participation_rate' => 0,
                ];
            }

            // Total de vendedores elegibles
            $eligibleQuery = Seller::whereHas('user', fn($q) => $q->where('is_active', true));
            if ($distributorId) {
                $eligibleQuery->where('distributor_id', $distributorId);
            }
            $totalEligible = $eligibleQuery->count();

            // Vendedores que participaron (ganaron puntos en la campaña)
            $participants = PointTransaction::whereBetween('created_at', [
                $campaign->start_date,
                $campaign->end_date
            ])
                ->whereIn('type', ['sale_earned', 'goal_bonus'])
                ->when($distributorId, function ($q) use ($distributorId) {
                    $q->whereHas(
                        'seller',
                        fn($sq) =>
                        $sq->where('distributor_id', $distributorId)
                    );
                })
                ->distinct('seller_id')
                ->count('seller_id');

            $participationRate = $totalEligible > 0
                ? round(($participants / $totalEligible) * 100, 1)
                : 0;

            return [
                'campaign_name' => $campaign->name,
                'participants' => $participants,
                'total_eligible' => $totalEligible,
                'participation_rate' => $participationRate,
                'period' => [
                    'start' => $campaign->start_date->toISOString(),
                    'end' => $campaign->end_date->toISOString(),
                ],
            ];
        });
    }

    /**
     * Engagement score (actividad reciente combinada)
     */
    public function getEngagementScore(?int $distributorId = null): array
    {
        $cacheKey = "analytics:engagement_score:{$distributorId}";

        return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($distributorId) {

            // Métricas de los últimos 30 días
            $last30Days = now()->subDays(30);

            $query = Seller::whereHas('user', fn($q) => $q->where('is_active', true));
            if ($distributorId) {
                $query->where('distributor_id', $distributorId);
            }

            $totalSellers = $query->count();

            // Vendedores con ventas recientes
            $withSales = $query->clone()
                ->whereHas('sales', fn($q) => $q->where('created_at', '>=', $last30Days))
                ->count();

            // Vendedores que han canjeado recientemente
            $withClaims = $query->clone()
                ->whereHas('claims', fn($q) => $q->where('claimed_at', '>=', $last30Days))
                ->count();

            // Vendedores que completaron una meta recientemente
            $withGoals = $query->clone()
                ->whereHas(
                    'goalProgresses',
                    fn($q) =>
                    $q->where('reached', true)
                        ->where('reached_at', '>=', $last30Days)
                )
                ->count();

            // Score ponderado (ventas 40%, canjes 30%, metas 30%)
            $engagementScore = $totalSellers > 0
                ? round((
                    ($withSales / $totalSellers) * 40 +
                    ($withClaims / $totalSellers) * 30 +
                    ($withGoals / $totalSellers) * 30
                ), 1)
                : 0;

            return [
                'engagement_score' => $engagementScore,
                'breakdown' => [
                    'sellers_with_sales' => $withSales,
                    'sellers_with_claims' => $withClaims,
                    'sellers_with_goals' => $withGoals,
                    'total_sellers' => $totalSellers,
                ],
                'period_days' => 30,
                'status' => $this->getEngagementStatus($engagementScore),
            ];
        });
    }

    /**
     * Determina el estado de adopción
     */
    private function getAdoptionStatus(float $rate): string
    {
        return match (true) {
            $rate >= 80 => 'excellent',
            $rate >= 60 => 'good',
            $rate >= 40 => 'fair',
            default => 'poor',
        };
    }

    /**
     * Determina el estado de engagement
     */
    private function getEngagementStatus(float $score): string
    {
        return match (true) {
            $score >= 70 => 'highly_engaged',
            $score >= 50 => 'engaged',
            $score >= 30 => 'moderately_engaged',
            default => 'low_engagement',
        };
    }
}
