<?php

namespace App\Http\Resources\V1\SaleItem;

use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleItemResource extends JsonResource
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
            'id'         => $this->id,
            'product_id' => $this->product_id,

            'product_name' => $this->whenLoaded('product', fn() => $this->product?->name ?? 'Producto no reconocido'),
            'product_sku'  => $this->whenLoaded('product', fn() => $this->product?->sku ?? $this->unrecognized_sku),

            'quantity'        => (float) $this->quantity,
            'reported_amount' => (float) $this->subtotal,

            'unit_price_ref'      => (float) $this->unit_price,
            'expected_amount_ref' => round((float) $this->quantity * (float) $this->unit_price, 2),

            'points_per_unit' => (float) $this->points_per_unit,
            
            'potential_points' => (float) $this->total_points, 
            'earned_points'    => (float) $this->earned_points,

            'applied_rule' => $this->applied_rule,
        ]);
    }
}
