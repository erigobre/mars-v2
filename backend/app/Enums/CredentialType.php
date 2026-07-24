<?php

namespace App\Enums;

enum CredentialType : String
{
    case PHONE         = 'phone';
    case EMAIL         = 'email';
    case BIRTHDATE     = 'birthdate';
    case EMPLOYEE_CODE = 'employee_code';
 
    public function label(): string
    {
        return match ($this) {
            self::PHONE         => 'Teléfono',
            self::EMAIL         => 'Correo electrónico',
            self::BIRTHDATE     => 'Fecha de nacimiento (ddmmYYYY)',
            self::EMPLOYEE_CODE => 'Código de empleado',
        };
    }

    public function inputHint(): string
    {
        return match ($this) {
            self::PHONE         => 'Tu número de teléfono',
            self::EMAIL         => 'Tu correo electrónico',
            self::BIRTHDATE     => 'Tu fecha de nacimiento (DDMMAAAA, ej. 15031990)',
            self::EMPLOYEE_CODE => 'Tu código de empleado',
        };
    }
 
    public static function values(): array
    {
        return array_map(fn ($c) => $c->value, self::cases());
    }
}
