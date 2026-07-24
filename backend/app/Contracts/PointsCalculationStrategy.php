<?php

namespace App\Contracts;

use App\Models\Distributor;
use App\Models\Sale;
use App\Models\Seller;

interface PointsCalculationStrategy
{
    /**
     * Calcula los puntos que debe otorgar una venta
     */
    public function calculatePoints(
        Sale $sale,
        Seller $seller,
        Distributor $distributor,
        array $resolvedItems
    ): int;

    /**
     * Retorna información de debug/auditoría sobre el cálculo
     */
    public function getCalculationDetails(): array;

    /**
     * Nombre de la estrategia (para logs y auditoría)
     */
    public function getName(): string;
}