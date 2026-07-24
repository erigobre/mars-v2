<?php

namespace App\Http\Resources\V1\Goal;

use App\Http\Resources\V1\Goal\GoalResource;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoalProgressResource extends JsonResource
{
    use TransformsCamelCase;

    public function toArray(Request $request): array
    {
        $progress = $this->resource;
        $goal = $this->whenLoaded('goal') ?? $progress->goal;
        
        return $this->camel([
            'id'            => $progress->id,
            'goal'          => $goal ? new GoalResource($goal) : null,
            'current_value' => (float) $progress->current_value,
            'target_value'  => $goal ? (float) $goal->target_value : 0.0,
            'percentage'    => $progress->percentage(),
            'reached'       => $progress->reached,
            'bonus_awarded' => $progress->bonus_awarded,
            'reached_at'    => $progress->reached_at?->toISOString(),

            // Seller (visible solo en vistas de admin)
            'seller' => $this->when(
                $request->user()?->role?->slug === 'admin',
                fn() => $progress->relationLoaded('seller') ? [
                    'id'            => $progress->seller->id,
                    'name'          => $progress->seller->user?->username ?? 'Desconocido',
                    'employee_code' => $progress->seller->employee_code,
                ] : null
            ),

            'updated_at' => $progress->updated_at?->toISOString(),
        ]);
    }
}
