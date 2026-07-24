<?php

namespace App\Http\Resources\V1\Distributor;

use App\Http\Resources\V1\Seller\SellerCollection;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DistributorResource extends JsonResource
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
            'id' => $this->id,

            // Datos del usuario
            'username' => $this->user?->username ?? 'Desconocido',
            'email' => $this->user?->email,
            'phone' => $this->user?->phone,
            'birthdate' => $this->user?->birthdate,
            'avatar_url' => $this->user ? $this->user->avatarUrl() : null,
            'avatar_thumbnail' => $this->user ? $this->user->thumbAvatarUrl() : null,
            'is_active' => $this->user?->is_active ?? false,
            'last_login_at' => $this->user?->last_login_at,

            // Datos específicos del distribuidor
            'company_name' => $this->company_name,
            'points_calculation_strategy' => $this->points_calculation_strategy,
            'growth_percentage' => (float) $this->growth_percentage,
            'average_evaluation_scope' => $this->average_evaluation_scope,

            'identifier_type' => $this->identifier_type,
            'credential_type' => $this->credential_type,

            // 'sellers' => $this->whenLoaded('sellers', new SellerCollection($this->sellers)),
            // 'sellers' => new SellerCollection($this->whenLoaded('sellers')),
            'sellers' => $this->whenLoaded('sellers', fn() => new SellerCollection($this->sellers)),

            'sellers_count' => $this->whenCounted('sellers'),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ]);
    }
}
