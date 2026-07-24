<?php

namespace App\Http\Resources\V1\Redemption;

use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RedemptionWindowResource extends JsonResource
{
    use TransformsCamelCase;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $now = now();

        return $this->camel([
            'id'         => $this->id,
            'cycle_id'   => $this->cycle_id,
            'opens_at'   => $this->opens_at?->toISOString(),
            'closes_at'  => $this->closes_at?->toISOString(),
            'is_open'    => $now->between($this->opens_at, $this->closes_at),
            'created_at' => $this->created_at?->toISOString(),
        ]);
    }
}
