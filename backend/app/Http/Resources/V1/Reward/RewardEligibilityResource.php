<?php

namespace App\Http\Resources\V1\Reward;

use App\Http\Resources\V1\Reward\RewardClaimResource;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RewardEligibilityResource extends JsonResource
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
            'can_claim'         => $this['canClaim'],
            'has_shipping_data' => $this['hasShippingData'],
            'reasons'           => $this['reasons'], // Los códigos y mensajes internos
            'reward'            => $this['reward'],
            'pending_claim'     => $this['pendingClaim'] ? new RewardClaimResource($this['pendingClaim']) : null,
        ]);
    }
}
