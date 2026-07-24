<?php

namespace App\Http\Resources\V1\Redemption;

use App\Http\Resources\V1\Redemption\RedemptionWindowResource;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RedemptionCycleResource extends JsonResource
{
    use TransformsCamelCase;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->isAdmin() ?? false;

        $data = [
            'id'              => $this->id,
            'name'            => $this->name,
            'start_date'      => $this->start_date?->toISOString(),
            'end_date'        => $this->end_date?->toISOString(),
            'is_active'       => $this->is_active,
            'has_open_window' => $this->hasOpenWindow(),
        ];

        if ($isAdmin) {
            $data['campaign_id'] = $this->campaign_id;
            $data['windows'] = RedemptionWindowResource::collection($this->whenLoaded('windows'));
            $data['created_at']  = $this->created_at?->toISOString();
            $data['updated_at']  = $this->updated_at?->toISOString();
        }

        return $this->camel($data);
    }
}
