<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\Dashboard\DashboardFilterRequest;
use App\Http\Resources\V1\Analytics\SellerRankingResource;
use App\Services\Analytics\AdoptionAnalyticsService;
use App\Services\Analytics\EconomyAnalyticsService;
use App\Services\Analytics\RewardAnalyticsService;
use App\Services\Analytics\SalesAnalyticsService;

class AdminDashboardController extends ApiController
{
    public function __construct(
        protected SalesAnalyticsService $salesAnalytics,
        protected RewardAnalyticsService $rewardAnalytics,
        protected EconomyAnalyticsService $economyAnalytics,
        protected AdoptionAnalyticsService $adoptionAnalytics
    ) {}

    /**
     * GET /api/v1/admin/dashboard/overview
     * 
     * Pantalla principal del dashboard.
     * Retorna KPIs críticos + gráficos rápidos.
     */
    public function overview(DashboardFilterRequest $request)
    {
        $campaignId = $request->user()->isLogistics()
            ? null
            : $request->input('campaignId');
        $distributorId = $request->input('distributorId');

        // KPIs principales
        $salesVsGoals = $this->salesAnalytics->getSalesVsGoals($campaignId, $distributorId);
        $economyOverview = $this->economyAnalytics->getPointsEconomy($campaignId, $distributorId);
        $adoptionRate = $this->adoptionAnalytics->getUserActivityRate($distributorId);
        $claimsFunnel = $this->rewardAnalytics->getClaimsFunnel($campaignId, $distributorId);

        $monthlyEvolution = $this->economyAnalytics->getMonthlyEvolution($campaignId, $distributorId);

        // Top 5 vendedores para leaderboard
        $topSellers = $this->salesAnalytics->getSellersComparison($campaignId, $distributorId, 5);

        $data = [
            // Fila 1: KPIs
            'kpis' => [
                'sales_vs_goals' => [
                    'current_sales' => $salesVsGoals['current_sales'],
                    'goal' => $salesVsGoals['goal'],
                    'percentage' => $salesVsGoals['percentage'],
                    'status' => $salesVsGoals['status'],
                ],
                'circulating_debt' => [
                    'total_points' => $economyOverview['circulating_debt'],
                    'status' => $economyOverview['status'],
                ],
                'adoption_rate' => [
                    'percentage' => $adoptionRate['adoption_rate'],
                    'active_users' => $adoptionRate['active_users'],
                    'total_users' => $adoptionRate['total_users'],
                    'status' => $adoptionRate['status'],
                ],
                'claims_funnel' => [
                    'pending' => $claimsFunnel['pending'],
                    'approved' => $claimsFunnel['approved'],
                    'shipped' => $claimsFunnel['shipped'],
                    'delivered' => $claimsFunnel['delivered'],
                ],
            ],

            'charts' => [
                'monthly_evolution' => $monthlyEvolution,
            ],

            'leaderboard' => $topSellers
        ];

        $camelData = $this->camel(json_decode(json_encode($data), true));

        return $this->successResponse('Overview del dashboard obtenido exitosamente.', $camelData);
    }

    /**
     * GET /api/v1/admin/dashboard/sales
     * 
     * Análisis detallado de rendimiento de ventas.
     * Incluye ranking completo, ventas por distribuidor, top productos.
     */
    public function salesPerformance(DashboardFilterRequest $request)
    {
        $campaignId = $request->user()->isLogistics()
            ? null
            : $request->input('campaignId');
        $distributorId = $request->input('distributorId');
        $cycleId = $request->input('cycleId');
        $limit = $request->integer('limit', 0);

        $data = [
            // Filtros aplicados (para mostrar en UI)
            'filters' => [
                'campaign_id' => $campaignId,
                'cycle_id' => $cycleId,
                'distributor_id' => $distributorId,
            ],

            // Ranking completo de vendedores
            'sellers_ranking' => SellerRankingResource::collection(
                $this->salesAnalytics->getSellersComparison($campaignId, $distributorId, $limit, $cycleId)
            ),

            // Ventas por distribuidor (solo si no hay filtro de distribuidor)
            'sales_by_distributor' => $distributorId
                ? null
                : $this->salesAnalytics->getSalesByDistributor($campaignId, $cycleId),

            // Top productos
            'top_products' => $this->salesAnalytics->getTopProducts(20, $campaignId, $distributorId, 'revenue', $cycleId),
        ];

        $camelData = $this->camel(json_decode(json_encode($data), true));

        return $this->successResponse('Rendimiento de ventas obtenido exitosamente.', $camelData);
    }

    /**
     * GET /api/v1/admin/dashboard/sales/export
     * 
     * Exporta el ranking de vendedores a Excel.
     */
    public function exportSalesPerformance(DashboardFilterRequest $request)
    {
        $campaignId = $request->user()->isLogistics()
            ? null
            : $request->input('campaignId');
        $distributorId = $request->input('distributorId');

        $fileName = 'Ranking_Vendedores_' . date('Y_m_d_His') . '.xlsx';

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\Analytics\SellersRankingExport($campaignId, $distributorId),
            $fileName
        );
    }

    /**
     * GET /api/v1/admin/dashboard/sales/validation-export
     * 
     * Exporta el reporte de validación de ventas a Excel.
     */
    public function exportValidationReport(DashboardFilterRequest $request)
    {
        $campaignId = $request->user()->isLogistics()
            ? null
            : $request->input('campaignId');
        $distributorId = $request->input('distributorId');

        $fileName = 'Validacion_Ventas_' . date('Y_m_d_His') . '.xlsx';

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\Analytics\ValidationReportExport($campaignId, $distributorId),
            $fileName
        );
    }

    // ========================================================================
    // PANTALLA 3: 🎁 ECONOMÍA Y RECOMPENSAS
    // ========================================================================

    /**
     * GET /api/v1/admin/dashboard/economy-rewards
     * 
     * Tesorería del programa: puntos, canjes, premios.
     */
    public function economySummary(DashboardFilterRequest $request)
    {
        $campaignId = $request->user()->isLogistics()
            ? null
            : $request->input('campaignId');
        $distributorId = $request->input('distributorId');

        $economyOverview = $this->economyAnalytics->getPointsEconomy($campaignId, $distributorId);
        $claimsFunnel = $this->rewardAnalytics->getClaimsFunnel($campaignId, $distributorId);

        $data = [
            // Tarjetas Superiores (KPIs)
            'kpis' => [
                'balance_total' => [
                    'value' => $economyOverview['circulating_debt']
                ],
                'canjes_hoy' => [
                    'value' => $this->rewardAnalytics->getTodayClaimsCount($distributorId)
                ],
                'pendientes' => [
                    'value' => $claimsFunnel['pending']
                ],
                'tasa_quema' => [
                    'percentage' => $economyOverview['redemption_rate'],
                    'trend' => $economyOverview['trend']['vs_previous_campaign'] ?? 0,
                ],
            ],

            // Gráfico Central (Lunes a Domingo)
            'ecosystem_balance' => $this->economyAnalytics->getWeeklyEvolution($distributorId),

            // Lista Derecha (Top 4)
            'top_rewards' => $this->rewardAnalytics->getTopRewards(4, $campaignId, $distributorId),

            // Gráfico Inferior Izquierdo
            'claims_by_cycle' => $this->rewardAnalytics->getClaimsVolumeByCycle($campaignId, $distributorId),

            // Tabla Inferior Derecha (Últimos 5 canjes rápidos)
            'recent_claims' => $this->rewardAnalytics->getRecentClaims(5, $distributorId),
        ];

        $camelData = $this->camel(json_decode(json_encode($data), true));

        return $this->successResponse('Economía y recompensas obtenidas exitosamente.', $camelData);
    }

    /**
     * GET /api/v1/admin/dashboard/adoption-gamification
     */
    public function adoptionSummary(DashboardFilterRequest $request)
    {
        $campaignId = $request->user()->isLogistics()
            ? null
            : $request->input('campaignId');
        $distributorId = $request->input('distributorId');

        $data = [
            // Para tu Gráfico 1 (Dona)
            'activity_rate' => $this->adoptionAnalytics->getUserActivityRate($distributorId, 30),

            // Para Gráfico 2 (Barras/Medidor)
            'campaign_participation' => $this->adoptionAnalytics->getCampaignParticipation($campaignId, $distributorId),

            // Para Tarjetas KPIs (Métricas de gamificación)
            'engagement' => $this->adoptionAnalytics->getEngagementScore($distributorId),

            // 
            'top_engaged_sellers' => $this->salesAnalytics->getSellersComparison($campaignId, $distributorId, 10),
        ];

        return $this->successResponse(
            'Métricas de adopción y engagement obtenidas.',
            $this->camel(json_decode(json_encode($data), true))
        );
    }
}
