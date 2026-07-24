<?php

namespace App\Http\Resources\V1\Seller;

use App\Http\Resources\V1\Distributor\DistributorResource;
use App\Http\Resources\V1\Goal\GoalProgressResource;
use App\Http\Resources\V1\Sale\SaleResource;
use App\Http\Resources\V1\Sale\SellerSalesSnapshotResource;
use App\Http\Resources\V1\Seller\SellerTierResource;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerResource extends JsonResource
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

        return $this->camel([
            'id' => $this->id,
            
            // Datos del usuario
            'username' => $this->user?->username ?? 'Usuario Eliminado',
            'email' => $this->user?->email,
            'phone' => $this->user?->phone,
            'avatar_url' => $this->user ? $this->user->avatarUrl() : null,
            'avatar_thumbnail' => $this->user ? $this->user->thumbAvatarUrl() : null,
            'is_active' => $this->user?->is_active ?? false,
            'last_login_at' => $this->user?->last_login_at,
            
            // Datos específicos del vendedor
            'employee_code' => $this->employee_code,
            'current_points' => (int) $this->current_points,
            // 'distributor' => new DistributorResource($this->whenLoaded('distributor')),
            'distributor' => $this->whenLoaded('distributor', fn() => $this->distributor ? new DistributorResource($this->distributor) : null),

            'tier' => $this->whenLoaded('tier', fn() => $this->tier ? new SellerTierResource($this->tier) : null),
            
            // 2. Progreso de Ventas / Metas
            'goal_progresses' => GoalProgressResource::collection($this->whenLoaded('goalProgresses')),
            
            // 3. Snapshots
            'sales_snapshots' => SellerSalesSnapshotResource::collection($this->whenLoaded('salesSnapshots')),

            'sales' => $this->whenLoaded('sales', fn() => SaleResource::collection($this->sales)),
            
            // 4. Estadísticas (Agregaciones de Laravel que cargamos en el controlador)
            'statistics' => $this->when(isset($this->sales_count), function () {
                return [
                    'total_sales_count' => $this->sales_count,
                    // 'total_sales_amount' => $this->sales_sum_total_amount ?? 0, 
                ];
            }),
            
            
            // Dirección
            'address' => [
                'street' => $this->address_street,
                'colonia' => $this->address_colonia,
                'city' => $this->address_city,
                'state' => $this->address_state,
                'zip' => $this->address_zip,
            ],
            'shipping_notes' => $this->shipping_notes,

            'average_monthly_sales' => (float) $this->average_monthly_sales,
            
            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ]);
    }
}
