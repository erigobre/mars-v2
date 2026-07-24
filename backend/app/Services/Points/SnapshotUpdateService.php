<?php

namespace App\Services\Points;

use App\Models\Campaign;
use App\Models\Distributor;
use App\Models\RedemptionCycle;
use App\Models\Seller;
use App\Models\SellerSalesSnapshot;
use Carbon\Carbon;

class SnapshotUpdateService
{
    /**
     * Recalcula la meta (target_average) de los snapshots en curso para un vendedor
     */
    public function updateActiveSnapshotsForSeller(Seller $seller, bool $onlyActive = true): void
    {
        $distributor = $seller->distributor;
        if (!$distributor) return;

        $promedio = (float) $seller->average_monthly_sales;
        $crecimiento = (float) $distributor->growth_percentage;
        $scope = $distributor->average_evaluation_scope ?? 'cycle';

        // Encontrar ciclos y campañas activos en este instante
        $now = now();

        if ($scope === 'cycle') {
            $cyclesQuery = RedemptionCycle::whereHas('campaign', fn($q) => $q->where('is_active', true));
            if ($onlyActive) {
                $cyclesQuery->where('start_date', '<=', $now)->where('end_date', '>=', $now);
            }
            $activeCycles = $cyclesQuery->get();

            foreach ($activeCycles as $cycle) {
                $snapshot = SellerSalesSnapshot::firstOrCreate(
                    [
                        'seller_id' => $seller->id,
                        'redemption_cycle_id' => $cycle->id,
                    ],
                    [
                        'campaign_id' => $cycle->campaign_id,
                        'total_units_sold' => 0,
                        'target_average' => 0,
                    ]
                );

                if ($snapshot) {
                    $startDate = Carbon::parse($cycle->start_date);
                    $endDate = Carbon::parse($cycle->end_date);
                    $daysInMonth = $startDate->daysInMonth;
                    $cycleDays = $startDate->diffInDays($endDate) + 1;

                    if ($cycleDays >= 28 && $cycleDays <= 32) {
                        $base = $promedio;
                    } else {
                        $base = ($promedio / $daysInMonth) * $cycleDays;
                    }
                    $meta = round($base * (1 + ($crecimiento / 100)), 2);

                    $snapshot->update(['target_average' => $meta]);
                }
            }
        } else {
            $campaignsQuery = Campaign::where('is_active', true);
            if ($onlyActive) {
                $campaignsQuery->where('start_date', '<=', $now)->where('end_date', '>=', $now);
            }
            $activeCampaigns = $campaignsQuery->get();

            foreach ($activeCampaigns as $campaign) {
                $snapshot = SellerSalesSnapshot::firstOrCreate(
                    [
                        'seller_id' => $seller->id,
                        'campaign_id' => $campaign->id,
                        'redemption_cycle_id' => null,
                    ],
                    [
                        'total_units_sold' => 0,
                        'target_average' => 0,
                    ]
                );

                if ($snapshot) {
                    $startDate = Carbon::parse($campaign->start_date);
                    $endDate = Carbon::parse($campaign->end_date);
                    $campaignDays = $startDate->diffInDays($endDate) + 1;
                    $base = ($promedio / 30.41) * $campaignDays;
                    $meta = round($base * (1 + ($crecimiento / 100)), 2);

                    $snapshot->update(['target_average' => $meta]);
                }
            }
        }
    }

    /**
     * Recalcula la meta de los snapshots en curso para todos los vendedores de un distribuidor
     */
    public function updateActiveSnapshotsForDistributor(Distributor $distributor): void
    {
        $distributor->sellers()->chunkById(100, function ($sellers) {
            foreach ($sellers as $seller) {
                $this->updateActiveSnapshotsForSeller($seller);
            }
        });
    }
}
