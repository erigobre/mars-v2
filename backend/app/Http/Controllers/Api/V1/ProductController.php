<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\ProductDTO;
use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\Product\StoreProductRequest;
use App\Http\Requests\Api\V1\Product\UpdateProductRequest;
use App\Http\Resources\V1\Product\ProductResource;
use App\Http\Resources\V1\Product\UnifiedProductResource;
use App\Models\Product;
use App\Services\Product\ProductService;
use App\Services\Product\ProductViewService;
use Illuminate\Http\Request;

class ProductController extends ApiController
{
    public function __construct(
        protected ProductService $productService,
        protected ProductViewService $productViewService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Product::class);

        $search = $request->query('search');
        $perPage = $request->input('per_page', 20);
        $activeOnly = $request->boolean('active_only');
        $user = $request->user();

        $products = $user->role->slug === 'distributor'
            ? $this->productViewService->getActiveProductsForDistributor($user->id, $perPage, $search)
            : $this->productViewService->getAllProductsForAdmin($perPage, $search, $activeOnly);

        $paginatedData = UnifiedProductResource::collection($products)->response()->getData(false);

        return $this->successResponse('Productos obtenidos exitosamente.', $paginatedData);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $this->authorize('create', Product::class);

        try {
            $product = $this->productService->create($request->validated(), $request->file('image'));

            return $this->created(
                new ProductResource($product),
                'Producto creado exitosamente'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/admin/products/{id}/customizations
     * 
     * Ver TODAS las personalizaciones de TODOS los distribuidores para este producto
     */
    public function showCustomizations(Product $product)
    {
        $data = $this->productViewService->getProductWithAllCustomizations($product);

        return $this->successResponse(
            'Producto con todas las customizaciones obtenido exitosamente',
            $data
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $this->authorize('view', $product);

        $productDTO = ProductDTO::fromProduct($product);

        return $this->successResponse(
            'Producto obtenido exitosamente',
            new UnifiedProductResource($productDTO)
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $this->authorize('update', $product);

        try {
            $updatedProduct = $this->productService->update($product, $request->validated(), $request->file('image'));

            return $this->successResponse(
                'Producto actualizado exitosamente',
                new ProductResource($updatedProduct)
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        try {
            $this->productService->delete($product);

            return $this->deleted('Producto eliminado exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}
