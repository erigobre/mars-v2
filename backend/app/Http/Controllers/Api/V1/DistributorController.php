<?php

namespace App\Http\Controllers\Api\V1;

use App\Filters\DistributorFilter;
use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\Distributor\StoreDistributorRequest;
use App\Http\Requests\Api\V1\Distributor\UpdateDistributorRequest;
use App\Http\Resources\V1\Distributor\DistributorCollection;
use App\Http\Resources\V1\Distributor\DistributorResource;
use App\Http\Resources\V1\Distributor\PublicDistributorResource;
use App\Models\Distributor;
use App\Services\Distributor\DistributorService;
use Illuminate\Http\Request;

class DistributorController extends ApiController
{

    public function __construct(protected DistributorService $distributorService) {}


    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Distributor::class);

        $search = $request->query('search');
        $perPage = $request->query('per_page', 20);

        $query = Distributor::with('user');

        // Cargar el conteo de vendedores relacionados
        $query->withCount('sellers');

        if($search) $query->globalSearch($search);

        $query->filter(new DistributorFilter());

        $distributors = $query->latest()->paginate($perPage);

        $paginatedData = (new DistributorCollection($distributors))->response()->getData(true);

        return $this->successResponse(
            'Distribuidores obtenidos exitosamente.',
            $paginatedData
        );
    }

    public function publicIndex()
    {
        // Obtenemos solo los distribuidores activos si es necesario
        $distributors = Distributor::whereHas('user', function ($q) {
            $q->where('is_active', true);
        })->get();

        return $this->successResponse(
            'Lista pública de distribuidores obtenida.',
            PublicDistributorResource::collection($distributors)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDistributorRequest $request)
    {
        $this->authorize('create', Distributor::class);

        try {
            $distributor = $this->distributorService->create($request->validated(), $request->file('avatar'));
            return $this->successResponse('Distribuidor creado exitosamente.', new DistributorResource($distributor), 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Distributor $distributor)
    {
        $this->authorize('view', $distributor);
        $distributor->load('user', 'sellers');
        return $this->successResponse('Distribuidor obtenido exitosamente.', new DistributorResource($distributor));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDistributorRequest $request, Distributor $distributor)
    {
        $this->authorize('update', $distributor);
        try {
            $distributor = $this->distributorService->update($distributor, $request->validated(), $request->file('avatar'));

            return $this->successResponse(
                'Distribuidor actualizado exitosamente',
                new DistributorResource($distributor)
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Distributor $distributor)
    {
        $this->authorize('delete', $distributor);

        try {
            $this->distributorService->delete($distributor);

            return $this->deleted('Distribuidor eliminado exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}
