<?php

namespace App\Enums;

enum BaseCost: int
{
    case LOW    = 1500;
    case MEDIUM = 3000;
    case HIGH   = 6000;

    public function label(): string
    {
        return match ($this) {
            self::LOW    => 'Bajo ($1,500)',
            self::MEDIUM => 'Medio ($3,000)',
            self::HIGH   => 'Alto ($6,000)',
        };
    }

    public static function values(): array
    {
        return array_map(fn($c) => $c->value, self::cases());
    }
}
