<?php

namespace App\Services\Analytics;

use App\Enums\PointTransactionTypes;
use App\Models\Campaign;
use App\Models\PointTransaction;
use App\Models\Seller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class EconomyAnalyticsService
{
    /**
     * Resumen completo de economía de puntos
     */
    public function getPointsEconomy(?int $campaignId = null, ?int $distributorId = null): array
    {
        $cacheKey = "analytics:points_economy:{$campaignId}:{$distributorId}";

        return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($campaignId, $distributorId) {

            $campaign = $campaignId
                ? Campaign::find($campaignId)
                : Campaign::current()->first();

            $query = PointTransaction::query();

            if ($campaign) {
                $query->whereBetween('created_at', [
                    $campaign->start_date,
                    $campaign->end_date
                ]);
            }

            if ($distributorId) {
                $query->whereHas(
                    'seller',
                    fn($q) =>
                    $q->where('distributor_id', $distributorId)
                );
            }

            // Puntos emitidos (positivos)
            $issued = (int) $query->clone()
                ->whereIn('type', PointTransactionTypes::incrementValues())
                ->where('amount', '>', 0)
                ->sum('amount');

            // Puntos canjeados (negativos)
            $redeemed = abs((int) $query->clone()
                ->where('type', 'store_purchase')
                ->where('amount', '<', 0)
                ->sum('amount'));

            // Deuda circulante (puntos no gastados)
            $circulatingQuery = Seller::query();
            if ($distributorId) {
                $circulatingQuery->where('distributor_id', $distributorId);
            }
            $circulatingDebt = (int) $circulatingQuery->sum('current_points');

            // Tasa de redención
            $redemptionRate = $issued > 0
                ? round(($redeemed / $issued) * 100, 1)
                : 0;

            // Tendencia (comparar con periodo anterior si hay campaña)
            $trend = null;
            if ($campaign) {
                $trend = $this->calculateTrend($campaign, $distributorId);
            }

            return [
                'total_issued' => $issued,
                'total_redeemed' => $redeemed,
                'circulating_debt' => $circulatingDebt,
                'redemption_rate' => $redemptionRate,
                'status' => $this->getEconomyStatus($redemptionRate, $circulatingDebt, $issued),
                'trend' => $trend,
            ];
        });
    }

    /**
     * Evolución mensual de puntos (emitidos vs canjeados)
     */
    public function getMonthlyEvolution(?int $campaignId = null, ?int $distributorId = null): array
    {
        $cacheKey = "analytics:monthly_evolution:{$campaignId}:{$distributorId}";

        return Cache::remember($cacheKey, now()->addMinutes(20), function ()
        use ($campaignId, $distributorId) {

            $campaign = $campaignId
                ? Campaign::find($campaignId)
                : Campaign::current()->first();

            if (!$campaign) {
                // Últimos 6 meses
                $startDate = now()->subMonths(6)->startOfMonth();
                $endDate = now()->endOfMonth();
            } else {
                $startDate = $campaign->start_date;
                $endDate = $campaign->end_date;
            }

            $query = DB::table('point_transactions')
                ->whereBetween('point_transactions.created_at', [$startDate, $endDate]);

            if ($distributorId) {
                $query->join('sellers', 'sellers.id', '=', 'point_transactions.seller_id')
                    ->where('sellers.distributor_id', $distributorId);
            }

            // Agrupar por mes
            $results = $query->select(
                DB::raw("DATE_FORMAT(point_transactions.created_at, '%Y-%m') as month"),
                DB::raw("SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as issued"),
                DB::raw("ABS(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END)) as redeemed")
            )
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            return $results->map(function ($row) {
                return [
                    'month' => $row->month,
                    'issued' => (int) $row->issued,
                    'redeemed' => (int) $row->redeemed,
                    'net' => (int) ($row->issued - $row->redeemed),
                ];
            })->values()->all();
        });
    }

    /**
     * Evolución semanal de puntos (Lunes a Domingo)
     */
    public function getWeeklyEvolution(?int $distributorId = null): array
    {
        $cacheKey = "analytics:weekly_evolution:{$distributorId}";

        return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($distributorId) {
            $startDate = now()->startOfWeek(); // Lunes
            $endDate = now()->endOfWeek();     // Domingo

            $query = PointTransaction::whereBetween('point_transactions.created_at', [$startDate, $endDate]);

            if ($distributorId) {
                $query->whereHas('seller', fn($q) => $q->where('distributor_id', $distributorId));
            }

            $results = $query->select(
                DB::raw("DAYNAME(point_transactions.created_at) as day_name"),
                DB::raw("DAYOFWEEK(point_transactions.created_at) as day_num"),
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
        });
    }

    /**
     * Calcula tendencia comparando con campaña anterior
     */
    private function calculateTrend(Campaign $current, ?int $distributorId): ?array
    {
        // Buscar campaña anterior (que haya terminado antes que la actual)
        $previous = Campaign::where('end_date', '<', $current->start_date)
            ->orderByDesc('end_date')
            ->first();

        if (!$previous) {
            return null;
        }

        $query = PointTransaction::query();
        if ($distributorId) {
            $query->whereHas(
                'seller',
                fn($q) =>
                $q->where('distributor_id', $distributorId)
            );
        }

        $prevIssued = (int) $query->clone()
            ->whereBetween('created_at', [$previous->start_date, $previous->end_date])
            ->whereIn('type', ['sale_earned', 'goal_bonus', 'manual_adjustment'])
            ->where('amount', '>', 0)
            ->sum('amount');

        $currentIssued = (int) $query->clone()
            ->whereBetween('created_at', [$current->start_date, now()])
            ->whereIn('type', ['sale_earned', 'goal_bonus', 'manual_adjustment'])
            ->where('amount', '>', 0)
            ->sum('amount');

        $change = $prevIssued > 0
            ? round((($currentIssued - $prevIssued) / $prevIssued) * 100, 1)
            : 0;

        return [
            'vs_previous_campaign' => $change,
            'direction' => $change > 0 ? 'up' : ($change < 0 ? 'down' : 'stable'),
        ];
    }

    /**
     * Determina el estado de salud de la economía
     */
    private function getEconomyStatus(float $redemptionRate, int $debt, int $issued): string
    {
        // Si la tasa de redención es muy baja, hay problema de motivación
        if ($redemptionRate < 20 && $issued > 0) {
            return 'low_engagement';
        }

        // Si la deuda es muy alta relativo a lo emitido
        if ($issued > 0 && ($debt / $issued) > 0.8) {
            return 'high_liability';
        }

        // Si la tasa está entre 30-70%, es saludable
        if ($redemptionRate >= 30 && $redemptionRate <= 70) {
            return 'healthy';
        }

        // Si la tasa es muy alta (>80%), puede que no haya suficientes premios atractivos
        if ($redemptionRate > 80) {
            return 'high_redemption';
        }

        return 'normal';
    }
}
