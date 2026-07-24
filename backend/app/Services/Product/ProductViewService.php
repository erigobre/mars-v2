<?php

namespace App\Services\Product;

use App\DTOs\ProductDTO;
use App\Models\DistributorProduct;
use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductViewService
{
    /**
     * ADMIN: Ver todos los productos (activos e inactivos)
     * Sin personalizaciones, solo catálogo maestro
     */
    public function getAllProductsForAdmin(int $perPage = 20, ?string $search = null, bool $activeOnly = false): LengthAwarePaginator
    {
        $query = Product::with('display');

        if ($activeOnly) {
            $query->where('is_active', true)
                  ->whereHas('display', function ($q) {
                      $q->where('is_active', true);
                  });
        }

        // Aplicamos la búsqueda global si existe el término
        if ($search) {
            $query->globalSearch($search);
        }

        $products = $query->latest()->paginate($perPage);

        $products->getCollection()->transform(
            fn($product) => ProductDTO::fromProduct($product)
        );

        return $products;
    }

    /**
     * DISTRIBUIDOR: Ver solo productos ACTIVOS
     * Con sus personalizaciones aplicadas (si existen)
     */
    public function getActiveProductsForDistributor(
        int $distributorId,
        int $perPage = 20,
        ?string $search = null
    ): LengthAwarePaginator {
        
        // $query = Product::query();
        $query = Product::query()->with('display');

        // Solo productos ACTIVOS y con display activo
        $query->where('is_active', true)
              ->whereHas('display', function ($q) {
                  $q->where('is_active', true);
              });

        if ($search) {
            $query->globalSearch($search);
        }

        // Obtener productos con paginación
        $products = $query->latest()->paginate($perPage);

        // Cargar personalizaciones de este distribuidor en batch
        $productIds = $products->pluck('id');
        $customizations = DistributorProduct::where('distributor_id', $distributorId)
            ->whereIn('product_id', $productIds)
            ->get()
            ->keyBy('product_id');

        // Transformar a DTOs (con personalizaciones si existen)
        $products->getCollection()->transform(function ($product) use ($customizations) {
            $custom = $customizations->get($product->id);

            return $custom
                ? ProductDTO::fromProductWithCustomization($product, $custom)
                : ProductDTO::fromProduct($product);
        });

        return $products;
    }

    /**
     * Obtener UN producto para un distribuidor
     */
    public function getProductForDistributor(Product $product, int $distributorId): ProductDTO
    {
        $product->loadMissing('display');

        $custom = $product->distributorProducts()
            ->where('distributor_id', $distributorId)
            ->first();

        return $custom
            ? ProductDTO::fromProductWithCustomization($product, $custom)
            : ProductDTO::fromProduct($product);
    }

    /**
     * ADMIN: Ver todas las personalizaciones de un producto
     */
    public function getProductWithAllCustomizations(Product $product): array
    {
        $product->loadMissing('display');
        $baseProduct = ProductDTO::fromProduct($product);

        $customizations = $product->distributorProducts()
            ->with('distributor.user')
            ->get()
            ->map(function ($custom) use ($product) {
                return [
                    'distributor'     => [
                        'id'           => $custom->distributor->id,
                        'company_name' => $custom->distributor->company_name,
                        'email'        => $custom->distributor->user->email,
                    ],
                    'customization'   => [
                        'id'                => $custom->id,
                        'custom_sku'        => $custom->custom_sku,
                        'custom_price'      => $custom->custom_price ? (float) $custom->custom_price : null,
                        'notes'             => $custom->notes,
                        'created_at'        => $custom->created_at?->toISOString(),
                        'updated_at'        => $custom->updated_at?->toISOString(),
                    ],
                    'effective_values' => [ // Valores efectivos que se mostrarían al distribuidor (custom si existe, sino base)
                        'sku'          => $custom->custom_sku ?? $product->sku,
                        'price'        => $custom->custom_price ?? $product->default_price,
                        'value_points' => $product->display->value_points, // Siempre del display
                        'display_name' => $product->display->name,
                    ],
                ];
            });

        return [
            'base_product'          => $baseProduct->toArray(),
            'total_customizations'  => $customizations->count(),
            'customizations'        => $customizations->toArray(),
        ];
    }
}