<?php

namespace App\Http\Resources\V1\Sale;

use App\Http\Resources\V1\SaleItem\SaleItemResource;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
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
            'id'            => $this->id,
            'folio'         => $this->folio,
            'batch_uuid'    => $this->batch_uuid,
            'upload_method' => $this->upload_method,
            'sale_date'     => $this->sale_date?->toDateString(),
            'notes'         => $this->notes,
            'total_amount'  => (float) $this->total_amount,
            'points_earned' => (int)   $this->points_earned,

            'seller' => $this->whenLoaded('seller', fn() => [
                'id'            => $this->seller->id,
                'username'      => $this->seller->user?->username ?? 'Desconocido',
                'employee_code' => $this->seller->employee_code,
            ]),

            'created_by' => $this->whenLoaded('createdBy', fn() => [
                'id'       => $this->createdBy->id,
                'username' => $this->createdBy->username,
            ]),

            'items'       => SaleItemResource::collection($this->whenLoaded('items')),
            'items_count' => $this->when(
                !$this->relationLoaded('items'),
                fn() => $this->items_count
            ),

            'created_at' => $this->created_at?->toISOString(),
        ]);
    }
}
