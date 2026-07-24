<?php

namespace App\Services\Seller;

use App\Enums\GoalType;
use App\Enums\PointTransactionTypes;
use App\Enums\RewardClaimStatus;
use App\Models\Campaign;
use App\Models\Goal;
use App\Models\PointTransaction;
use App\Models\RedemptionCycle;
use App\Models\RedemptionWindow;
use App\Models\Reward;
use App\Models\Sale;
use App\Models\Seller;
use App\Models\SellerGoalProgress;
use App\Models\SellerSalesSnapshot;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SellerDashboardService
{
    public function getData(Seller $seller): array
    {
        $now = now();

        $campaign = Campaign::current()->first();
        $cycle    = $campaign ? RedemptionCycle::current()->where('campaign_id', $campaign->id)->first() : null;

        $openWindow = $cycle ? RedemptionWindow::open()->where('cycle_id', $cycle->id)->first() : null;
        $nextWindow = (!$openWindow && $cycle) // Si no hay una ventana abierta pero si un ciclo
            ? RedemptionWindow::where('cycle_id', $cycle->id)
            ->where('opens_at', '>', $now)
            ->orderBy('opens_at')
            ->first()
            : null;

        $pendingReservations = $seller->claims()
            ->where('status', RewardClaimStatus::RESERVED->value)
            ->where('reserved_until', '>', $now)
            ->with('reward')
            ->get();

        $totalSalesAmount = 0.0;
        $totalUnitsSold = 0.0;
        if ($campaign) {
            $totalSalesAmount = (float) Sale::where('seller_id', $seller->id)
                ->whereBetween('sale_date', [$campaign->start_date, $campaign->end_date])
                ->sum('total_amount');

            $snapshot = $cycle ? SellerSalesSnapshot::where('seller_id', $seller->id)
                ->where('redemption_cycle_id', $cycle->id)
                ->first() : null;

            if (!$snapshot) {
                $snapshot = SellerSalesSnapshot::where('seller_id', $seller->id)
                    ->where('campaign_id', $campaign->id)
                    ->whereNull('redemption_cycle_id')
                    ->first();
            }

            if ($snapshot) {
                $totalUnitsSold = (float) $snapshot->total_units_sold;
            }
        }

        $cyclePoints = 0;
        if ($cycle) {
            $cyclePoints = (int) PointTransaction::where('point_transactions.seller_id', $seller->id)
                ->whereIn('point_transactions.type', PointTransactionTypes::incrementValues())
                ->leftJoin('sales', 'sales.id', '=', 'point_transactions.sale_id')
                ->where(function ($query) use ($cycle) {
                    $query->where(function ($q) use ($cycle) {
                        $q->whereNotNull('point_transactions.sale_id')
                          ->whereBetween('sales.sale_date', [$cycle->start_date, $cycle->end_date]);
                    })->orWhere(function ($q) use ($cycle) {
                        $q->whereNull('point_transactions.sale_id')
                          ->whereBetween('point_transactions.created_at', [$cycle->start_date, $cycle->end_date]);
                    });
                })
                ->sum('point_transactions.amount');
        }

        // Lógica de las dos metas delegada a una nueva función
        // $goalsData = $this->getDashboardGoals($seller, $cycle, $cyclePoints);
        $goalsData = $this->getGoalsData($seller, $campaign, $cycle);

        $claimedThisCycle = $cycle
            ? $seller->claims()->where('redemption_cycle_id', $cycle->id)->exists()
            : false;

        // Retornamos un arreglo de MODELOS (DTO), el Resource se encargará de filtrarlo
        return [
            'seller'           => $seller,
            'cycle'            => $cycle,
            'openWindow'       => $openWindow,
            'nextWindow'       => $nextWindow,
            'cyclePoints'      => $cyclePoints,
            'totalSalesAmount' => $totalSalesAmount,
            'totalUnitsSold'   => $totalUnitsSold,
            'claimedThisCycle' => $claimedThisCycle,
            'goalsData'        => $goalsData,
            'pendingReservations' => $pendingReservations,
        ];
    }

    private function getGoalsData(Seller $seller, ?Campaign $campaign, ?RedemptionCycle $cycle): array
    {
        // META PRINCIPAL (Promedio + Crecimiento)
        $averageGoal = null;

        if ($campaign && $cycle) {
            $distributor = $seller->distributor;

            Log::info('Distribuidor: ' . json_encode($distributor));

            // Calculamos el Target: Promedio + (Promedio * Crecimiento%)
            $promedio    = (float) $seller->average_monthly_sales;

            if ($promedio > 0) {
                $scope = $distributor->average_evaluation_scope ?? 'cycle';

                $promedioAjustado = $promedio;

                if ($scope === 'cycle') {
                    $startDate = Carbon::parse($cycle->start_date);
                    $endDate = Carbon::parse($cycle->end_date);

                    $cycleDays = $startDate->diffInDays($endDate) + 1;

                    if ($cycleDays >= 28 && $cycleDays <= 31) {
                        $promedioAjustado = $promedio;
                    } else {
                        $daysInMonth = $startDate->daysInMonth;
                        $promedioAjustado = ($promedio / $daysInMonth) * $cycleDays;
                    }
                }

                $crecimiento = (float) $distributor->growth_percentage;
                $targetValue = round($promedioAjustado * (1 + ($crecimiento / 100)), 2);

                $snapshotQuery = SellerSalesSnapshot::where('seller_id', $seller->id);
                if ($scope === 'cycle') {
                    $snapshotQuery->where('redemption_cycle_id', $cycle->id);
                } else {
                    $snapshotQuery->where('campaign_id', $campaign->id)
                        ->whereNull('redemption_cycle_id');
                }

                $snapshot = $snapshotQuery->first();
                $currentValue = $snapshot ? (float) $snapshot->total_units_sold : 0.0;

                if ($snapshot && $snapshot->target_average > 0) {
                    $targetValue = (float) $snapshot->target_average;
                }

                $reached = $targetValue > 0 && $currentValue >= $targetValue;
                $remaining = max(0, round($targetValue - $currentValue));

                $description = $reached
                    ? '¡Lograste tu meta! Ya estás acumulando puntos 🏆'
                    : 'Te faltan ' . number_format($remaining, 0, '.', ',') . ' cajas de ' . number_format($targetValue, 0, '.', ',') . ' para comenzar a acumular puntos, ¡sigue así!';


                $averageGoal = [
                    'name'                  => 'Meta ' . ($scope === 'cycle' ? 'del Periodo' : 'de la Campaña'),
                    'description'           => $description,
                    'target_value'          => $targetValue,
                    'current_value'         => $currentValue,
                    'percentage'            => $targetValue > 0 ? min(round(($currentValue / $targetValue) * 100, 1), 100) : 0,
                    'reached'               => $reached,
                    'growth_percentage'     => $promedioAjustado > 0 ? round((($currentValue * 100) / $promedioAjustado) - 100, 1) : 0,
                ];
            }
        }

        // META SECUNDARIA (Normal - Cercana/Nueva)
        $allProgresses = SellerGoalProgress::with('goal')
            ->where('seller_id', $seller->id)
            ->whereHas('goal', function ($q) {
                $q->active();
            })
            ->get()
            ->map(function ($progress) {
                $goal = clone $progress->goal;
                $currentValue = match ($goal->type->value) {
                    GoalType::AMOUNT->value   => $progress->amount_accumulated,
                    GoalType::UNITS->value    => $progress->units_accumulated,
                    GoalType::DISPLAYS->value => $progress->displays_accumulated,
                    default => 0,
                };

                $virtual = new SellerGoalProgress([
                    'seller_id'     => $progress->seller_id,
                    'goal_id'       => $progress->goal_id,
                    'current_value' => $currentValue,
                    'reached'       => false,
                ]);
                $virtual->setRelation('goal', $goal);
                return $virtual;
            });

        // Buscamos la más cercana a completarse
        $secondaryGoal = $allProgresses->filter(fn($p) => !$p->reached)
            ->sortByDesc(fn($p) => $p->goal->target_value > 0 ? ($p->current_value / $p->goal->target_value) : 0)
            ->first();

        // Si ya completó todas o no hay progreso, tomamos la más nueva creada
        if (!$secondaryGoal) {
            $secondaryGoal = $allProgresses->sortByDesc(fn($p) => $p->goal->created_at)->first();
        }

        return [
            'mainGoal'      => $averageGoal,
            'secondaryGoal' => $secondaryGoal, // null si no tiene metas asignadas
        ];
    }

    /**
     * Extrae la meta más cercana a cumplirse y la más reciente.
     */
    private function getDashboardGoals(Seller $seller, ?RedemptionCycle $cycle, int $cyclePoints): array
    {
        if (!$cycle) {
            return $this->getFallbackGoal($cyclePoints);
        }

        // Obtener todas las metas activas de este ciclo
        $activeGoals = Goal::where('cycle_id', $cycle->id)->where('is_active', true)->get();

        if ($activeGoals->isEmpty()) {
            return $this->getFallbackGoal($cyclePoints);
        }

        // Obtener los progresos reales del vendedor
        $progresses = SellerGoalProgress::where('seller_id', $seller->id)
            ->whereIn('goal_id', $activeGoals->pluck('id'))
            ->with('goal')
            ->get()
            ->keyBy('goal_id');

        // Crear "Progresos Virtuales" para las metas que el vendedor aún no ha iniciado (0%)
        $allProgresses = $activeGoals->map(function ($goal) use ($progresses, $seller) {
            if ($progresses->has($goal->id)) {
                return $progresses->get($goal->id);
            }

            // Progreso en memoria (no se guarda en base de datos)
            $virtual = new SellerGoalProgress([
                'goal_id'       => $goal->id,
                'seller_id'     => $seller->id,
                'current_value' => 0,
                'reached'       => false,
            ]);
            $virtual->setRelation('goal', $goal);
            return $virtual;
        });

        $closest = $allProgresses->filter(fn($p) => !$p->reached)
            ->sortByDesc(fn($p) => $p->goal->target_value > 0 ? ($p->current_value / $p->goal->target_value) : 0)
            ->first();

        // Si ya completó todas, mostramos cualquiera (la de target más alto)
        if (!$closest) {
            $closest = $allProgresses->sortByDesc(fn($p) => $p->goal->target_value)->first();
        }

        $newest = $allProgresses->sortByDesc(fn($p) => $p->goal->created_at)
            ->first(fn($p) => $p->goal_id !== $closest->goal_id);

        return [
            'closest'  => $closest,
            'newest'   => $newest,
            'fallback' => null,
        ];
    }

    private function getFallbackGoal(int $cyclePoints): array
    {
        $minPts = Reward::active()->min('points_required') ?? 0;
        return [
            'closest' => null,
            'newest'  => null,
            'fallback' => [
                'goalPoints'    => (float) $minPts,
                'currentPoints' => $cyclePoints,
                'percentage'    => $minPts > 0 ? min(round($cyclePoints / $minPts * 100, 1), 100.0) : 100.0,
                'reached'       => $minPts === 0 || $cyclePoints >= $minPts,
                'source'        => 'reward_minimum',
                'goalName'      => 'Sin meta asignada',
            ]
        ];
    }
}
