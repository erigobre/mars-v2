<?php

namespace App\Http\Resources\V1\Product;

use App\DTOs\ProductDTO;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use InvalidArgumentException;

class UnifiedProductResource extends JsonResource
{
    use TransformsCamelCase;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if (!$this->resource instanceof ProductDTO) {
            throw new InvalidArgumentException(
                'UnifiedProductResource expects ProductDTO, got ' . get_class($this->resource)
            );
        }

        /** @var ProductDTO $dto */
        $dto = $this->resource;

        $user = $request->user();
        $isDistributor = $user && $user->role->slug === 'distributor';

        $data = [
            'id'               => $dto->id,
            'sku'              => $dto->sku,
            'upc'              => $dto->upc,
            'name'             => $dto->name,
            'description'      => $dto->description,
            // 'image_url'        => $dto->image_url,
            'image'            => $dto->image,
            'image_thumb'      => $dto->image_thumb,
            'unit_type'        => $dto->unit_type,
            'custom_unit_type' => $dto->custom_unit_type,
            'category'         => $dto->category,
            'is_active'        => $dto->is_active,
            'price'            => $dto->price,
            'display'          => [
                'id'           => $dto->display_id,
                'name'         => $dto->display_name,
                'value_points' => $dto->value_points,     // Puntos por unidad (del display)
            ],
            // 'display_id'       => $dto->display_id,
            // 'display_name'     => $dto->display_name,
            // 'value_points'     => $dto->value_points,     // Puntos por unidad (del display)
            'created_at'       => $dto->created_at,
            'updated_at'       => $dto->updated_at,
        ];

        if ($isDistributor) {
            $data['distributor_product_id'] = $dto->distributor_product_id;
            $data['base_price']             = $dto->base_price;
            $data['is_customized']          = $dto->is_customized;
            $data['customization']          = $dto->customization;
        }

        return $this->camel($data);
    }
}