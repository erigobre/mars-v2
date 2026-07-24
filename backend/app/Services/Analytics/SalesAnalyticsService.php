<?php

namespace App\Services\Analytics;

use App\Models\Campaign;
use App\Models\Goal;
use App\Models\Sale;
use App\Services\Image\ImageService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SalesAnalyticsService
{
    /**
     * Ventas totales vs. Metas para una campaña
     */
    public function getSalesVsGoals(?int $campaignId = null, ?int $distributorId = null)
    {
        $cacheKey = "analytics:sales_vs_goals:{$campaignId}:{$distributorId}";

        return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($campaignId, $distributorId) {
            $campaign = $campaignId
                ? Campaign::find($campaignId)
                : Campaign::current()->first();

            if (!$campaign) {
                return [
                    'current_sales' => 0,
                    'goal' => 0,
                    'percentage' => 0,
                    'status' => 'no_campaign',
                ];
            }

            $query = Sale::whereBetween('sale_date', [
                $campaign->start_date,
                $campaign->end_date
            ]);

            if ($distributorId) {
                $query->whereHas(
                    'seller',
                    fn($q) =>
                    $q->where('distributor_id', $distributorId)
                );
            }

            $currentSales = $query->sum('total_amount');

            $goalTarget = Goal::where('type', 'TOTAL_SALES_AMOUNT')
                ->where('is_active', true)
                ->whereHas('cycle', function ($q) use ($campaign) {
                    $q->where('campaign_id', $campaign->id)
                        ->where('is_active', true);
                })->sum('target_value');

            $percentage = $goalTarget > 0
                ? min(round(($currentSales / $goalTarget) * 100, 1), 100)
                : 100;

            return [
                'current_sales' => (float) $currentSales,
                'goal' => (float) $goalTarget,
                'percentage' => $percentage,
                'status' => $this->getStatusFromPercentage($percentage),
                'campaign_name' => $campaign->name,
                'period' => [
                    'start' => $campaign->start_date->toISOString(),
                    'end' => $campaign->end_date->toISOString(),
                ],
            ];
        });
    }

    /**
     * Productos más vendidos
     * 
     * Retorna top N productos por cantidad o por ingresos
     */
    public function getTopProducts(
        int $limit = 10,
        ?int $campaignId = null,
        ?int $distributorId = null,
        string $metric = 'quantity', // 'quantity' o 'revenue'
        ?int $cycleId = null
    ): array {
        $cacheKey = "analytics:top_products:{$limit}:{$campaignId}:{$distributorId}:{$metric}:{$cycleId}";

        return Cache::remember($cacheKey, now()->addMinutes(20), function ()
        use ($limit, $campaignId, $distributorId, $metric, $cycleId) {

            $campaign = $campaignId
                ? Campaign::find($campaignId)
                : Campaign::current()->first();

            $query = DB::table('sale_items')
                ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
                ->join('products', 'products.id', '=', 'sale_items.product_id')
                ->select(
                    'products.id',
                    'products.name',
                    'products.sku',
                    'products.image_url',
                    DB::raw('SUM(sale_items.quantity) as total_sold'),
                    DB::raw('SUM(sale_items.subtotal) as total_revenue'),
                    DB::raw('SUM(sale_items.total_points) as total_points')
                );

            if ($cycleId) {
                $cycle = \App\Models\RedemptionCycle::find($cycleId);
                if ($cycle) {
                    $query->whereBetween('sales.sale_date', [
                        $cycle->start_date,
                        $cycle->end_date
                    ]);
                }
            } else if ($campaign) {
                $query->whereBetween('sales.sale_date', [
                    $campaign->start_date,
                    $campaign->end_date
                ]);
            }

            if ($distributorId) {
                $query->join('sellers', 'sellers.id', '=', 'sales.seller_id')
                    ->where('sellers.distributor_id', $distributorId);
            }

            $orderBy = $metric === 'quantity' ? 'total_sold' : 'total_revenue';

            $products = $query->groupBy('products.id', 'products.name', 'products.image_url', 'products.sku')
                ->orderByDesc($orderBy)
                ->limit($limit)
                ->get();

            // Calcular % del total
            $totalMetric = $products->sum($orderBy);

            return $products->map(function ($product) use ($totalMetric, $orderBy) {
                return [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'image' => $product->image_url ? Storage::disk('public')->url($product->image_url) : null,
                    'sku' => $product->sku,
                    'total_sold' => (float) $product->total_sold,
                    'total_revenue' => (float) $product->total_revenue,
                    'total_points' => (float) $product->total_points,
                    'percentage_of_total' => $totalMetric > 0
                        ? round(($product->$orderBy / $totalMetric) * 100, 1)
                        : 0,
                ];
            })->values()->all();
        });
    }

    /**
     * Comparativa entre vendedores (ranking)
     * 
     * Scope: Admin (global), Distributor (su red)
     */
    public function getSellersComparison(
        ?int $campaignId = null,
        ?int $distributorId = null,
        int $limit = 0, // 0 significa sin limite
        ?int $cycleId = null
    ): array {
        $cacheKey = "analytics:sellers_comparison_v3:{$campaignId}:{$distributorId}:{$limit}:{$cycleId}";

        return Cache::remember($cacheKey, now()->addMinutes(15), function ()
        use ($campaignId, $distributorId, $limit, $cycleId) {

            $campaign = $campaignId
                ? Campaign::find($campaignId)
                : Campaign::current()->first();

            if (!$campaign) {
                return [];
            }

            $activeCycle = $cycleId 
                ? \App\Models\RedemptionCycle::find($cycleId)
                : \App\Models\RedemptionCycle::current()->where('campaign_id', $campaign->id)->first();
            
            $cycleStartDate = $activeCycle ? \Carbon\Carbon::parse($activeCycle->start_date) : now()->startOfMonth();
            $cycleEndDate = $activeCycle ? \Carbon\Carbon::parse($activeCycle->end_date) : now()->endOfMonth();
            
            $cycleDays = $cycleStartDate->diffInDays($cycleEndDate) + 1;
            $daysInMonth = $cycleStartDate->daysInMonth;

            // Para el ranking global, si el ciclo esta definido, usar sus fechas, si no, usar campaña.
            $startDate = $activeCycle ? $cycleStartDate : $campaign->start_date;
            $endDate = $activeCycle ? $cycleEndDate : $campaign->end_date;

            $currentSalesSubquery = DB::table('sale_items')
                ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
                ->selectRaw('COALESCE(SUM(sale_items.quantity), 0)')
                ->whereColumn('sales.seller_id', 'sellers.id')
                ->whereBetween('sales.sale_date', [
                    $startDate,
                    $endDate
                ]);

            $currentMonthSalesSubquery = DB::table('sale_items')
                ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
                ->selectRaw('COALESCE(SUM(sale_items.quantity), 0)')
                ->whereColumn('sales.seller_id', 'sellers.id')
                ->whereBetween('sales.sale_date', [
                    $cycleStartDate,
                    $cycleEndDate
                ]);

            $query = DB::table('point_transactions')
                ->join('sellers', 'sellers.id', '=', 'point_transactions.seller_id')
                ->join('users', 'users.id', '=', 'sellers.user_id')
                ->join('distributors', 'distributors.id', '=', 'sellers.distributor_id')
                ->join('sales', 'sales.id', '=', 'point_transactions.sale_id')
                ->select(
                    'sellers.id as seller_id',
                    'users.username as seller_name',
                    'users.avatar',
                    'sellers.employee_code',
                    'sellers.average_monthly_sales',
                    'distributors.company_name as distributor_name',
                    'distributors.growth_percentage',
                    DB::raw('SUM(point_transactions.amount) as total_points')
                )
                ->selectSub($currentSalesSubquery, 'current_sales')
                ->selectSub($currentMonthSalesSubquery, 'current_month_sales')
                ->where('point_transactions.type', 'sale_earned')
                ->whereBetween('sales.sale_date', [
                    $startDate,
                    $endDate
                ])
                ->whereNull('sellers.deleted_at')
                ->groupBy(
                    'sellers.id', 
                    'users.avatar', 
                    'users.username', 
                    'sellers.employee_code', 
                    'sellers.average_monthly_sales',
                    'distributors.company_name',
                    'distributors.growth_percentage'
                )
                ->having('total_points', '>=', 1);

            if ($distributorId) {
                $query->where('sellers.distributor_id', $distributorId);
            }

            if ($limit > 0) {
                $query->limit($limit);
            }

            $sellers = $query->orderByDesc('total_points')->get();

            return $sellers->map(function ($seller, $index) use ($cycleDays, $daysInMonth) {
                $promedio = (float) $seller->average_monthly_sales;
                $crecimiento = (float) $seller->growth_percentage;
                
                if ($cycleDays >= 28 && $cycleDays <= 32) {
                    $base = $promedio;
                } else {
                    $base = ($promedio / $daysInMonth) * $cycleDays;
                }
                
                $targetAverage = round($base * (1 + ($crecimiento / 100)), 2);

                return [
                    'rank' => $index + 1,
                    'seller_id' => $seller->seller_id,
                    'seller_name' => $seller->seller_name,
                    'avatar' => app(ImageService::class)->thumbUrl($seller->avatar, 'avatar'),
                    'employee_code' => $seller->employee_code,
                    'distributor_name' => $seller->distributor_name,
                    'total_points' => (int) $seller->total_points,
                    'average_monthly_sales' => $promedio,
                    'target_average' => $targetAverage,
                    'current_sales' => (float) $seller->current_sales,
                    'current_month_sales' => (float) $seller->current_month_sales,
                ];
            })->values()->all();
        });
    }

    /**
     * Ventas por distribuidor (solo para Admin)
     */
    public function getSalesByDistributor(?int $campaignId = null, ?int $cycleId = null): array
    {
        $cacheKey = "analytics:sales_by_distributor:{$campaignId}:{$cycleId}";

        return Cache::remember($cacheKey, now()->addMinutes(20), function () use ($campaignId, $cycleId) {
            $campaign = $campaignId
                ? Campaign::find($campaignId)
                : Campaign::current()->first();

            if (!$campaign) {
                return [];
            }

            $query = DB::table('sales')
                ->join('sellers', 'sellers.id', '=', 'sales.seller_id')
                ->join('distributors', 'distributors.id', '=', 'sellers.distributor_id')
                ->select(
                    'distributors.id as distributor_id',
                    'distributors.company_name',
                    DB::raw('SUM(sales.total_amount) as total_sales'),
                    DB::raw('COUNT(DISTINCT sellers.id) as active_sellers'),
                    DB::raw('COUNT(sales.id) as total_transactions')
                );
            if ($cycleId) {
                $cycle = \App\Models\RedemptionCycle::find($cycleId);
                if ($cycle) {
                    $query->whereBetween('sales.sale_date', [
                        $cycle->start_date,
                        $cycle->end_date
                    ]);
                }
            } else {
                $query->whereBetween('sales.sale_date', [
                    $campaign->start_date,
                    $campaign->end_date
                ]);
            }
            
            $results = $query->whereNull('distributors.deleted_at')
                ->groupBy('distributors.id', 'distributors.company_name')
                ->orderByDesc('total_sales')
                ->get();

            $totalSales = $results->sum('total_sales');

            return $results->map(function ($dist) use ($totalSales) {
                return [
                    'distributor_id' => $dist->distributor_id,
                    'distributor_name' => $dist->company_name,
                    'total_sales' => (float) $dist->total_sales,
                    'active_sellers' => (int) $dist->active_sellers,
                    'total_transactions' => (int) $dist->total_transactions,
                    'percentage' => $totalSales > 0
                        ? round(($dist->total_sales / $totalSales) * 100, 1)
                        : 0,
                ];
            })->values()->all();
        });
    }

    /**
     * Helper: determina el estado según el porcentaje
     */
    private function getStatusFromPercentage(float $percentage): string
    {
        return match (true) {
            $percentage >= 100 => 'achieved',
            $percentage >= 75 => 'on_track',
            $percentage >= 50 => 'at_risk',
            default => 'critical',
        };
    }
}
