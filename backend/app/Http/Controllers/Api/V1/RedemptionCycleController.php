<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\RedemptionCycle\StoreRedemptionCycleRequest;
use App\Http\Requests\Api\V1\RedemptionCycle\UpdateRedemptionCycleRequest;
use App\Http\Resources\V1\Ranking\RankingResource;
use App\Http\Resources\V1\Redemption\RedemptionCycleResource;
use App\Models\Campaign;
use App\Models\RedemptionCycle;
use App\Services\Campaign\CampaignService;
use App\Services\Redemption\RedemptionCycleService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class RedemptionCycleController extends ApiController
{
    public function __construct(protected RedemptionCycleService $cycleService, protected CampaignService $campaignService) {}

    /**
     * GET /api/v1/admin/campaigns/{campaign}/cycles
     */
    public function index(Campaign $campaign)
    {
        $cycles = $campaign->cycles()
            ->withCount('windows')
            ->with('windows')
            ->orderBy('start_date')
            ->get();

        return $this->successResponse(
            'Ciclos obtenidos exitosamente.',
            RedemptionCycleResource::collection($cycles)
        );
    }

    /**
     * POST /api/v1/admin/campaigns/{campaign}/cycles
     * 
     * Body: { name, startDate, endDate, isActive?, autoGenerateWindows? }
     */
    public function store(StoreRedemptionCycleRequest $request, Campaign $campaign)
    {
        try {
            $cycle = $this->cycleService->create($campaign, $request->validated());

            return $this->created(
                new RedemptionCycleResource($cycle),
                'Ciclo creado exitosamente.'
                    . ($request->boolean('auto_generate_windows')
                        ? ' Ventanas generadas automáticamente.'
                        : '')
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * GET /api/v1/admin/campaigns/{campaign}/cycles/{cycle}
     */
    public function show(Campaign $campaign, RedemptionCycle $cycle)
    {
        $this->ensureCycleBelongsToCampaign($cycle, $campaign);
        $cycle->load('windows');

        return $this->successResponse(
            'Ciclo obtenido exitosamente.',
            new RedemptionCycleResource($cycle)
        );
    }

    /**
     * PUT /api/v1/admin/campaigns/{campaign}/cycles/{cycle}
     */
    public function update(
        UpdateRedemptionCycleRequest $request,
        Campaign                     $campaign,
        RedemptionCycle              $cycle
    ) {
        $this->ensureCycleBelongsToCampaign($cycle, $campaign);

        try {
            $updated = $this->cycleService->update($cycle, $request->validated());

            return $this->successResponse(
                'Ciclo actualizado exitosamente.',
                new RedemptionCycleResource($updated)
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * DELETE /api/v1/admin/campaigns/{campaign}/cycles/{cycle}
     */
    public function destroy(Campaign $campaign, RedemptionCycle $cycle)
    {
        $this->ensureCycleBelongsToCampaign($cycle, $campaign);

        try {
            $this->cycleService->delete($cycle);

            return $this->deleted('Ciclo eliminado exitosamente.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 409);
        }
    }

    public function ranking(Request $request, Campaign $campaign, RedemptionCycle $cycle)
    {
        $this->ensureCycleBelongsToCampaign($cycle, $campaign);

        $limit = $request->integer('limit', 0);
        $distributorId = $request->integer('distributor_id') ?: null;

        $ranking = $this->campaignService->getPersistedCycleRanking($cycle, $distributorId, $limit);

        return $this->successResponse('Ranking del ciclo obtenido exitosamente.', RankingResource::collection($ranking));
    }

    public function generateRankings(Campaign $campaign, RedemptionCycle $cycle)
    {
        $this->ensureCycleBelongsToCampaign($cycle, $campaign);

        try {
            $this->cycleService->snapshotCycleRanking($cycle);

            return $this->successResponse(
                "Ranking para el ciclo '{$cycle->name}' generado/actualizado correctamente."
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Error al generar el ranking: ' . $e->getMessage(), 500);
        }
    }

    public function validCycles()
    {
        $campaign = Campaign::current()->first();

        if (!$campaign) {
            return $this->notFound('No hay una campaña activa en este momento.');
        }

        $cycles = $campaign->cycles()
            ->where('start_date', '<=', Carbon::now())
            ->orderBy('start_date', 'desc')
            ->get();

        return $this->successResponse('Periodos obtenidos exitosamente.', RedemptionCycleResource::collection($cycles));
    }

    private function ensureCycleBelongsToCampaign(
        RedemptionCycle $cycle,
        Campaign        $campaign
    ): void {
        if ($cycle->campaign_id !== $campaign->id) {
            abort(404, 'El ciclo no pertenece a esta campaña.');
        }
    }
}
