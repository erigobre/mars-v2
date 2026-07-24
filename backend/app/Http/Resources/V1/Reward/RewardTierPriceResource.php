<?php

namespace App\Http\Resources\V1\Reward;

use App\Http\Resources\V1\Seller\SellerTierResource;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RewardTierPriceResource extends JsonResource
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
            'tier'      => new SellerTierResource($this['tier']), 
            'price'     => $this['price'],
            'is_custom' => $this['is_custom'],
        ]);
    }
}
