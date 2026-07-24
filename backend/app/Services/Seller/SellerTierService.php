<?php

namespace App\Services\Seller;

use App\Models\Seller;
use App\Models\SellerTier;
use Illuminate\Support\Facades\Log;

class SellerTierService
{
    protected array $distributorTiersCache = [];
    protected ?\Illuminate\Database\Eloquent\Collection $globalTiersCache = null;

    public function assignTierToSeller(Seller $seller): ?SellerTier
    {
        $average = (float) $seller->average_monthly_sales;
        $oldTierId = $seller->seller_tier_id;
        $tier = null;

        if ($average >= 0) {
            if (!isset($this->distributorTiersCache[$seller->distributor_id])) {
                $this->distributorTiersCache[$seller->distributor_id] = SellerTier::active()
                    ->forDistributor($seller->distributor_id)
                    ->ordered()
                    ->get();
            }
            $distributorTiers = $this->distributorTiersCache[$seller->distributor_id];

            $tier = $distributorTiers->first(fn($t) => $t->isInRange($average));

            if (!$tier) {
                if ($this->globalTiersCache === null) {
                    $this->globalTiersCache = SellerTier::active()
                        ->global()
                        ->ordered()
                        ->get();
                }
                $globalTiers = $this->globalTiersCache;

                $tier = $globalTiers->first(fn($t) => $t->isInRange($average));
            }
        }

        $seller->seller_tier_id = $tier ? $tier->id : null;

        if ($oldTierId !== $seller->seller_tier_id) {
            if (!$tier) {
                Log::warning("No se encontró rango para vendedor {$seller->id} con promedio {$average}. Se removió su tier.");
            } else {
                Log::info("Vendedor {$seller->id} cambió de rango", [
                    'old_tier_id' => $oldTierId,
                    'new_tier_id' => $tier->id,
                    'average'     => $average,
                ]);
            }
        }

        return $tier;
    }

    public function recalculateAllTiers(): array
    {
        $this->distributorTiersCache = [];
        $this->globalTiersCache = null;

        // Utilizamos chunk para evitar problemas de memoria en grandes cantidades de vendedores
        $stats = ['updated' => 0, 'unchanged' => 0, 'errors' => 0];

        Seller::with('tier')->chunkById(100, function ($sellers) use (&$stats) {
            foreach ($sellers as $seller) {
                try {
                    $oldTierId = $seller->seller_tier_id;
                    $this->assignTierToSeller($seller);

                    if ($oldTierId !== $seller->seller_tier_id) {
                        $seller->saveQuietly();
                        $stats['updated']++;
                    } else {
                        $stats['unchanged']++;
                    }
                } catch (\Exception $e) {
                    $stats['errors']++;
                    Log::error("Error asignando tier a vendedor {$seller->id}: {$e->getMessage()}");
                }
            }
        });

        return $stats;
    }
}
