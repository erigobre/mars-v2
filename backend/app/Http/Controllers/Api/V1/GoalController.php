<?php

namespace App\Http\Controllers\Api\V1;

use App\Filters\GoalFilter;
use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\Goal\StoreGoalRequest;
use App\Http\Requests\Api\V1\Goal\UpdateGoalRequest;
use App\Http\Resources\V1\Goal\GoalProgressResource;
use App\Http\Resources\V1\Goal\GoalResource;
use App\Models\Goal;
use App\Models\RedemptionCycle;
use App\Models\SellerGoalProgress;
use App\Services\Goal\GoalProgressService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GoalController extends ApiController
{
    public function __construct(
        protected GoalProgressService $goalProgressService
    ) {}

    /**
     * GET /api/v1/admin/goals
     *
     * Lista todas las metas. Filtros opcionales: ?cycle_id=&is_active=&type=
     */
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 20); // Paginación dinámica

        $filter = new GoalFilter();
        $queryItems = $filter->transform($request);

        $goals = Goal::with(['cycle', 'product', 'display']) // Eager loading
            ->withCount('progresses')                        // Conteo de relaciones
            ->where($queryItems)                             // Filtros aplicados automáticamente
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $paginatedData = GoalResource::collection($goals)->response()->getData(true);

        return $this->successResponse('Metas obtenidas exitosamente.', $paginatedData);
    }

    /**
     * POST /api/v1/admin/goals
     */
    public function store(StoreGoalRequest $request)
    {
        // Verificar que el ciclo exista y esté activo
        $cycle = RedemptionCycle::findOrFail($request->cycle_id);

        $goal = Goal::create([
            'cycle_id'      => $cycle->id,
            'name'          => $request->name,
            'description'   => $request->description,
            'type'          => $request->type,
            'target_value'  => $request->target_value,
            'reward_points' => $request->reward_points,
            'is_active'     => $request->boolean('is_active', true),
            'product_id'    => $request->product_id,
            'display_id'    => $request->display_id,
        ]);

        return $this->created(
            new GoalResource($goal->load(['cycle', 'product', 'display'])),
            'Meta creada exitosamente.'
        );
    }

    /**
     * GET /api/v1/admin/goals/{goal}
     */
    public function show(Goal $goal)
    {
        $goal->load(['cycle', 'product', 'display']);
        $goal->loadCount('progresses');

        return $this->successResponse(
            'Meta obtenida exitosamente.',
            new GoalResource($goal)
        );
    }

    /**
     * PUT /api/v1/admin/goals/{goal}
     *
     * Si se cambia target_value, se re-evalúa el campo `reached`
     * para todos los vendedores con progreso en esta meta.
     * Los bonos ya otorgados (bonus_awarded = true) NO se retiran.
     */
    public function update(UpdateGoalRequest $request, Goal $goal)
    {
        $targetChanged = false;

        DB::transaction(function () use ($request, $goal, &$targetChanged) {
            $goal->update($request->validated());

            $targetChanged = $goal->wasChanged('target_value');

            if ($targetChanged) {
                $this->goalProgressService->reEvaluateGoal($goal); 
            }
        });

        $goal->load(['cycle', 'product', 'display']);

        $message = 'Meta actualizada exitosamente.' . 
                   ($targetChanged ? ' Se recalculó el progreso de los vendedores en segundo plano.' : '');

        return $this->successResponse($message, [
            'target_changed' => $targetChanged,
            'data'           => new GoalResource($goal)
        ]);
    }

    /**
     * DELETE /api/v1/admin/goals/{goal}  (soft delete)
     */
    public function destroy(Goal $goal)
    {
        $goal->delete();

        return response()->json(['message' => 'Meta eliminada correctamente.']);
    }

    /**
     * GET /api/v1/admin/goals/{goal}/progresses
     *
     * Ve el progreso de todos los vendedores en una meta específica.
     * Útil para el admin para monitorear quién va bien.
     */
    public function progresses(Goal $goal)
    {
        $progresses = SellerGoalProgress::where('goal_id', $goal->id)
            ->with(['goal', 'seller.user'])
            ->orderByDesc('current_value')
            ->paginate(50);

        return $this->successResponse(
            'Progreso obtenido exitosamente.',
            GoalProgressResource::collection($progresses)->response()->getData(true)
        );
    }

    /**
     * GET /api/v1/distributor/goals
     *
     * Incluye conteo y progreso de sus vendedores.
     */
    public function distributorIndex(Request $request)
    {
        $distributor = $request->user()->distributor;

        $activeCycles = RedemptionCycle::current()->pluck('id');

        // 2. Consultar las metas con los conteos filtrados por distribuidor
        $goals = Goal::whereIn('cycle_id', $activeCycles) // Ojo: usa el nombre real de tu columna
            ->where('is_active', true)
            ->with(['cycle', 'product', 'display'])
            ->withCount([

                'progresses' => function ($query) use ($distributor) {
                    $query->whereHas('seller', function ($sellerQuery) use ($distributor) {
                        $sellerQuery->where('distributor_id', $distributor->id);
                    });
                },
                
                'progresses as reached_count' => function ($query) use ($distributor) {
                    $query->where('reached', true)
                          ->whereHas('seller', function ($sellerQuery) use ($distributor) {
                              $sellerQuery->where('distributor_id', $distributor->id);
                          });
                },
            ])
            ->get();

        return $this->successResponse(
            'Metas del ciclo activo obtenidas exitosamente.',
            GoalResource::collection($goals)->resolve()
        );
    }

    /**
     * GET /api/v1/seller/goals
     *
     * Devuelve el progreso personal del vendedor en las metas del ciclo activo.
     * Si aún no tiene progreso en una meta, lo incluye con current_value = 0
     * para que el frontend sepa qué metas hay y cuáles no ha empezado.
     */
    public function sellerGoals(Request $request)
    {
        $seller = $request->user()->seller;

        // Ciclo activo que cubre la fecha actual
        $cycle = RedemptionCycle::current()->first();

        if (!$cycle) {
            return $this->notFound('No hay un ciclo activo en este momento.');
        }

        // Todas las metas activas del ciclo
        $goals = Goal::where('cycle_id', $cycle->id)
            ->active()
            ->with(['product', 'display', 'cycle'])
            ->get();

        // Progresos existentes del vendedor, indexados por goal_id
        $existingProgresses = SellerGoalProgress::where('seller_id', $seller->id)
            ->whereIn('goal_id', $goals->pluck('id'))
            ->with('goal')
            ->get()
            ->keyBy('goal_id');

        // Para metas sin progreso aún, construir un objeto "vacío" en memoria
        $result = $goals->map(function (Goal $goal) use ($existingProgresses, $seller) {
            if ($existingProgresses->has($goal->id)) {
                return new GoalProgressResource($existingProgresses->get($goal->id));
            }

            // Progreso virtual: vendedor no ha aportado nada aún
            $virtualProgress = new SellerGoalProgress([
                'goal_id'       => $goal->id,
                'seller_id'     => $seller->id,
                'current_value' => 0,
                'reached'       => false,
                'bonus_awarded' => false,
                'reached_at'    => null,
            ]);
            $virtualProgress->setRelation('goal', $goal);

            return new GoalProgressResource($virtualProgress);
        });

        return $this->successResponse('Progreso de metas obtenido exitosamente.', [
            'cycle' => [
                'id'         => $cycle->id,
                'name'       => $cycle->name,
                'start_date' => $cycle->start_date?->toISOString(),
                'end_date'   => $cycle->end_date?->toISOString(),
            ],
            'items' => GoalProgressResource::collection($result)->resolve(), 
        ]);
    }
}
