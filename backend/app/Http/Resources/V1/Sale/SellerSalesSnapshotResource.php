<?php

namespace App\Http\Resources\V1\Sale;

use App\Http\Resources\V1\Campaign\CampaignResource;
use App\Http\Resources\V1\Redemption\RedemptionCycleResource;
use App\Http\Resources\V1\Seller\SellerResource;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerSalesSnapshotResource extends JsonResource
{
    use TransformsCamelCase;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $totalUnits = (float) $this->total_units_sold;
        $targetGoal = (float) $this->target_average;

        return $this->camel([
            'id' => $this->id,
            'seller_id' => $this->seller_id,
            'campaign_id' => $this->campaign_id,
            'redemption_cycle_id' => $this->redemption_cycle_id,

            'total_units_sold' => $totalUnits,
            'target_average'   => $targetGoal,


            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relaciones (se mostrarán solo si se cargan explícitamente en el controlador)
            'seller' => $this->whenLoaded('seller', fn() => $this->seller ? new SellerResource($this->seller) : null),
            'campaign' => $this->whenLoaded('campaign', fn() => $this->campaign ? new CampaignResource($this->campaign) : null),
            'redemption_cycle' => $this->whenLoaded('redemptionCycle', fn() => $this->redemptionCycle ? new RedemptionCycleResource($this->redemptionCycle) : null),
        ]);
    }
}
