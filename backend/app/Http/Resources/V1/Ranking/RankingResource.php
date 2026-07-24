<?php

namespace App\Http\Resources\V1\Ranking;

use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RankingResource extends JsonResource
{
    use TransformsCamelCase;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $roleSlug = $user?->role?->slug;

        // Preparamos los datos en snake_case
        $data = [
            'rank'             => $this['rank'],
            'global_rank'      => $this['global_rank'],
            'seller_id'        => $this['seller_id'],
            'seller_name'      => $this['seller_name'],
            'avatar_url'       => $this['avatar_url'],
            'employee_code'    => $this['employee_code'],
            'total_points'     => (float) $this['total_points'],
            'distributor_name' => ($roleSlug === 'admin' && !$request->has('distributor_id'))
                ? $this['distributor_name']
                : null,
        ];

        return $this->camel($data);
    }
}
