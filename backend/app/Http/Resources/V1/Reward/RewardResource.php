<?php

namespace App\Http\Resources\V1\Reward;

use App\Http\Resources\V1\Reward\RewardTierPriceResource;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RewardResource extends JsonResource
{
    use TransformsCamelCase;

    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isAdmin = $user && $user->isAdmin();

        $finalPoints = isset($this->dynamic_price)
            ? (int) $this->dynamic_price
            : (int) $this->points_required;

        return $this->camel([
            'id'              => $this->id,
            'name'            => $this->name,
            'description'     => $this->description,
            'points_required' => (int) $finalPoints,
            'image'           => $this->imageUrl(),
            'image_thumb'     => $this->thumbUrl(),
            'category'        => $this->category,
            'is_available'    => $this->is_active && $this->stock > 0,
            'is_featured'     => $this->is_featured,
            'max_global_claims' => $this->max_global_claims,
            'total_claimed'     => $this->total_claimed,
            'stock'             => $this->stock,

            $this->mergeWhen($isAdmin, $this->camel([
                'base_points'       => $this->points_required,
                'is_active'         => $this->is_active,
                'visibility'        => $this->visibility,
                'base_cost'         => $this->base_cost?->value,
                'created_at'        => $this->created_at?->toISOString(),
                'updated_at'        => $this->updated_at?->toISOString(),
                
                'tier_prices'       => RewardTierPriceResource::collection($this->whenLoaded('tierPrices')),
                'claims_list'       => RewardClaimResource::collection($this->whenLoaded('claims')),
                'total_claims_count' => $this->claims ? $this->claims->count() : 0,
            ])),

        ]);
    }
}