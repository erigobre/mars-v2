<?php

namespace App\Http\Resources\V1\ActivityLog;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'actionType'  => $this->action_type,
            'modelType'   => $this->model_type,
            'modelId'     => $this->model_id,
            'description' => $this->description,
            'oldValues'   => $this->old_values,
            'newValues'   => $this->new_values,
            'ipAddress'   => $this->ip_address,
            'userAgent'   => $this->user_agent,
            'createdAt'   => $this->created_at?->toIso8601String(),

            'user' => $this->whenLoaded('user', function () {
                return [
                    'id'       => $this->user->id,
                    'username' => $this->user->username,
                    'email'    => $this->user->email,
                    'phone'    => $this->user->phone
                ];
            }),
        ];
    }
}
