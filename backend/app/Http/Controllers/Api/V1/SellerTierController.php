<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\SellerTier\StoreSellerTierRequest;
use App\Http\Requests\Api\V1\SellerTier\UpdateSellerTierRequest;
use App\Http\Resources\V1\Seller\SellerTierResource;
use App\Models\SellerTier;
use App\Services\Seller\SellerTierService;
use Illuminate\Http\Request;

class SellerTierController extends ApiController
{
    public function __construct(
        protected SellerTierService $tierService
    ) {}
    
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $per_page = $request->query('per_page', 15);
        $page = $request->query('page', 1);

        $query = SellerTier::withCount('sellers')
            ->with('distributor');

        // Filtro por distribuidor
        if ($request->filled('distributor_id')) {
            $query->forDistributor($request->query('distributor_id'));
        }

        $tiers = $query->ordered()
            ->paginate($per_page, ['*'], 'page', $page);


        $paginatedData = SellerTierResource::collection($tiers)->response()->getData(true);

        return $this->successResponse(
            'Tiers obtenidos exitosamente.',
            $paginatedData
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSellerTierRequest $request)
    {
        $validatedData = $request->validated();

        $tier = SellerTier::create($validatedData);

        $this->tierService->recalculateAllTiers();

        return $this->successResponse('Rango creado exitosamente', new SellerTierResource($tier), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(SellerTier $sellerTier)
    {
        $sellerTier->loadCount('sellers');
        return $this->successResponse('Rango obtenido exitosamente', new SellerTierResource($sellerTier));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSellerTierRequest $request, SellerTier $sellerTier)
    {
        $validatedData = $request->validated();

        $sellerTier->update($validatedData);

        $this->tierService->recalculateAllTiers();

        return $this->successResponse('Rango actualizado exitosamente', new SellerTierResource($sellerTier));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SellerTier $tier)
    {
        $tier->delete();

        $this->tierService->recalculateAllTiers();

        return $this->successResponse('Rango eliminado exitosamente');
    }

    public function recalculate()
    {
        $stats = $this->tierService->recalculateAllTiers();
        return $this->successResponse('Rangos recalculados', $stats);
    }
}
