<?php

return [
    /**
     * Estrategia global de cálculo de puntos
     * 
     * Opciones:
     * - 'display' o 'display_based': Estrategia legacy (Core=1pt, Innovación=2pts)
     * - 'average' o 'average_based': Nueva estrategia (promedio mensual de ventas del vendedor)
     */
    'calculation_strategy' => env('POINTS_CALCULATION_STRATEGY', 'display'),
];