<?php

namespace App\Enums;

enum SaleUploadMethods: string
{
    case MANUAL = 'manual';
    case CSV = 'csv';

    public function label(): string
    {
        return match($this) {
            self::MANUAL => 'Manual',
            self::CSV => 'Archivo CSV',
        };
    }

    public static function values(): array
    {
        return array_map(fn($type) => $type->value, self::cases());
    }
}
