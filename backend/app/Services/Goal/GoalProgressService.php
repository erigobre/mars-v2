<?php

namespace App\Services\Goal;

use App\Enums\GoalType;
use App\Enums\PointTransactionTypes;
use App\Models\Goal;
use App\Models\PointTransaction;
use App\Models\RedemptionCycle;
use App\Models\Sale;
use App\Models\Seller;
use App\Models\SellerGoalProgress;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GoalProgressService
{
    /**
     * PUNTO DE ENTRADA PRINCIPAL
     *
     * Evalúa todas las metas activas que aplican a esta venta.
     * Se llama DENTRO de la transacción de SaleService::persistOneSale,
     * por lo que cualquier fallo revierte todo (venta + progreso + puntos).
     *
     */
    public function evaluateForSale(Sale $sale): void
    {
        $sale->load('items.product');

        // Encontrar el ciclo que contiene la fecha de esta venta
        $cycleIds = RedemptionCycle::where('is_active', true)
            ->where('start_date', '<=', $sale->sale_date)
            ->where('end_date',   '>=', $sale->sale_date)
            ->pluck('id');

        if ($cycleIds->isEmpty()) {
            return;
        }

        // Metas activas de ese ciclo
        $goals = Goal::whereIn('cycle_id', $cycleIds)
            ->where('is_active', true)
            ->with(['product', 'display'])
            ->get();

        Log::info('GoalProgressService: evaluando metas', [
            'cycleIds' => $cycleIds,
            'sale_id'  => $sale->id,
            'goals'    => $goals->count(),
            'items'    => $sale->items()->count(),
        ]);

        if ($goals->isEmpty()) return;

        foreach ($goals as $goal) {
            $this->processGoalForSale($goal, $sale);
        }
    }

    private function processGoalForSale(Goal $goal, Sale $sale): void
    {
        $increment = $this->calculateIncrement($goal, $sale);

        if ($increment <= 0) {
            return;
        }

        // firstOrCreate: si el vendedor nunca tuvo progreso en esta meta, lo creamos
        $progress = SellerGoalProgress::firstOrCreate(
            [
                'goal_id'   => $goal->id,
                'seller_id' => $sale->seller_id,
            ],
            [
                'current_value' => 0,
                'reached'       => false,
                'bonus_awarded' => false,
            ]
        );

        $previousValue = (float) $progress->current_value;
        $newValue      = $previousValue + $increment;

        // Comparamos SIEMPRE contra el target_value VIGENTE de la meta
        $targetValue = (float) $goal->target_value;
        $wasReached  = $progress->reached; // ¿Ya la realizo?
        $nowReached  = $newValue >= $targetValue; // ¿Ahora la realizo?

        $updateData = [
            'current_value' => $newValue,
            'reached'       => $nowReached,
        ];

        // Timestamp solo la primera vez que se alcanza
        if (!$wasReached && $nowReached) $updateData['reached_at'] = now();

        $progress->update($updateData);

        Log::info('GoalProgressService: progreso actualizado', [
            'goal_id'   => $goal->id,
            'seller_id' => $sale->seller_id,
            'sale_id'   => $sale->id,
            'prev'      => $previousValue,
            'increment' => $increment,
            'new'       => $newValue,
            'target'    => $targetValue,
            'reached'   => $nowReached,
        ]);

        // ── Otorgar bono solo UNA VEZ, en el momento exacto de cumplir ──
        if (!$wasReached && $nowReached && !$progress->bonus_awarded && $goal->reward_points > 0) {
            $this->awardGoalBonus($goal, $sale->seller_id, $progress);
        }
    }


    /**
     * Devuelve cuánto aporta esta venta al progreso de la meta dada.
     *
     * TOTAL_SALES_AMOUNT: suma el monto total reportado de la venta ($)
     * SPECIFIC_PRODUCT_QTY: suma la cantidad del producto específico (goal.product_id) en los items
     * TOTAL_DISPLAY_QTY: suma la cantidad de TODOS los items cuyos productos pertenecen al display (goal.display_id)
     */
    private function calculateIncrement(Goal $goal, Sale $sale): float
    {
        return match ($goal->type) {

            GoalType::TOTAL_SALES_AMOUNT =>
                (float) $sale->total_amount,

            GoalType::SPECIFIC_PRODUCT_QTY =>
                (float) $sale->items()
                    ->where('product_id', $goal->product_id)
                    ->sum('quantity'),

            GoalType::TOTAL_DISPLAY_QTY =>
                // Los items saben su display_id (columna ya existe en sale_items)
                // o podemos filtrar por los productos con ese display
                (float) $sale->items()
                    ->whereHas('product', fn($q) => $q->where('display_id', $goal->display_id))
                    ->sum('quantity'),
        };
    }

    /**
     * Otorga los reward_points de la meta al vendedor.
     * Crea la transacción de puntos y actualiza current_points.
     * Marca bonus_awarded = true para no duplicar.
     *
     * Todo ocurre dentro de la misma transacción de la venta.
     */
    private function awardGoalBonus(Goal $goal, int $sellerId, SellerGoalProgress $progress): void
    {
        // lockForUpdate porque persistOneSale ya tiene al seller bloqueado,
        // pero como evaluateForSale puede llamarse en bulk con distintos sellers,
        // el lock individual aquí es seguro.
        $seller     = Seller::lockForUpdate()->findOrFail($sellerId);
        $newBalance = $seller->current_points + $goal->reward_points;

        // Incrementar puntos del vendedor
        $seller->increment('current_points', $goal->reward_points);

        // Registrar en historial
        PointTransaction::create([
            'seller_id'     => $seller->id,
            'amount'        => $goal->reward_points,
            'type'          => PointTransactionTypes::GOAL_BONUS->value,
            'balance_after' => $newBalance,
            'sale_id'       => null,
        ]);

        // Marcar el bono como otorgado (no se puede duplicar)
        $progress->update(['bonus_awarded' => true]);

        log_action(
            'GOAL_BONUS_AWARDED',
            $seller,
            "Bono de {$goal->reward_points} pts otorgado al vendedor {$seller->user->username} " .
            "por alcanzar la meta '{$goal->name}' (ciclo ID {$goal->cycle_id})"
        );

        Log::info('GoalProgressService: bono otorgado', [
            'goal_id'       => $goal->id,
            'seller_id'     => $seller->id,
            'reward_points' => $goal->reward_points,
            'new_balance'   => $newBalance,
        ]);
    }


    /**
     * Re-evalúa el flag 'reached' de todos los progresos de una meta
     * después de que el admin modifique target_value.
     *
     * - Si el target bajó → algunos vendedores que no habían llegado ahora sí.
     * - Si el target subió → algunos que ya habían llegado puede que ya no.
     *   En este caso NO se retira el bono ya otorgado (bonus_awarded permanece true).
     */
    public function reEvaluateGoal(Goal $goal): void
    {
        DB::transaction(function () use ($goal) {
            $targetValue = (float) $goal->target_value;

            $progresses = SellerGoalProgress::where('goal_id', $goal->id)
                ->with('seller')
                ->get();

            foreach ($progresses as $progress) {
                $nowReached = (float) $progress->current_value >= $targetValue;
                $wasReached = $progress->reached;

                $updates = ['reached' => $nowReached];

                // Si acaba de alcanzarla (el admin bajó el target)
                if (!$wasReached && $nowReached) {
                    $updates['reached_at'] = now();

                    // Otorgar bono si aún no se ha dado
                    if (!$progress->bonus_awarded && $goal->reward_points > 0) {
                        $this->awardGoalBonus($goal, $progress->seller_id, $progress);
                        $progress->refresh(); // bonus_awarded ya cambió
                    }
                }

                $progress->update($updates);
            }

            Log::info('GoalProgressService: re-evaluación post-edición', [
                'goal_id'     => $goal->id,
                'target_value'=> $targetValue,
                'affected'    => $progresses->count(),
            ]);
        });
    }
}