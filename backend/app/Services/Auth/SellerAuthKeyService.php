<?php

namespace App\Services\Auth;

use App\Enums\CredentialType;
use App\Enums\IdentifierType;
use App\Models\Distributor;
use App\Models\Seller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Centraliza toda la lógica de construcción de credenciales dinámicas
 * para vendedores según la configuración de su distribuidor.
 *
 * login_key  = "{distributor_id}/{identifier_value}"    ej. "2/GAF"
 * password   = hash(credential_value)                   gestionado por el cast 'hashed'
 */
class SellerAuthKeyService
{
    /**
     * Limpia el teléfono eliminando códigos de país (ej. +52)
     */
    public function cleanPhone(?string $phone): ?string
    {
        if (!$phone) {
            return null;
        }
        
        // Si el identificador contiene letras (ej. SC-03 o email), no es un teléfono válido para libphonenumber.
        if (preg_match('/[a-zA-Z]/', $phone)) {
            return preg_replace('/^\+/', '', trim($phone));
        }
        
        try {
            $util = \libphonenumber\PhoneNumberUtil::getInstance();
            $parsed = $util->parse($phone, 'MX');
            return $util->getNationalSignificantNumber($parsed);
        } catch (\libphonenumber\NumberParseException $e) {
            // Fallback en caso de que no sea un formato reconocido
            return preg_replace('/^\+/', '', trim($phone));
        }
    }

    /**
     * Extrae el valor del identificador según el tipo configurado.
     * Retorna null si el campo no tiene valor.
     */
    public function resolveIdentifier(
        IdentifierType $type,
        User   $user,
        Seller $seller
    ): ?string {
        return match ($type) {
            IdentifierType::PHONE         => $this->cleanPhone($user->phone),
            IdentifierType::EMAIL         => $user->email,
            IdentifierType::EMPLOYEE_CODE => $seller->employee_code,
        };
    }

    /**
     * Extrae el valor plano que se usará como contraseña.
     * El cast 'hashed' del modelo User lo hashea automáticamente al guardar.
     */
    public function resolveCredential(
        CredentialType $type,
        User   $user,
        Seller $seller
    ): ?string {
        return match ($type) {
            CredentialType::PHONE         => $this->cleanPhone($user->phone),
            CredentialType::EMAIL         => $user->email,
            CredentialType::BIRTHDATE     => $user->birthdate
                ? Carbon::parse($user->birthdate)->format('dmY')
                : null,
            CredentialType::EMPLOYEE_CODE => $seller->employee_code,
        };
    }

    /**
     * Construye el login_key final: "{distributor_id}/{identifier_value}".
     *
     * @throws \RuntimeException si el campo requerido está vacío
     */
    public function buildLoginKey(
        int            $distributorId,
        IdentifierType $type,
        User           $user,
        Seller         $seller
    ): string {
        $value = $this->resolveIdentifier($type, $user, $seller);

        if (!$value) {
            throw new \RuntimeException(
                "El vendedor no tiene '{$type->label()}' configurado, "
                    . "pero el distribuidor lo requiere como identificador de login."
            );
        }

        return "{$distributorId}/{$value}";
    }

    /**
     * Valida que el vendedor tenga todos los campos necesarios
     * para el config del distribuidor dado (identifier + credential).
     *
     * @throws \RuntimeException con mensaje descriptivo si algo falta
     */
    public function validate(Distributor $distributor, User $user, Seller $seller): void
    {
        Log::info('Distribuidor', ['identifier_type' => $distributor->identifier_type, 'credential_type' => $distributor->credential_type]);
        $identifier = $this->resolveIdentifier($distributor->identifier_type, $user, $seller);
        if (!$identifier) {
            throw new \RuntimeException(
                "Para este distribuidor, el vendedor '{$user->username}' necesita "
                    . "'{$distributor->identifier_type->label()}' como identificador de login, pero el campo está vacío."
            );
        }

        $credential = $this->resolveCredential($distributor->credential_type, $user, $seller);
        if (!$credential) {
            throw new \RuntimeException(
                "Para este distribuidor, el vendedor '{$user->username}' necesita "
                    . "'{$distributor->credential_type->label()}' como contraseña de login, pero el campo está vacío."
            );
        }
    }

    /**
     * Aplica login_key y contraseña al usuario del vendedor.
     * Llama a validate() primero — lanza excepción si falta algo.
     *
     * Debe llamarse dentro de una DB::transaction() para garantizar
     * atomicidad con los otros cambios del flujo de creación/actualización.
     */
    public function applyAuth(Seller $seller, Distributor $distributor): void
    {
        $seller->loadMissing('user');
        $user = $seller->user;

        $this->validate($distributor, $user, $seller);

        $loginKey  = $this->buildLoginKey(
            $distributor->id,
            $distributor->identifier_type,
            $user,
            $seller
        );

        $credential = $this->resolveCredential(
            $distributor->credential_type,
            $user,
            $seller
        );

        // El cast 'hashed' en User hashea automáticamente el valor plano
        $user->update([
            'login_key' => $loginKey,
            'password'  => $credential,
        ]);

        Log::info('SellerAuthKeyService: credenciales aplicadas', [
            'seller_id'      => $seller->id,
            'distributor_id' => $distributor->id,
            'identifier_type' => $distributor->identifier_type->value,
            'credential_type' => $distributor->credential_type->value,
            'login_key'      => $loginKey,
        ]);
    }

    /**
     * Aplica el login_key estándar para usuarios no-vendedor (admin, distribuidor, logística).
     * Su clave es simplemente su teléfono normalizado.
     *
     * @throws \RuntimeException si el usuario no tiene teléfono
     */
    public function applyNonSellerAuth(User $user): void
    {
        if (!$user->phone) {
            throw new \RuntimeException(
                "El usuario '{$user->username}' no tiene teléfono configurado. "
                    . "Es requerido para el login."
            );
        }

        // La contraseña ya viene establecida por el flujo de creación
        // (birthdate o explícita). Solo actualizamos el login_key.
        $user->update(['login_key' => $user->phone]);

        Log::info('SellerAuthKeyService: login_key de no-vendedor aplicado', [
            'user_id'   => $user->id,
            'login_key' => $user->phone,
        ]);
    }
}
