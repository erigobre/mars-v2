<?php

namespace App\Http\Resources\V1\Analytics;

use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerRankingResource extends JsonResource
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
        $isAdmin = $user && $user->role->slug === 'admin';
 
        return $this->camel([
            'rank'             => $this['rank'],
            'seller_id'        => $this['seller_id'],
            'seller_name'      => $this['seller_name'],
            'employee_code'    => $this['employee_code'],
            
            'total_points'     => (int) $this['total_points'],
            'average_monthly_sales' => $this['average_monthly_sales'] ?? 0,
            'current_sales'    => $this['current_sales'] ?? 0,
            'current_month_sales' => $this['current_month_sales'] ?? 0,
            
            'distributor_name' => $this['distributor_name'] ?? null,
            'distributor_id'   => $this['distributor_id'] ?? null,
        ]);
    }
}
