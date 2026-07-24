<?php

namespace App\Http\Resources\V1\DistributorProduct;

use App\Http\Resources\V1\Product\ProductResource;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DistributorProductResource extends JsonResource
{
    use TransformsCamelCase;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if (is_array($this->resource)) {
            return $this->camel($this->formatFromArray($this->resource));
        }

        return $this->camel($this->formatFromModel());
    }

    /**
     * Formatear desde modelo DistributorProduct
     */
    private function formatFromModel(): array
    {
        return [
            'id' => $this->id,
            'distributor_id' => $this->distributor_id,
            'product_id' => $this->product_id,
            'product' => new ProductResource($this->whenLoaded('product')),
            'custom_sku' => $this->custom_sku,
            'custom_price' => $this->custom_price ? (float) $this->custom_price : null,
            'custom_points_per_unit' => $this->custom_points_per_unit ? (float) $this->custom_points_per_unit : null,
            'points_multiplier' => $this->points_multiplier ? (float) $this->points_multiplier : null,
            'max_sale_quantity' => $this->max_sale_quantity ? (float) $this->max_sale_quantity : null,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Formatear desde array (getMergedProduct, forDistributor)
     */
    private function formatFromArray(array $data): array
    {
        return [
            'id' => $data['id'] ?? null,
            'distributor_product_id' => $data['distributor_product_id'] ?? null,
            'product_id' => $data['product_id'] ?? null,
            'product' => isset($data['product']) ? new ProductResource($data['product']) : null,
            'custom_sku' => $data['custom_config']['custom_sku'] ?? $data['custom_sku'] ?? null,
            'custom_price' => isset($data['custom_config']['custom_price'])
                ? (float) $data['custom_config']['custom_price']
                : (isset($data['custom_price']) ? (float) $data['custom_price'] : null),
            'custom_points_per_unit' => isset($data['custom_config']['custom_points_per_unit'])
                ? (float) $data['custom_config']['custom_points_per_unit']
                : (isset($data['custom_points_per_unit']) ? (float) $data['custom_points_per_unit'] : null),
            'points_multiplier' => isset($data['custom_config']['points_multiplier'])
                ? (float) $data['custom_config']['points_multiplier']
                : (isset($data['points_multiplier']) ? (float) $data['points_multiplier'] : null),
            'max_sale_quantity' => isset($data['custom_config']['max_sale_quantity'])
                ? (float) $data['custom_config']['max_sale_quantity']
                : (isset($data['max_sale_quantity']) ? (float) $data['max_sale_quantity'] : null),
            'notes' => $data['custom_config']['notes'] ?? $data['notes'] ?? null,
            'created_at' => $data['created_at'] ?? null,
            'updated_at' => $data['updated_at'] ?? null,
        ];
    }
}
