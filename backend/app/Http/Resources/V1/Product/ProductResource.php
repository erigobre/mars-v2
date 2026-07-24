<?php

namespace App\Http\Resources\V1\Product;

use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    use TransformsCamelCase;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Si es un array
        if (is_array($this->resource)) {
            return $this->camel($this->formatFromArray($this->resource));
        }

        // Si es un modelo Product
        return $this->camel($this->formatFromModel());
    }

    /**
     * Formatear desde modelo Product
     */
    private function formatFromModel(): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'upc' => $this->upc,
            'name' => $this->name,
            'description' => $this->description,
            // 'image_url' => $this->image_url,
            'image' => $this->imageUrl(),
            'image_thumb' => $this->thumbUrl(),
            'default_price' => (float) $this->default_price,
            'unit_type' => $this->unit_type,
            'category' => $this->category,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Formatear desde array (forDistributor)
     */
    private function formatFromArray(array $data): array
    {
        return [
            'id' => $data['id'] ?? $data['product_id'] ?? null,
            'sku' => $data['sku'] ?? null,
            'upc' => $data['upc'] ?? null,
            'name' => $data['name'] ?? null,
            'description' => $data['description'] ?? null,
            // 'image_url' => $data['image_url'] ?? null,
            'image' => $data['image'] ?? null,
            'image_thumb' => $data['image_thumb'] ?? null,
            'default_price' => isset($data['default_price']) ? (float) $data['default_price'] : (isset($data['price']) ? (float) $data['price'] : null),
            'unit_type' => $data['unit_type'] ?? null,
            'category' => $data['category'] ?? null,
            'is_active' => $data['is_active'] ?? null,
            'created_at' => $data['created_at'] ?? null,
            'updated_at' => $data['updated_at'] ?? null,
        ];
    }
}
