<?php

namespace App\Enums;

enum RewardClaimStatus: string
{
    case RESERVED  = 'reserved';

    case PENDING   = 'pending';
    case APPROVED  = 'approved';
    case SHIPPED   = 'shipped';
    case DELIVERED = 'delivered';
    case REJECTED  = 'rejected';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::RESERVED  => 'Reservado',
            self::PENDING   => 'Pendiente',
            self::APPROVED  => 'Aprobado',
            self::SHIPPED   => 'Enviado',
            self::DELIVERED => 'Entregado',
            self::REJECTED  => 'Rechazado',
            self::CANCELLED => 'Cancelado',
        };
    }

    public static function values(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }

    public static function activeStatuses(): array
    {
        return [self::RESERVED, self::PENDING, self::APPROVED, self::SHIPPED];
    }

    /** ¿El canje está en un estado que bloquea un nuevo intento del mismo vendedor/ciclo? */
    public function blocksNewClaim(): bool
    {
        return in_array($this, [self::RESERVED, self::PENDING, self::APPROVED, self::SHIPPED]);
    }
}