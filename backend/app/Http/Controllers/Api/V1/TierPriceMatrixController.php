<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\BaseCost;
use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\TierPrice\BulkUpdateTierPricesRequest;
use App\Models\Distributor;
use App\Models\Reward;
use App\Models\SellerTier;
use App\Models\TierPricingRule;
use Illuminate\Support\Facades\DB;

class TierPriceMatrixController extends ApiController
{
    /**
     * GET /api/v1/admin/distributors/{distributor}/tier-price-matrix
     *
     * Devuelve la matriz de precios: categorías de base_cost × rangos del distribuidor.
     */
    public function show(Distributor $distributor)
    {
        $tiers = SellerTier::where('distributor_id', $distributor->id)
            ->active()
            ->ordered()
            ->get(['id', 'name', 'slug', 'color', 'icon', 'order']);

        if ($tiers->isEmpty()) {
            return $this->successResponse('Este distribuidor no tiene rangos configurados.', [
                'tiers'        => [],
                'categories'   => [],
                'matrix'       => (object) [],
                'rewardCounts' => (object) [],
            ]);
        }

        $categories = BaseCost::cases();
        $categoryValues = array_map(fn($c) => $c->value, $categories);

        // Contar premios por categoría
        $rewardCounts = Reward::whereIn('base_cost', $categoryValues)
            ->groupBy('base_cost')
            ->selectRaw('base_cost, COUNT(*) as count')
            ->pluck('count', 'base_cost');

        $tierIds = $tiers->pluck('id');

        // v2: leer directamente desde tier_pricing_rules (una fila por tier×base_cost)
        $rules = TierPricingRule::whereIn('seller_tier_id', $tierIds)
            ->get()
            ->groupBy('seller_tier_id');

        $matrix = [];
        foreach ($categoryValues as $baseCost) {
            $matrix[$baseCost] = [];
            foreach ($tiers as $tier) {
                $rule = $rules->get($tier->id)?->firstWhere('base_cost', $baseCost);
                $matrix[$baseCost][$tier->id] = $rule?->price_in_points;
            }
        }

        $categoryLabels = array_map(fn($c) => ['value' => $c->value, 'label' => $c->label()], $categories);

        return $this->successResponse('Matriz de precios obtenida.', [
            'tiers'        => $tiers,
            'categories'   => $categoryLabels,
            'matrix'       => $matrix,
            'rewardCounts' => $rewardCounts,
        ]);
    }

    /**
     * POST /api/v1/admin/distributors/{distributor}/bulk-tier-prices
     *
     * Actualiza masivamente los precios de todos los premios de una categoría
     * para los rangos de un distribuidor.
     */
    public function bulkUpdate(BulkUpdateTierPricesRequest $request, Distributor $distributor)
    {
        $rules = $request->validated()['rules'];

        // Validar que todos los tier_id pertenecen a este distribuidor
        $distributorTierIds = SellerTier::where('distributor_id', $distributor->id)
            ->pluck('id')
            ->toArray();

        $invalidTiers = collect($rules)->pluck('tier_id')->diff($distributorTierIds);
        if ($invalidTiers->isNotEmpty()) {
            return $this->errorResponse(
                'Algunos rangos no pertenecen a este distribuidor: ' . $invalidTiers->implode(', '),
                422
            );
        }

        // v2: escribe en tier_pricing_rules (1 fila por tier×base_cost, no por reward)
        DB::transaction(function () use ($rules) {
            foreach ($rules as $rule) {
                TierPricingRule::updateOrCreate(
                    ['seller_tier_id' => $rule['tier_id'], 'base_cost' => $rule['base_cost']],
                    ['price_in_points' => $rule['price_in_points']]
                );
            }
        });

        return $this->successResponse(
            'Matriz actualizada. Los nuevos premios heredarán estos precios automáticamente.',
            ['updated' => count($rules)]
        );
    }
}
