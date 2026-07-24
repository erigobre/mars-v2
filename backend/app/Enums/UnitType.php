<?php

namespace App\Enums;

enum UnitType: string
{
    case PIECE = 'PIECE';
    case PACKAGE = 'PACKAGE';
    case BOX = 'BOX';
    case KG = 'KG';
    case SPECIFY = 'SPECIFY';

    public function label(): string
    {
        return match($this) {
            self::PIECE => 'Pieza',
            self::PACKAGE => 'Paquete',
            self::BOX => 'Caja',
            self::KG => 'Kilogramo',
            self::SPECIFY => 'Otro (Especificar)',
        };
    }

    // Metodo Convierte los casos del enum a un array de strings
    public static function values(): array
    {
        return array_map(fn($type) => $type->value, self::cases());
    }
}
