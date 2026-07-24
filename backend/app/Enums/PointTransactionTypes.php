<?php

namespace App\Enums;

enum PointTransactionTypes: string
{
    case SALE_EARNED = 'sale_earned';
    case GOAL_BONUS = 'goal_bonus';
    case MANUAL_ADJUSTMENT = 'manual_adjustment';
    case STORE_PURCHASE = 'store_purchase';
    case WEEKLY_RESET = 'weekly_reset';
    case RESERVATION_EXPIRED = 'reservation_expired';

    public function description(): string
    {
        return match($this) {
            self::SALE_EARNED => 'Puntos ganados por venta',
            self::GOAL_BONUS => 'Bono por alcanzar meta',
            self::MANUAL_ADJUSTMENT => 'Ajuste manual',
            self::STORE_PURCHASE => 'Compra en tienda de puntos',
            self::WEEKLY_RESET => 'Reinicio semanal de puntos',
            self::RESERVATION_EXPIRED => 'Devolución por reserva expirada',
        };
    }

    public static function incrementValues(): array
    {
        return [
            self::SALE_EARNED->value,
            self::GOAL_BONUS->value,
            self::MANUAL_ADJUSTMENT->value
        ];
    }


    public function label(): string
    {
        return match($this) {
            self::SALE_EARNED => 'Venta',
            self::GOAL_BONUS => 'Bono Meta',
            self::MANUAL_ADJUSTMENT => 'Ajuste Manual',
            self::STORE_PURCHASE => 'Compra en Tienda',
            self::WEEKLY_RESET => 'Reinicio Semanal',
            self::RESERVATION_EXPIRED => 'Reserva Expirada',
        };
    }

    public static function values(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }

    
}
