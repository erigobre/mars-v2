<?php

namespace App\Http\Resources\V1\Auth;

use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    use TransformsCamelCase;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $roleSlug = $this->role->slug ?? 'guest';

        $profileData = [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'phone' => $this->phone,
            'birthdate' => $this->birthdate,
            'avatar_url' => $this->avatarUrl(),
            'avatar_thumbnail' => $this->thumbAvatarUrl(),
            'role' => $roleSlug,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];

        if ($roleSlug === 'seller' && $this->relationLoaded('seller') && $this->seller) {
            $profileData = array_merge($profileData, [
                'employee_code' => $this->seller->employee_code,
                'current_points' => (int) $this->seller->current_points,
                'shipping_notes' => $this->seller->shipping_notes,
                'sales_snapshots' => $this->seller->relationLoaded('salesSnapshots') 
                    ? \App\Http\Resources\V1\Sale\SellerSalesSnapshotResource::collection($this->seller->salesSnapshots)
                    : [],
                
                'distributor_name' => $this->seller->relationLoaded('distributor') && $this->seller->distributor 
                                      ? $this->seller->distributor->company_name 
                                      : null,

                'address' => [
                    'street' => $this->seller->address_street,
                    'colonia' => $this->seller->address_colonia,
                    'city' => $this->seller->address_city,
                    'state' => $this->seller->address_state,
                    'zip' => $this->seller->address_zip,
                ],
            ]);
        }

        if ($roleSlug === 'distributor' && $this->relationLoaded('distributor') && $this->distributor) {
            $profileData = array_merge($profileData, [
                'company_name' => $this->distributor->company_name,
            ]);
        }

        return $this->camel($profileData);
    }
}
