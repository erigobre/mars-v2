<?php

namespace App\Http\Resources\V1\Display;

use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DisplayResource extends JsonResource
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
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'value_points'   => (float) $this->value_points,
            'is_active'      => $this->is_active,
            'products_count' => $this->whenCounted('products'),
            'created_at'     => $this->created_at?->toISOString(),
            'updated_at'     => $this->updated_at?->toISOString(),
        ]);
    }
}
