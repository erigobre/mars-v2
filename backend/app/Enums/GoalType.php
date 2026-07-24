<?php

namespace App\Enums;

enum GoalType: string
{
    case TOTAL_SALES_AMOUNT   = 'TOTAL_SALES_AMOUNT';   // Monto total $ de ventas
    case SPECIFIC_PRODUCT_QTY = 'SPECIFIC_PRODUCT_QTY'; // Cantidad de un producto puntual → requiere product_id
    case TOTAL_DISPLAY_QTY    = 'TOTAL_DISPLAY_QTY';    // Cantidad de cualquier producto del display → requiere display_id

    public function label(): string
    {
        return match($this) {
            self::TOTAL_SALES_AMOUNT   => 'Monto total de ventas ($)',
            self::SPECIFIC_PRODUCT_QTY => 'Cantidad vendida de producto específico',
            self::TOTAL_DISPLAY_QTY    => 'Cantidad total vendida del display',
        };
    }

    /**
     * Campos extra obligatorios según el tipo.
     * Se usan en la validación del request para hacer campos required_if.
     */
    public function requiredFields(): array
    {
        return match($this) {
            self::TOTAL_SALES_AMOUNT   => [],
            self::SPECIFIC_PRODUCT_QTY => ['product_id'],
            self::TOTAL_DISPLAY_QTY    => ['display_id'],
        };
    }

    public static function values(): array
    {
        return array_map(fn($c) => $c->value, self::cases());
    }
}
