<?php

namespace App\Http\Resources\V1\Reward;

use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RewardReservationResource extends JsonResource
{
    use TransformsCamelCase;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $seller = auth()->user()->seller;
        $hasShippingData = $seller->hasShippingAddress();

        return $this->camel([
            'id'                => $this->id,
            'folio'             => $this->folio,
            'status'            => $this->status->value,
            'expires_at'        => $this->reserved_until?->toISOString(),
            'minutes_remaining' => $this->reserved_until
                ? now()->diffInMinutes($this->reserved_until, false)
                : null,
            'has_shipping_data' => $hasShippingData,
            'saved_address'     => $hasShippingData ? $seller->getFormattedAddress() : null,
            'reward'            => [
                'id'   => $this->reward->id,
                'name' => $this->reward->name,
            ],
        ]);
    }
}
