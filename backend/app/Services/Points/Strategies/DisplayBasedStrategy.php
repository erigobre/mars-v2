<?php

namespace App\Services\Points\Strategies;

use App\Contracts\PointsCalculationStrategy;
use App\Models\Sale;
use App\Models\Seller;
use App\Models\Distributor;

class DisplayBasedStrategy implements PointsCalculationStrategy
{
    private array $calculationDetails = [];

    public function calculatePoints(Sale $sale, Seller $seller, Distributor $distributor, array $resolvedItems): int
    {
        $totalPoints = 0;
        $breakdown = []; // Para auditoría

        foreach ($resolvedItems as $item) {
            $itemPoints = (int) round($item['total_points']);
            $totalPoints += $itemPoints;

            $breakdown[] = [
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'points_per_unit' => $item['points_per_unit'],
                'item_points' => $itemPoints,
                'rule' => $item['applied_rule'],
            ];
        }

        $this->calculationDetails = [
            'strategy'     => 'display_based',
            'total_points' => $totalPoints,
            'breakdown'    => $breakdown,
        ];

        return $totalPoints;
    }

    public function getCalculationDetails(): array
    {
        return $this->calculationDetails;
    }

    public function getName(): string
    {
        return 'Display Based (Modo Base)';
    }
}
