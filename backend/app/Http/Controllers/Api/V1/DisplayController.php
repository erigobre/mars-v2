<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\Display\StoreDisplayRequest;
use App\Http\Requests\Api\V1\Display\UpdateDisplayRequest;
use App\Http\Resources\V1\Display\DisplayResource;
use App\Models\Display;
use Illuminate\Http\Request;

class DisplayController extends ApiController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 20);

        $query = Display::query();
        $query->withCount('products');

        if ($search) {
            $query->globalSearch($search);
        }

        $displays = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $paginatedData = DisplayResource::collection($displays)->response()->getData(true);

        return $this->successResponse(
            'Displays obtenidos exitosamente.',
            $paginatedData,
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDisplayRequest $request)
    {
        try {
            $display = Display::create($request->validated());

            return $this->created(
                new DisplayResource($display),
                'Display creado exitosamente.'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Display $display)
    {
        $display->loadCount('products');

        return $this->successResponse(
            'Display obtenido exitosamente.',
            new DisplayResource($display)
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDisplayRequest $request, Display $display)
    {
        try {
            $display->update($request->validated());

            return $this->successResponse(
                'Display actualizado exitosamente.',
                new DisplayResource($display->fresh())
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Display $display)
    {
        try {
            // Evitar eliminar si tiene productos asociados
            if ($display->products()->exists()) {
                return $this->errorResponse(
                    'No se puede eliminar el display porque tiene productos asociados.',
                    409
                );
            }

            $display->delete();

            return $this->deleted('Display eliminado exitosamente.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}
