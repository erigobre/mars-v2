<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Services\Analytics\AdoptionAnalyticsService;
use App\Services\Analytics\RewardAnalyticsService;
use App\Services\Analytics\SalesAnalyticsService;
use Illuminate\Http\Request;

class DistributorDashboardController extends ApiController
{
    public function __construct(
        protected SalesAnalyticsService $salesAnalytics,
        protected RewardAnalyticsService $rewardAnalytics,
        protected AdoptionAnalyticsService $adoptionAnalytics
    ) {}

    /**
     * GET /api/v1/distributor/dashboard/commercial
     * Pantalla 1: Resumen de Ventas (Mi Equipo)
     * Objetivo: Ver cuánto vende la sucursal y quiénes son los mejores empleados.
     */
    public function commercialNetwork(Request $request)
    {
        $distributor = $request->user()->distributor;

        if (!$distributor) {
            return $this->errorResponse('Perfil de distribuidor no encontrado.', 404);
        }

        $data = [
            // Fila 1: Tarjetas Superiores (KPIs rápidos)
            'kpis' => $this->rewardAnalytics->getDistributorRewardsKpis(null, $distributor->id),

            // Fila 2: "Los Mejores de mi Equipo" (Tabla de Ranking)
            'team_ranking' => $this->salesAnalytics->getSellersComparison(null, $distributor->id, 10),

            // Fila 3: "Lo que más estamos vendiendo" (Tarjetas de Productos)
            'top_products' => $this->salesAnalytics->getTopProducts(5, null, $distributor->id, 'quantity'),
        ];

        return $this->successResponse(
            'Resumen comercial de la red obtenido exitosamente.',
            $this->camel(json_decode(json_encode($data), true))
        );
    }

    /**
     * GET /api/v1/distributor/dashboard/rewards
     * Pantalla 2: Seguimiento de Premios (Canjes del Equipo)
     * Objetivo: Dar respuesta a los empleados sobre el estatus de sus regalos.
     */
    public function rewardsNetwork(Request $request)
    {
        $distributor = $request->user()->distributor;

        if (!$distributor) {
            return $this->errorResponse('Perfil de distribuidor no encontrado.', 404);
        }

        $data = [
            // Fila 1: Tarjetas Superiores (KPIs rápidos)
            'kpis' => $this->rewardAnalytics->getDistributorRewardsKpis(null, $distributor->id),

            // Fila 2: "Estado de los Envíos" (Tarjetas con el Embudo)
            // Extrae los datos: pendientes, aprobados, enviados, entregados
            'shipping_status' => $this->rewardAnalytics->getClaimsFunnel(null, $distributor->id),

            // Fila 3: "Historial de Premios del Equipo" (Tabla detallada)
            'recent_claims' => $this->rewardAnalytics->getRecentClaims(15, $distributor->id),
        ];

        return $this->successResponse(
            'Estado de recompensas de la red obtenido exitosamente.',
            $this->camel(json_decode(json_encode($data), true))
        );
    }
}
