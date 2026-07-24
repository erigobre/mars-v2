<?php

namespace App\Services\Product;

use App\Models\Distributor;
use App\Models\DistributorProduct;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class DistributorProductService
{
    public function getAllForDistributor(Distributor $distributor, int $perPage = 20)
    {
        $paginatedProducts = Product::where('is_active', true)->paginate($perPage);
        
        $productIds = $paginatedProducts->pluck('id');

        $customizations = DistributorProduct::where('distributor_id', $distributor->id)
            ->whereIn('product_id', $productIds)
            ->with('product')
            ->get()
            ->keyBy('product_id');
        
            $paginatedProducts->getCollection()->transform(function ($product) use ($customizations) {
                $customData = $customizations->get($product->id);
                
                $product->setRelation('customization', $customData); 
                
                return $product;
            });

        return $paginatedProducts;
    }

    public function customize(Distributor $distributor, array $data): DistributorProduct
    {
        return DB::transaction(function () use ($distributor, $data) {
            $product = Product::findOrFail($data['product_id']);
            
            $distributorProduct = DistributorProduct::updateOrCreate(
                [
                    'distributor_id' => $distributor->id,
                    'product_id' => $product->id,
                ],
                [
                    'custom_sku' => $data['custom_sku'] ?? null,
                    'custom_price' => $data['custom_price'] ?? null,
                    'notes' => $data['notes'] ?? null,
                ]
            );

            return $distributorProduct->load('product.display');
        });
    }

    public function update(DistributorProduct $distributorProduct, array $data): DistributorProduct
    {
        return DB::transaction(function () use ($distributorProduct, $data) {
            $distributorProduct->update([
                'custom_sku' => $data['custom_sku'] ?? $distributorProduct->custom_sku,
                'custom_price' => $data['custom_price'] ?? $distributorProduct->custom_price,
                'notes' => $data['notes'] ?? $distributorProduct->notes,
            ]);
            
            return $distributorProduct->fresh('product.display');
        });
    }

    public function removeCustomization(DistributorProduct $distributorProduct): void
    {
        $distributorProduct->delete();
    }
}