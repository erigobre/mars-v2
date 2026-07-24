<?php

namespace App\Enums;

enum IdentifierType : String
{
    case PHONE         = 'phone';
    case EMAIL         = 'email';
    case EMPLOYEE_CODE = 'employee_code';

    public function label(): string
    {
        return match ($this) {
            self::PHONE         => 'Teléfono',
            self::EMAIL         => 'Correo electrónico',
            self::EMPLOYEE_CODE => 'Código de empleado',
        };
    }

    /** Field that stores this value on the User/Seller models */
    public function userField(): string
    {
        return match ($this) {
            self::PHONE         => 'phone',
            self::EMAIL         => 'email',
            self::EMPLOYEE_CODE => 'employee_code', // seller field
        };
    }

    public function isSeller(): bool
    {
        return $this === self::EMPLOYEE_CODE;
    }

    public static function values(): array
    {
        return array_map(fn($c) => $c->value, self::cases());
    }
}
