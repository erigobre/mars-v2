<?php

namespace App\Http\Resources\V1\Seller;

use App\Http\Resources\V1\Distributor\DistributorResource;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerTierResource extends JsonResource
{
    use TransformsCamelCase;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return $this->camel([
            'id' => $this->id,
            'distributor_id' => $this->distributor_id,
            'distributor' => $this->whenLoaded('distributor', fn() => new DistributorResource($this->distributor)),
            'name' => $this->name,
            'slug' => $this->slug,
            'min_average_sales' => (float) $this->min_average_sales,
            'max_average_sales' => (float) $this->max_average_sales,
            'order' => $this->order,
            'color' => $this->color,
            'icon' => $this->icon,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'sellers_count' => $this->whenCounted('sellers'),
        ]);
    }
}
