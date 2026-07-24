<?php

namespace App\Http\Resources\V1\Campaign;

use App\Http\Resources\V1\Redemption\RedemptionCycleResource;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignResource extends JsonResource
{
    use TransformsCamelCase;

    public function toArray(Request $request): array
    {
        return $this->camel([
            'id'          => $this->id,
            'name'        => $this->name,
            'start_date'  => $this->start_date?->toISOString(),
            'end_date'    => $this->end_date?->toISOString(),
            'is_active'   => $this->is_active,
            'is_running'  => $this->isRunning(),
            'status'      => $this->status,
            'cycles'      => RedemptionCycleResource::collection(
                $this->whenLoaded('cycles')
            ),
            'cycles_count' => $this->whenCounted('cycles'),
            'created_at'  => $this->created_at?->toISOString(),
            'updated_at'  => $this->updated_at?->toISOString(),
        ]);
    }
}
