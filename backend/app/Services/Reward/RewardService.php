<?php

namespace App\Services\Reward;

use App\Filters\RewardFilter;
use App\Models\Campaign;
use App\Models\Reward;
use App\Models\RewardTierPrice;
use App\Models\SellerTier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RewardService
{
    public function getListQuery(Request $request)
    {
        $user = $request->user();
        $query = Reward::query();

        $this->applyTierPriceJoin($query, $user);
        $this->applyVisibilityFilters($query, $user, $request);
        $this->applyDynamicFilters($query, $request, $user);
        $this->applySorting($query, $user);

        return $query;
    }

    public function getCategories(): array
    {
        return Reward::whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->toArray();
    }

    /**
     * Sincroniza los precios de los rangos.
     */
    public function syncTierPrices(Reward $reward, array $prices): void
    {
        $data = collect($prices)->mapWithKeys(fn($item) => [
            $item['tier_id'] => ['price_in_points' => $item['price']]
        ]);

        $reward->tiers()->sync($data);
    }

    /**
     * Aplica los precios de la "matriz" (basados en otros premios del mismo costo base)
     * a un premio individual.
     */
    public function applyBulkPricesToReward(Reward $reward): void
    {
        if (!$reward->base_cost) {
            return;
        }

        // Obtener los precios más frecuentes para esta categoría base_cost en todos los rangos
        $matrixPrices = RewardTierPrice::join('rewards', 'rewards.id', '=', 'reward_tier_prices.reward_id')
            ->where('rewards.base_cost', $reward->base_cost->value)
            ->where('rewards.id', '!=', $reward->id) // Excluir al propio premio
            ->select('seller_tier_id', 'price_in_points')
            ->get()
            ->groupBy('seller_tier_id')
            ->map(function ($group) {
                // Tomar la moda (valor más frecuente) del grupo
                return $group->pluck('price_in_points')->mode()[0] ?? $group->first()->price_in_points;
            });

        if ($matrixPrices->isEmpty()) {
            return;
        }

        DB::transaction(function () use ($reward, $matrixPrices) {
            foreach ($matrixPrices as $tierId => $price) {
                RewardTierPrice::updateOrCreate(
                    ['reward_id' => $reward->id, 'seller_tier_id' => $tierId],
                    ['price_in_points' => $price]
                );
            }
        });
    }

    public function getPricesPerTier(Reward $reward)
    {
        $tiers = SellerTier::with('distributor')->active()->ordered()->get();
        $currentPrices = $reward->tierPrices()->pluck('price_in_points', 'seller_tier_id');

        return $tiers->map(fn($tier) => [
            'tier'      => $tier, // Pasamos el modelo completo de SellerTier
            'price'     => $currentPrices->get($tier->id) ?? $reward->points_required,
            'is_custom' => $currentPrices->has($tier->id)
        ]);
    }

    private function applyTierPriceJoin($query, $user): void
    {
        $tierId = $user->isSeller() ? $user->seller?->seller_tier_id : null;

        if ($tierId) {
            $query->select('rewards.*')
                ->selectRaw('COALESCE(rtp.price_in_points, rewards.points_required) as dynamic_price')
                ->leftJoin('reward_tier_prices as rtp', function ($join) use ($tierId) {
                    $join->on('rtp.reward_id', '=', 'rewards.id')
                        ->where('rtp.seller_tier_id', '=', $tierId);
                });
        } else {
            $query->select('rewards.*')
                ->selectRaw('rewards.points_required as dynamic_price');
        }
    }

    private function applyVisibilityFilters($query, $user, Request $request): void
    {
        if ($user->isAdmin()) {
            $query->with('tierPrices.sellerTier');

            match ($request->query('status')) {
                'active'       => $query->where('is_active', true),
                'inactive'     => $query->where('is_active', false),
                'out_of_stock' => $query->where('stock', '<=', 0),
                default        => null,
            };

            return;
        }

        $campaign        = Campaign::active()->orderBy('end_date', 'desc')->first();
        $isCampaignEnded = $campaign && now()->greaterThan($campaign->end_date->endOfDay());

        if ($isCampaignEnded) {
            $query->active()->visibleAtCampaignEnd();
        } else {
            $query->active()->visibleNow();
        }
    }

    private function applyDynamicFilters($query, Request $request, $user): void
    {
        $filter = new RewardFilter();
        foreach ($filter->transform($request) as $item) {
            if ($item['column'] === 'base_cost') {
                continue;
            }

            if ($item['method'] === 'whereIn') {
                $query->whereIn('rewards.' . $item['column'], $item['values']);
            } else {
                $query->where('rewards.' . $item['column'], $item['operator'], $item['value']);
            }
        }

        $baseCost = $request->input('baseCost');
        if (is_array($baseCost) && isset($baseCost['eq'])) {
            $baseCost = $baseCost['eq'];
        }
        if ($baseCost) {
            $enumVal = \App\Enums\BaseCost::tryFrom((int) $baseCost);
            if ($enumVal) {
                $query->where('rewards.base_cost', $enumVal);
            } else {
                $query->where('rewards.base_cost', (int) $baseCost);
            }
        }

        $status = $request->input('status');
        
        if ($status) {
            match ($status) {
                'active'       => $query->where('is_active', true),
                'inactive'     => $query->where('is_active', false),
                'out_of_stock' => $query->where('stock', '<=', 0),
                default        => null
            };
        }

        if ($request->boolean('onlyAffordable') && $user->isSeller() && $user->seller) {
            $query->having('dynamic_price', '<=', $user->seller->current_points);
        }


        // $user = $request->user();
        // if ($request->boolean('onlyAffordable') && $user->isSeller() && $user->seller) {
        //     $tierId = $user->seller->seller_tier_id;

        //     // Replicamos el COALESCE en el WHERE para asegurar compatibilidad estricta con MySQL
        //     $query->whereRaw(
        //         "COALESCE(
        //                         (SELECT price_in_points FROM reward_tier_prices 
        //                         WHERE reward_tier_prices.reward_id = rewards.id
        //                         AND reward_tier_prices.seller_tier_id = ? LIMIT 1), 
        //                         rewards.points_required) <= ?
        //                     ",
        //         [
        //             $tierId,
        //             $user->seller->current_points
        //         ]
        //     );
        // }
    }

    private function applySorting($query, $user): void
    {
        if ($user->isSeller()) {
            $query->orderByDesc('is_featured')->orderBy('dynamic_price', 'asc');
        } else {
            $query->orderByDesc('dynamic_price');
        }
    }
}
