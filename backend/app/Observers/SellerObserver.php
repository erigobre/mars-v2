<?php

namespace App\Observers;

use App\Models\Campaign;
use App\Models\RedemptionCycle;
use App\Models\Seller;
use App\Models\SellerSalesSnapshot;
use App\Services\Seller\SellerTierService;
use Carbon\Carbon;

class SellerObserver
{
    public function __construct(
        protected SellerTierService $tierService
    ) {}

    /**
     * Se ejecuta cuando se actualiza un vendedor
     */
    public function updating(Seller $seller): void
    {
        if ($seller->isDirty('seller_tier_id')) {
            return;
        }
        // Solo recalcular si cambió el promedio de ventas
        if ($seller->isDirty('average_monthly_sales')) {
            $this->tierService->assignTierToSeller($seller);
        }
    }

    /**
     * Se ejecuta cuando se crea un vendedor
     */
    public function creating(Seller $seller): void
    {
        $this->tierService->assignTierToSeller($seller);
    }

    public function saved(Seller $seller): void
    {
        if (!$seller->wasRecentlyCreated && !$seller->wasChanged('average_monthly_sales')) {
            return;
        }

        $averageSales = (float) $seller->average_monthly_sales;
        $scope = $seller->distributor->average_evaluation_scope ?? 'cycle';

        if ($scope === 'cycle') {
            $cycles = RedemptionCycle::with('campaign')->where('end_date', '>=', now())->get();

            foreach ($cycles as $cycle) {
                $meta = $cycle->calculateProportionalGoal($averageSales);
                $this->upsertSnapshot($seller->id, $cycle->campaign_id, $cycle->id, $meta);
            }
        } else {
            $campaigns = Campaign::where('end_date', '>=', now())->get();

            foreach ($campaigns as $campaign) {
                // Cálculo de días de la campaña
                $campaignDays = Carbon::parse($campaign->start_date)->diffInDays($campaign->end_date) + 1;
                $meta = round(($averageSales / 30.41) * $campaignDays, 2);

                $this->upsertSnapshot($seller->id, $campaign->id, null, $meta);
            }
        }
    }

    private function upsertSnapshot(int $sellerId, int $campaignId, ?int $cycleId, float $meta): void
    {
        SellerSalesSnapshot::updateOrCreate(
            [
                'seller_id'           => $sellerId,
                'campaign_id'         => $campaignId,
                'redemption_cycle_id' => $cycleId,
            ],
            [
                'target_average' => $meta,
                'goal'           => $meta,
            ]
        );
    }
}
