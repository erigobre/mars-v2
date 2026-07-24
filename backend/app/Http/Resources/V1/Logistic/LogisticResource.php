<?php

namespace App\Http\Resources\V1\Logistic;

use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LogisticResource extends JsonResource
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
            'username' => $this->username,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar_url' => $this->avatarUrl(),
            'avatar_thumbnail' => $this->thumbAvatarUrl(),
            'is_active' => $this->is_active,
            'last_login_at' => $this->last_login_at,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ]);
    }
}
