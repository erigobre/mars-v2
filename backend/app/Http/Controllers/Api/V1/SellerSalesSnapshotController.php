<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\Sale\UpdateSellerSalesSnapshotRequest;
use App\Http\Resources\V1\Sale\SellerSalesSnapshotResource;
use App\Models\SellerSalesSnapshot;
use Illuminate\Http\Request;

class SellerSalesSnapshotController extends ApiController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Puedes agregar aquí tu trait de Filterable si lo necesitas
        $snapshots = SellerSalesSnapshot::with(['seller', 'campaign', 'redemptionCycle'])
            ->paginate($request->query('per_page', 15));

        $paginatedData = SellerSalesSnapshotResource::collection($snapshots)->response()->getData(true);

        return $this->successResponse(
            'Se obtuvo la lista de snapshots de ventas de vendedores.',
            $paginatedData
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(SellerSalesSnapshot $snapshot) // Nota: asegúrate de inyectar el modelo correcto en la ruta
    {
        $snapshot->load(['seller', 'campaign', 'redemptionCycle']);
        
        return this->successResponse(
            'Se obtuvo el snapshot de ventas del vendedor.',
            new SellerSalesSnapshotResource($snapshot)
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSellerSalesSnapshotRequest $request, SellerSalesSnapshot $snapshot)
    {
        $snapshot->update($request->validated());

        return $this->successResponse(
            'Se actualizó el snapshot de ventas del vendedor.',
            new SellerSalesSnapshotResource($snapshot)
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SellerSalesSnapshot $snapshot)
    {
        $snapshot->delete();

        return $this->successResponse(
            'Se eliminó el snapshot de ventas del vendedor.',
            null
        );
    }
}
