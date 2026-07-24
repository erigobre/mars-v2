<?php

namespace App\Http\Resources\V1\Goal;

use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoalResource extends JsonResource
{
    use TransformsCamelCase;

    public function toArray(Request $request): array
    {
        return $this->camel([
            'id'            => $this->id,
            'cycle_id'      => $this->cycle_id,
            'name'          => $this->name,
            'description'   => $this->description,
            'type'          => $this->type->value,
            'type_label'    => $this->type->label(),
            'target_value'  => (float) $this->target_value,
            'reward_points' => $this->reward_points,
            'is_active'     => $this->is_active,
            'representation_image' => $this->getRepresentationImage(),

            // Relaciones opcionales
            'cycle' => $this->whenLoaded('cycle', fn() => [
                'id'         => $this->cycle->id,
                'name'       => $this->cycle->name,
                'start_date' => $this->cycle->start_date?->toISOString(),
                'end_date'   => $this->cycle->end_date?->toISOString(),
            ]),

            'product' => $this->whenLoaded('product', fn() => $this->product ? [
                'id'   => $this->product->id,
                'name' => $this->product->name,
                'sku'  => $this->product->sku,
            ] : null),

            'display' => $this->whenLoaded('display', fn() => $this->display ? [
                'id'   => $this->display->id,
                'name' => $this->display->name,
            ] : null),

            // Conteo de vendedores con progreso (admin)
            'progresses_count' => $this->whenCounted('progresses'),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ]);
    }
}
