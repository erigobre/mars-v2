<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\Reward\StoreRewardRequest;
use App\Http\Requests\Api\V1\Reward\UpdateRewardRequest;
use App\Http\Resources\V1\Reward\RewardResource;
use App\Http\Resources\V1\Reward\RewardTierPriceResource;
use App\Models\Reward;
use App\Services\Reward\RewardService;
use Illuminate\Http\Request;

class RewardController extends ApiController
{
    public function __construct(private RewardService $rewardService) {}
    /**
     * GET /api/v1/rewards
     * Vendedores ven solo premios activos con stock.
     * Admins ven todos.
     */
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 20);

        $query = $this->rewardService->getListQuery($request);
        $categories = $this->rewardService->getCategories();

        $rewards = $query->paginate($perPage);
        $paginatedData = RewardResource::collection($rewards)->response()->getData(true);

        return $this->successResponse('Premios obtenidos exitosamente.', [
            'categories' => $categories,
            'items'      => $paginatedData['data'],
            'meta'       => $paginatedData['meta'],
            'links'      => $paginatedData['links'],
        ]);
    }

    /**
     * POST /api/v1/admin/rewards
     */
    public function store(StoreRewardRequest $request)
    {
        try {
            $reward = Reward::create($request->validated());

            if ($request->hasFile('image')) {
                $reward->uploadImage($request->file('image'));
            }

            if ($reward->base_cost) {
                $this->rewardService->applyBulkPricesToReward($reward);
            }

            return $this->created(
                new RewardResource($reward),
                'Premio creado exitosamente.'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/v1/rewards/{reward}
     */
    public function show(Reward $reward, Request $request)
    {
        $user = $request->user();
 
        if ($user->isAdmin()) {
            $reward->load(['claims', 'tierPrices.sellerTier']);
        }
 
        if ($user->isSeller() && $user->seller) {
            $reward->load('tierPrices');
            $reward->dynamic_price = $reward->getPriceForSeller($user->seller);
        }
 
        return $this->successResponse('Premio obtenido exitosamente.', new RewardResource($reward));
    }

    /**
     * PUT /api/v1/admin/rewards/{reward}
     */
    public function update(UpdateRewardRequest $request, Reward $reward)
    {
        try {
            $oldBaseCost = $reward->base_cost;
            $reward->update($request->validated());

            if ($request->hasFile('image')) {
                $reward->uploadImage($request->file('image'));
            }

            // Si el costo base cambió, aplicamos los precios de la matriz automáticamente
            if ($reward->base_cost && $reward->base_cost !== $oldBaseCost) {
                $this->rewardService->applyBulkPricesToReward($reward);
            }

            return $this->successResponse(
                'Premio actualizado exitosamente.',
                new RewardResource($reward->fresh())
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/v1/admin/rewards/{reward}
     */
    public function destroy(Reward $reward)
    {
        try {
            if ($reward->claims()->exists()) {
                return $this->errorResponse(
                    'No se puede eliminar un premio con canjes registrados.',
                    409
                );
            }

            $reward->deleteImage();
            $reward->delete();

            return $this->deleted('Premio eliminado exitosamente.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function tierPrices(Reward $reward)
    {
        $data = $this->rewardService->getPricesPerTier($reward);
 
        return $this->successResponse(
            'Precios por rango obtenidos exitosamente.', 
            RewardTierPriceResource::collection($data)
        );
    }

    /**
     * POST /api/v1/admin/rewards/{reward}/tier-prices
     */
    public function updateTierPrices(Request $request, Reward $reward)
    {
        $request->validate([
            'prices'           => 'present|array',
            'prices.*.tier_id' => 'required|exists:seller_tiers,id',
            'prices.*.price'   => 'required|integer|min:0',
        ]);

        try {
            $this->rewardService->syncTierPrices($reward, $request->input('prices'));

            return $this->successResponse(
                'Configuración de precios actualizada.',
                RewardTierPriceResource::collection($reward->fresh()->tierPrices)
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}
