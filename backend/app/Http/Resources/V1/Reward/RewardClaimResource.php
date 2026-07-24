<?php

namespace App\Http\Resources\V1\Reward;

use App\Http\Resources\V1\Redemption\RedemptionCycleResource;
use App\Http\Resources\V1\Seller\SellerResource;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RewardClaimResource extends JsonResource
{
    use TransformsCamelCase;

    public function toArray(Request $request): array
    {
        $isSeller = $request->user()?->isSeller();

        $data = [
            'id'              => $this->id,
            'folio'           => $this->folio,
            'status'          => $this->status->value,
            'status_label'    => $this->status->label(),
            'points_spent'    => $this->points_spent,
            'claimed_at'      => $this->claimed_at?->toISOString(),
            'carrier'         => $this->carrier,
            'tracking_number' => $this->tracking_number,
            'reward'          => new RewardResource($this->whenLoaded('reward')),
            'created_at'      => $this->created_at?->toISOString(),
            'updated_at'      => $this->updated_at?->toISOString(),
        ];

        if (!$isSeller) {
            $data['seller'] = new SellerResource($this->whenLoaded('seller'));
            $data['cycle']  = new RedemptionCycleResource($this->whenLoaded('cycle'));
            $data['shipping_address'] = [
                'name'    => $this->shipping_name,
                'street'  => $this->shipping_street,
                'colonia' => $this->shipping_colonia,
                'city'    => $this->shipping_city,
                'state'   => $this->shipping_state,
                'zip'     => $this->shipping_zip,
                'notes'   => $this->shipping_notes,
            ];
        }

        return $this->camel($data);
    }
}
