<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CampaignStatus;
use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\Campaign\StoreCampaignRequest;
use App\Http\Requests\Api\V1\Campaign\UpdateCampaignRequest;
use App\Http\Resources\V1\Campaign\CampaignResource;
use App\Http\Resources\V1\Ranking\RankingResource;
use App\Models\Campaign;
use App\Models\RedemptionCycle;
use App\Services\Campaign\CampaignService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CampaignController extends ApiController
{

    public function __construct(protected CampaignService $campaignService) {}

    public function index(Request $request)
    {
        $perPage  = $request->integer('per_page', 15);
        $user     = $request->user();
        $roleSlug = $user->role->slug;

        $query = Campaign::withCount('cycles');

        // Vendedores/distribuidores solo ven campañas activas
        if ($roleSlug !== 'admin') {
            $query->where('is_active', true);
        }

        $campaigns = $query->latest('start_date')->paginate($perPage);

        return $this->successResponse(
            'Campañas obtenidas exitosamente.',
            CampaignResource::collection($campaigns)->response()->getData(true)
        );
    }

    public function store(StoreCampaignRequest $request)
    {
        try {
            $campaign = $this->campaignService->create($request->validated());

            return $this->created(
                new CampaignResource($campaign),
                'Campaña creada exitosamente.'
                    . ($request->boolean('auto_generate')
                        ? ' Se generaron los ciclos y ventanas de canje automáticamente.'
                        : '')
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function show(Campaign $campaign)
    {
        $campaign->load('cycles.windows');

        return $this->successResponse(
            'Campaña obtenida exitosamente.',
            new CampaignResource($campaign)
        );
    }

    public function update(UpdateCampaignRequest $request, Campaign $campaign)
    {
        try {
            $updated = $this->campaignService->update($campaign, $request->validated());

            return $this->successResponse(
                'Campaña actualizada exitosamente.',
                new CampaignResource($updated)
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function changeStatus(Request $request, Campaign $campaign)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(CampaignStatus::class)],
        ]);

        try {
            $statusEnum = CampaignStatus::from($validated['status']);
            $updated = $this->campaignService->changeStatus($campaign, $statusEnum);

            return $this->successResponse(
                "Campaña actualizada a estatus: {$statusEnum->label()}.",
                new CampaignResource($updated)
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function destroy(Campaign $campaign)
    {
        try {
            $this->campaignService->delete($campaign);

            return $this->deleted('Campaña eliminada exitosamente.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function close(Request $request, Campaign $campaign)
    {
        $top = $request->integer('top', 10);

        try {
            $result  = $this->campaignService->close($campaign, $top);
            $ranking = $result['ranking'];

            return $this->successResponse(
                "Campaña '{$campaign->name}' cerrada. Ranking top-{$top} guardado.",
                [
                    'campaign' => new CampaignResource($result['campaign']),
                    'ranking'  => $ranking->map(fn($r) => [
                        'rank'          => $r['rank'],
                        'sellerId'      => $r['seller_id'],
                        'sellerName'    => $r['seller_name'],
                        'employeeCode'  => $r['employee_code'],
                        'totalPoints'   => $r['total_points'],
                    ]),
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function ranking(Request $request, Campaign $campaign)
    {
        $user     = $request->user();
        $roleSlug = $user->role->slug;
        $limit    = $request->integer('limit', 0);

        $distributorId = match ($roleSlug) {
            'seller'      => $user->seller?->distributor_id,
            'distributor' => $user->distributor?->id,
            'admin'       => $request->integer('distributor_id') ?: null,
            default       => null,
        };

        $ranking = $this->campaignService->getRanking($campaign, $distributorId, $limit);

        $scope = match ($roleSlug) {
            'seller', 'distributor' => 'distribuidor',
            default => $distributorId ? 'distribuidor' : 'global',
        };

        return $this->successResponse('Ranking obtenido exitosamente.', [
            'campaign' => [
                'id'        => $campaign->id,
                'name'      => $campaign->name,
                'startDate' => $campaign->start_date?->toISOString(),
                'endDate'   => $campaign->end_date?->toISOString(),
            ],
            'scope'   => $scope,        // 'global' | 'distribuidor'
            'ranking' => $ranking->map(fn($r) => [
                'rank'             => $r['rank'],
                'sellerId'         => $r['seller_id'],
                'sellerName'       => $r['seller_name'],
                'employeeCode'     => $r['employee_code'],
                // distributorName solo se expone al admin en vista global
                'distributorName'  => $roleSlug === 'admin' && !$distributorId
                    ? $r['distributor_name']
                    : null,
                'totalPoints'      => $r['total_points'],
            ])->values(),
        ]);
    }

    public function current()
    {
        $campaign = Campaign::current()->with('cycles.windows')->first();

        if (!$campaign) {
            return $this->notFound('No hay una campaña activa en este momento.');
        }

        return $this->successResponse(
            'Campaña actual obtenida exitosamente.',
            new CampaignResource($campaign)
        );
    }

    /**
     * Obtiene el ranking de la campaña actual, con lógica de visibilidad según el rol del usuario:
     * Posibles respuestas:
     * - Si no hay campaña activa: 404 con mensaje "No hay una campaña activa en este momento."
     * - Si el usuario no es admin/logistics y el ranking no ha sido generado/publicado: 200 con mensaje "El ranking global de la campaña aún no ha sido generado o publicado." y ranking vacío.
     * - Si el ranking se obtiene exitosamente: 200 con mensaje "Ranking global de la campaña obtenido exitosamente." y datos del ranking según el alcance (global o distribuidor).
     */
    public function currentRanking(Request $request)
    {
        $user     = $request->user();
        $roleSlug = $user->role->slug;
        $limit    = $request->integer('limit', 0);

        $campaign = Campaign::current()->first();

        if (!$campaign) {
            return $this->notFound('No hay una campaña activa en este momento.');
        }

        $distributorId = match ($roleSlug) {
            'seller'      => $user->seller?->distributor_id,
            'distributor' => $user->distributor?->id,
            'admin'       => $request->integer('distributor_id') ?: null,
            'logistics'   => $request->integer('distributor_id') ?: null,
            default       => null,
        };

        $ranking = $this->campaignService->getPersistedCampaignRanking($campaign, $distributorId, $limit);

        $scope = match ($roleSlug) {
            'seller', 'distributor' => 'distribuidor',
            default => $distributorId ? 'distribuidor' : 'global',
        };

        if ($ranking->isEmpty()) {
            if ($user->isAdmin()) {
                return $this->successResponse('El ranking global aún no ha sido generado.', [
                    'campaign'       => new CampaignResource($campaign),
                    'scope'          => $scope,
                    'ranking'        => [],
                    'canGenerate'   => true
                ]);
            }

            // Para los demás usuarios, solo les avisamos que no existe
            return $this->successResponse('El ranking global de la campaña aún no ha sido generado o publicado.', [
                'campaign'       => new CampaignResource($campaign),
                'scope'          => $scope,
                'ranking'        => [],
                'canGenerate'   => false
            ]);
        }

        return $this->successResponse('Ranking global de la campaña obtenido exitosamente.', [
            'campaign' => new CampaignResource($campaign),
            'scope'    => $scope,
            'ranking'  => RankingResource::collection($ranking),
            'canGenerate' => false
        ]);
    }

    public function currentCycleRanking(Request $request)
    {
        $user     = $request->user();
        $roleSlug = $user->role->slug;
        $limit    = $request->integer('limit', 0);

        $campaign = Campaign::current()->first();

        if (!$campaign) {
            return $this->notFound('No hay una campaña activa en este momento.');
        }

        $currentCycle = $campaign->cycles()->current()->first();

        if (!$currentCycle) {
            return $this->notFound('No hay un periodo activo para la fecha actual.');
        }

        $distributorId = match ($roleSlug) {
            'seller'      => $user->seller?->distributor_id,
            'distributor' => $user->distributor?->id,
            'admin'       => $request->integer('distributor_id') ?: null,
            'logistics'   => $request->integer('distributor_id') ?: null,
            default       => null,
        };

        $ranking = $this->campaignService->getPersistedCycleRanking($currentCycle, $distributorId, $limit);

        $scope = match ($roleSlug) {
            'seller', 'distributor' => 'distribuidor',
            default => $distributorId ? 'distribuidor' : 'global',
        };

        $cycleData = [
            'id'        => $currentCycle->id,
            'name'      => $currentCycle->name,
            'startDate' => $currentCycle->start_date?->toISOString(),
            'endDate'   => $currentCycle->end_date?->toISOString(),
        ];

        if ($ranking->isEmpty()) {
            if ($user->isAdmin()) {
                return $this->successResponse('El ranking de este periodo aún no ha sido generado.', [
                    'campaign'    => new CampaignResource($campaign),
                    'cycle'       => $cycleData,
                    'scope'       => $scope,
                    'ranking'     => [],
                    'canGenerate' => true
                ]);
            }

            return $this->successResponse('El ranking de este periodo aún no ha sido generado o publicado.', [
                'campaign'    => new CampaignResource($campaign),
                'cycle'       => $cycleData,
                'scope'       => $scope,
                'ranking'     => [],
                'canGenerate' => false
            ]);
        }

        return $this->successResponse('Ranking del periodo actual obtenido exitosamente.', [
            'campaign' => new CampaignResource($campaign),
            'cycle'    => [
                'id'        => $currentCycle->id,
                'name'      => $currentCycle->name,
                'startDate' => $currentCycle->start_date?->toISOString(),
                'endDate'   => $currentCycle->end_date?->toISOString(),
            ],
            'scope'    => $scope,
            'ranking'  => RankingResource::collection($ranking),
            'canGenerate' => false
        ]);
    }

    public function pastCycleRanking(Request $request, RedemptionCycle $cycle)
    {
        $user     = $request->user();
        $roleSlug = $user->role->slug;
        $limit    = $request->integer('limit', 0);

        $currentCampaign = Campaign::current()->first();

        if (!$currentCampaign || $cycle->campaign_id !== $currentCampaign->id) {
            return $this->notFound('El periodo solicitado no pertenece a la campaña activa.');
        }

        if (Carbon::parse($cycle->start_date)->isFuture()) {
            return $this->forbidden('No puedes consultar el ranking de un periodo que aún no ha comenzado.');
        }

        $distributorId = match ($roleSlug) {
            'seller'      => $user->seller?->distributor_id,
            'distributor' => $user->distributor?->id,
            'admin', 'logistics' => $request->integer('distributor_id') ?: null,
            default       => null,
        };

        $ranking = $this->campaignService->getPersistedCycleRanking($cycle, $distributorId, $limit);

        $scope = match ($roleSlug) {
            'seller', 'distributor' => 'distribuidor',
            default => $distributorId ? 'distribuidor' : 'global',
        };

        return $this->successResponse('Ranking del periodo obtenido exitosamente.', [
            'cycle' => [
                'id'        => $cycle->id,
                'name'      => $cycle->name,
                'startDate' => $cycle->start_date?->toISOString(),
                'endDate'   => $cycle->end_date?->toISOString(),
            ],
            'scope'   => $scope,
            'ranking' => RankingResource::collection($ranking)
        ]);
    }
}
