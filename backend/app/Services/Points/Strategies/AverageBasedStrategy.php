<?php

namespace App\Services\Points\Strategies;

use App\Contracts\PointsCalculationStrategy;
use App\Models\Distributor;
use App\Models\RedemptionCycle;
use App\Models\Sale;
use App\Models\Seller;
use App\Models\SellerSalesSnapshot;
use Carbon\Carbon;

class AverageBasedStrategy implements PointsCalculationStrategy
{
    private array $calculationDetails = [];

    public function calculatePoints(Sale $sale, Seller $seller, Distributor $distributor, array $resolvedItems): int
    {
        $promedio = (float) $seller->average_monthly_sales;
        $crecimiento = (float) $distributor->growth_percentage;

        if ($promedio <= 0) {
            $this->calculationDetails = [
                'strategy' => 'average_based',
                'error' => 'Vendedor sin promedio configurado',
                'points_awarded' => 0,
            ];
            return 0;
        }



        $saleDate = Carbon::parse($sale->sale_date);

        $activeCycle = RedemptionCycle::with('campaign')
            ->where('start_date', '<=', $saleDate->format('Y-m-d'))
            ->where('end_date', '>=', $saleDate->format('Y-m-d'))
            ->whereHas('campaign', fn($q) => $q->where('is_active', true))
            ->first();

        if (!$activeCycle) {
            $this->calculationDetails = [
                'strategy' => 'average_based',
                'error' => 'No hay ciclos de redención activos',
                'points_awarded' => 0,
            ];
            return 0;
        }

        // $startDate = Carbon::parse($activeCycle->start_date);
        // $endDate = Carbon::parse($activeCycle->end_date);

        // $daysInMonth = $startDate->daysInMonth;
        // $cycleDays = $startDate->diffInDays($endDate) + 1;

        // $meta = round(($promedio / $daysInMonth) * $cycleDays, 2);

        $scope = $distributor->average_evaluation_scope ?? 'cycle';
        $snapshotSearch = ['seller_id' => $seller->id];

        if ($scope === 'cycle') {
            $startDate = Carbon::parse($activeCycle->start_date);
            $endDate = Carbon::parse($activeCycle->end_date);
            
            $daysInMonth = $startDate->daysInMonth;
            $cycleDays = $startDate->diffInDays($endDate) + 1;

            // Si el ciclo es de un mes completo (entre 28 y 32 días), tomamos el promedio tal cual
            // para evitar que fluctuaciones de días en el mes ajusten un 55 a 57.
            if ($cycleDays >= 28 && $cycleDays <= 32) {
                $base = (float) $promedio;
            } else {
                $base = ($promedio / $daysInMonth) * $cycleDays;
            }
            $meta = round($base * (1 + ($crecimiento / 100)), 2);

            // Datos a buscar
            $snapshotSearch['redemption_cycle_id'] = $activeCycle->id;
            // Datos adicionales al crear si no existe
            $snapshotDefaults = [
                'campaign_id' => $activeCycle->campaign_id,
                'total_units_sold' => 0,
                'target_average' => $meta,
            ];
        } else {
            $campaign = $activeCycle->campaign;
            $startDate = Carbon::parse($campaign->start_date);
            $endDate = Carbon::parse($campaign->end_date);
            
            // Calculamos cuánto dura la campaña completa (ej. 60 días, 90 días)
            $campaignDays = $startDate->diffInDays($endDate) + 1;
            
            // Usamos un mes estándar (30.41 días en promedio) para calcular la meta total
            $base = ($promedio / 30.41) * $campaignDays;
            $meta = round($base * (1 + ($crecimiento / 100)), 2);

            // Datos a buscar
            $snapshotSearch['campaign_id'] = $activeCycle->campaign_id;
            $snapshotSearch['redemption_cycle_id'] = null;
            // Datos adicionales al crear si no existe
            $snapshotDefaults = ['total_units_sold' => 0, 'target_average' => $meta];
        }

        $snapshot = SellerSalesSnapshot::firstOrCreate($snapshotSearch, $snapshotDefaults);

        $meta = ($snapshot->target_average > 0) ? (float) $snapshot->target_average : $meta;

        if ($snapshot->target_average <= 0) {
            $snapshot->update(['target_average' => $meta]);
        }

        // Only count items with a resolved product_id
        $currentSaleUnits = (float) collect($resolvedItems)->whereNotNull('product_id')->sum('quantity');

        // Idempotent calculation: Read actual units from DB for this period, strictly BEFORE the current sale chronologically
        $previousUnits = (float) \App\Models\SaleItem::whereNotNull('product_id')
            ->whereHas('sale', function ($q) use ($seller, $sale, $startDate, $endDate) {
                $q->where('seller_id', $seller->id)
                  ->whereBetween('sale_date', [$startDate->copy()->startOfDay(), $endDate->copy()->endOfDay()])
                  ->where(function ($query) use ($sale) {
                      $query->where('sale_date', '<', $sale->sale_date)
                            ->orWhere(function ($subq) use ($sale) {
                                $subq->where('sale_date', '=', $sale->sale_date)
                                     ->where('id', '<', $sale->id);
                            });
                  });
            })->sum('quantity');

        $newUnits = $previousUnits + $currentSaleUnits;

        // Absolute update instead of increment() to ensure idempotency
        $snapshot->update(['total_units_sold' => $newUnits]);

        if ($newUnits <= $meta) {
            $this->calculationDetails = [
                'strategy' => 'average_based',
                'status' => 'Promedio no superado aún.',
                'scope' => $scope,
                'promedio_base' => $promedio,
                // 'crecimiento_pct' => $crecimiento,
                'meta_calculada' => $meta,
                'acumulado_anterior' => $previousUnits,
                'unidades_esta_venta' => $currentSaleUnits,
                'total_acumulado' => $newUnits,
                'meta_alcanzada' => false,
                'faltante' => $meta - $newUnits,
                'puntos_otorgados' => 0,
            ];
            return 0;
        }

        $eligibleUnits = $newUnits - max($meta, $previousUnits); // Si en promedio son 100, pero el vendedor ya tenía acumulado 90, solo las unidades que superen 90 serán elegibles para puntos, no las que superen 100.
        // ejemplo: promedio 100, acumulado anterior 90, nueva venta 20 => total 110. Unidades elegibles para puntos = 110 - max(100, 90) = 110 - 100 = 10 unidades (no las 20 completas).

        // Ordenamos los items de mayor a menor valor para darle los mejores puntos posibles al vendedor
        usort($resolvedItems, fn($a, $b) => $b['points_per_unit'] <=> $a['points_per_unit']);

        $puntosOtorgados = 0;
        $unidadesPorAsignar = $eligibleUnits;
        $detalleAsignacion = [];

        foreach ($resolvedItems as $item) {
            if ($unidadesPorAsignar <= 0) break;

            $unidadesAUsar = min($item['quantity'], $unidadesPorAsignar);
            $puntosItem = $unidadesAUsar * $item['points_per_unit'];

            $puntosOtorgados += $puntosItem;
            $unidadesPorAsignar -= $unidadesAUsar;

            $detalleAsignacion[] = [
                'product_id' => $item['product_id'],
                'unidades_que_cruzaron_meta' => $unidadesAUsar,
                'puntos_por_unidad' => $item['points_per_unit'],
                'puntos_ganados' => $puntosItem
            ];
        }

        $puntosOtorgados = (int) round($puntosOtorgados);

        $this->calculationDetails = [
            'strategy' => 'average_based_simplified',
            'scope' => $scope,
            'meta_actual' => $promedio,
            'acumulado_anterior' => $previousUnits,
            'unidades_venta_actual' => $currentSaleUnits,
            'unidades_elegibles_para_puntos' => $eligibleUnits,
            'puntos_totales_calculados' => $puntosOtorgados,
            'desglose' => $detalleAsignacion
        ];

        return $puntosOtorgados;
    }

    public function getCalculationDetails(): array
    {
        return $this->calculationDetails;
    }

    public function getName(): string
    {
        return 'Average Based (Promedio Individual + Crecimiento)';
    }
}
