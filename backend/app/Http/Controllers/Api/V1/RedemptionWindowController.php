<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\RedemptionWindow\GenerateWindowsRequest;
use App\Http\Requests\Api\V1\RedemptionWindow\StoreRedemptionWindowRequest;
use App\Http\Requests\Api\V1\RedemptionWindow\UpdateRedemptionWindowRequest;
use App\Http\Resources\V1\Redemption\RedemptionWindowResource;
use App\Models\Campaign;
use App\Models\RedemptionCycle;
use App\Models\RedemptionWindow;
use App\Services\Redemption\RedemptionWindowService;

class RedemptionWindowController extends ApiController
{
    public function __construct(protected RedemptionWindowService $windowService)
    {
    }

    /**
     * POST /api/v1/admin/campaigns/{campaign}/cycles/{cycle}/windows
     * Body: { opensAt, closesAt }
     */
    public function store(
        StoreRedemptionWindowRequest $request,
        Campaign                     $campaign,
        RedemptionCycle              $cycle
    ) {
        $this->ensureCycleBelongsToCampaign($cycle, $campaign);

        try {
            $window = $this->windowService->create($cycle, $request->validated());

            return $this->created(
                new RedemptionWindowResource($window),
                'Ventana de canje creada exitosamente.'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * POST /api/v1/admin/campaigns/{campaign}/cycles/{cycle}/windows/generate
     * Body: { replace? }
     * replace = false (default): añade solo las ventanas que aún no existen
     * replace = true           : borra todas las ventanas previas y las regenera
     */
    public function generateWindows(
        GenerateWindowsRequest $request,
        Campaign               $campaign,
        RedemptionCycle        $cycle
    ) {
        $this->ensureCycleBelongsToCampaign($cycle, $campaign);

        try {
            $replace = $request->boolean('replace', false);
            $created = $this->windowService->generateWindows($cycle, $replace);

            $cycle->load('windows');

            return $this->successResponse(
                "{$created} ventana(s) generada(s) exitosamente.",
                [
                    'created' => $created,
                    'windows' => RedemptionWindowResource::collection($cycle->windows),
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * PUT /api/v1/admin/campaigns/{campaign}/cycles/{cycle}/windows/{window}
     */
    public function update(
        UpdateRedemptionWindowRequest $request,
        Campaign                      $campaign,
        RedemptionCycle               $cycle,
        RedemptionWindow              $window
    ) {
        $this->ensureCycleBelongsToCampaign($cycle, $campaign);
        $this->ensureWindowBelongsToCycle($window, $cycle);

        try {
            $updated = $this->windowService->update($window, $request->validated());

            return $this->successResponse(
                'Ventana actualizada exitosamente.',
                new RedemptionWindowResource($updated)
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * DELETE /api/v1/admin/campaigns/{campaign}/cycles/{cycle}/windows/{window}
     */
    public function destroy(
        Campaign        $campaign,
        RedemptionCycle $cycle,
        RedemptionWindow $window
    ) {
        $this->ensureCycleBelongsToCampaign($cycle, $campaign);
        $this->ensureWindowBelongsToCycle($window, $cycle);

        try {
            $this->windowService->delete($window);

            return $this->deleted('Ventana de canje eliminada exitosamente.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 409);
        }
    }

    private function ensureCycleBelongsToCampaign(
        RedemptionCycle $cycle,
        Campaign        $campaign
    ): void {
        if ($cycle->campaign_id !== $campaign->id) {
            abort(404, 'El ciclo no pertenece a esta campaña.');
        }
    }

    private function ensureWindowBelongsToCycle(
        RedemptionWindow $window,
        RedemptionCycle  $cycle
    ): void {
        if ($window->cycle_id !== $cycle->id) {
            abort(404, 'La ventana no pertenece a este ciclo.');
        }
    }
}
