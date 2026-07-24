<?php

namespace App\Http\Resources\V1\Seller;

use App\Http\Resources\V1\Goal\GoalProgressResource;
use App\Http\Resources\V1\Reward\RewardClaimResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerDashboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Obtenemos las variables limpias que mandó el Service
        $cycle = $this->resource['cycle'];
        $openWindow = $this->resource['openWindow'];
        $nextWindow = $this->resource['nextWindow'];
        $goalsData = $this->resource['goalsData'];
        $pendingReservations = $this->resource['pendingReservations'];

        return [
            'seller' => [
                'id'            => $this->resource['seller']->id,
                'name'          => $this->resource['seller']->user?->username ?? 'Desconocido',
                'avatar'        => $this->resource['seller']->user?->avatar ?? null,
                'currentPoints' => (int) $this->resource['seller']->current_points,
            ],
            'cycle' => $cycle ? [
                'id'        => $cycle->id,
                'name'      => $cycle->name,
                'startDate' => $cycle->start_date?->toISOString(),
                'endDate'   => $cycle->end_date?->toISOString(),
            ] : null,
            'storeStatus' => [
                'isOpen'           => (bool) $openWindow,
                'opensAt'          => $openWindow?->opens_at?->toISOString(),
                'closesAt'         => $openWindow?->closes_at?->toISOString(),
                'nextOpeningAt'    => $nextWindow?->opens_at?->toISOString(),
                'claimedThisCycle' => $this->resource['claimedThisCycle'],
                'pendingReservationsCount' => $pendingReservations->count(),
                'pendingReservations'      => RewardClaimResource::collection($pendingReservations),
            ],
            'stats' => [
                'cyclePoints'      => $this->resource['cyclePoints'],
                'totalSalesAmount' => round($this->resource['totalSalesAmount'], 2),
                'totalUnitsSold'   => $this->resource['totalUnitsSold'],
            ],
            'goals' => [
                'mainGoal'      => $goalsData['mainGoal'] ? [
                    'name'               => $goalsData['mainGoal']['name'],
                    'description'        => $goalsData['mainGoal']['description'],
                    'targetValue'        => $goalsData['mainGoal']['target_value'],
                    'currentValue'       => $goalsData['mainGoal']['current_value'],
                    'percentage'         => $goalsData['mainGoal']['percentage'],
                    'reached'            => $goalsData['mainGoal']['reached'],
                    'growthPercentage'   => $goalsData['mainGoal']['growth_percentage'] ?? null,
                ] : null,
                'secondaryGoal' => $goalsData['secondaryGoal'] ? new GoalProgressResource($goalsData['secondaryGoal']) : null,
                // 'closest'  => $goalsData['closest'] ? new GoalProgressResource($goalsData['closest']) : null,
                // 'newest'   => $goalsData['newest'] ? new GoalProgressResource($goalsData['newest']) : null,
                // 'fallback' => $goalsData['fallback'],
            ],
        ];
    }
}
