<?php

namespace App\Http\Resources\V1\Auth;

use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthUserResource extends JsonResource
{
    use TransformsCamelCase;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $sessionData = [
            'id'     => $this->id,
            'username'   => $this->username,
            'email'  => $this->email,
            'avatar_url' => $this->avatarUrl(),
            'avatar_thumbnail' => $this->thumbAvatarUrl(),
            'role'   => $this->role->slug ?? 'guest',
        ];

        $roleSlug = $this->role->slug ?? '';

        if ($roleSlug === 'seller' && $this->relationLoaded('seller')) {

            $sessionData = array_merge($sessionData, [
                'current_points' => (float) $this->seller->current_points,
                'terms_accepted' => $this->seller->terms_accepted,
            ]);
        }

        if ($roleSlug === 'distributor' && $this->relationLoaded('distributor')) {
            $sessionData = array_merge($sessionData, [
                'company_name' => $this->distributor->company_name
            ]);
        }

        return $this->camel($sessionData);
    }
}
