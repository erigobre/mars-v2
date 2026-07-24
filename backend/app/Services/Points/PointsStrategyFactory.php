<?php

namespace App\Services\Points;

use App\Contracts\PointsCalculationStrategy;
use App\Models\Distributor;
use App\Services\Points\Strategies\AverageBasedStrategy;
use App\Services\Points\Strategies\DisplayBasedStrategy;

class PointsStrategyFactory
{
    public function getStrategy(Distributor $distributor): PointsCalculationStrategy
    {
        if($distributor->points_calculation_strategy) {
            return $this->makeStrategy($distributor->points_calculation_strategy);
        }

        $globalStrategy = config('points.calculation_strategy', 'average');
        return $this->makeStrategy($globalStrategy); 
    }

    /**
     * Instancia la estrategia según el nombre
     */
    private function makeStrategy(string $strategyName): PointsCalculationStrategy
    {
        return match ($strategyName) {
            'average', 'average_based' => app(AverageBasedStrategy::class),
            'display', 'display_based' => app(DisplayBasedStrategy::class),
            default => app(DisplayBasedStrategy::class), // Fallback seguro
        };
    }

    public function getAvailableStrategies(): array
    {
        return [
            'display_based' => [
                'name' => 'Display Based',
                'description' => 'Puntos según el tipo de producto (Core=1pt, Innovación=2pts)',
                'class' => DisplayBasedStrategy::class,
            ],
            'average_based' => [
                'name' => 'Average Based',
                'description' => 'Puntos según promedio mensual de ventas del vendedor (Meta = Promedio histórico)',
                'class' => AverageBasedStrategy::class,
            ],
        ];
    }
}