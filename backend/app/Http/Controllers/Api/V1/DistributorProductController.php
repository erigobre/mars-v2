<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\ProductDTO;
use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\DistributorProduct\CustomizeProductRequest;
use App\Http\Requests\Api\V1\DistributorProduct\UpdateCustomizeProductRequest;
use App\Http\Resources\V1\Product\UnifiedProductResource;
use App\Models\DistributorProduct;
use App\Models\Product;
use App\Services\Product\DistributorProductService;
use App\Services\Product\ProductViewService;
use Illuminate\Http\Request;

class DistributorProductController extends ApiController
{

    public function __construct(
        protected DistributorProductService $distributorProductService,
        protected ProductViewService $productViewService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $distributor = $request->user()->distributor;
        
        if (!$distributor) {
            return $this->notFound('Distribuidor no encontrado');
        }

        $search = $request->query('search');
        $perPage = $request->query('per_page', 20);

        $products = $this->productViewService->getActiveProductsForDistributor(
            $distributor->id,
            $perPage,
            $search
        );

        $paginatedData = UnifiedProductResource::collection($products)->response()->getData(true);

        return $this->successResponse('Productos obtenidos exitosamente.', $paginatedData);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CustomizeProductRequest $request)
    {
        try {
            $distributor = $request->user()->distributor;

            if (!$distributor) {
                return $this->notFound('Distribuidor no encontrado');
            }

            $product = Product::find($request->product_id);            
            if (!$product || !$product->is_active) {
                return $this->notFound('Producto no disponible');
            }

            $distributorProduct = $this->distributorProductService->customize(
                $distributor,
                $request->validated()
            );

            // Obtener producto con personalización aplicada
            $productDTO = $this->productViewService->getProductForDistributor(
                $product,
                $distributor->id
            );

            return $this->successResponse(
                'Producto personalizado exitosamente',
                new UnifiedProductResource($productDTO)
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, int $productId)
    {
        $distributor = $request->user()->distributor;

        if (!$distributor) {
            return $this->notFound('Distribuidor no encontrado');
        }

        $product = Product::find($productId);
        if (!$product) {
            return $this->notFound('Producto no encontrado');
        }
        if (!$product->is_active) {
            return $this->notFound('Producto no disponible');
        }

        $productDTO = $this->productViewService->getProductForDistributor(
            $product,
            $distributor->id
        );

        return $this->successResponse(
            'Producto obtenido exitosamente',
            new UnifiedProductResource($productDTO)
        );
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCustomizeProductRequest $request, DistributorProduct $distributorProduct)
    {
        try {
            $distributor = $request->user()->distributor;

            if (!$distributor || $distributorProduct->distributor_id !== $distributor->id) {
                return $this->forbidden('No tienes acceso a esta personalización');
            }

            $updated = $this->distributorProductService->update(
                $distributorProduct,
                $request->validated()
            );

            $productDTO = $this->productViewService->getProductForDistributor(
                $updated->product,
                $distributor->id
            );

            return $this->successResponse(
                'Personalización actualizada exitosamente',
                new UnifiedProductResource($productDTO)
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, DistributorProduct $distributorProduct)
    {
        try {
            $distributor = $request->user()->distributor;

            if (!$distributor || $distributorProduct->distributor_id !== $distributor->id) {
                return $this->forbidden('No tienes acceso a esta personalización');
            }

            $this->distributorProductService->removeCustomization($distributorProduct);

            return $this->deleted('Personalización eliminada. Ahora se usarán los valores por defecto.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function customized(Request $request)
    {
        $perPage = $request->query('per_page', 20);
        $distributor = $request->user()->distributor;

        if (!$distributor) {
            return $this->notFound('Distribuidor no encontrado');
        }

        $customizations = DistributorProduct::with('product')
            ->where('distributor_id', $distributor->id)
            ->latest()
            ->paginate($perPage);

        $customizations->through(function ($custom) {
            return ProductDTO::fromProductWithCustomization($custom->product, $custom);
        });

        $paginatedData = UnifiedProductResource::collection($customizations)->response()->getData(true);

        return $this->successResponse(
            'Productos personalizados obtenidos exitosamente',
            $paginatedData
        );
    }
}
