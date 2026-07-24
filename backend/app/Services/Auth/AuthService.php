<?php

namespace App\Services\Auth;

use App\Http\Resources\V1\Auth\AuthUserResource;
use App\Models\User;
use App\Services\Phone\PhoneNormalizerService;
use Exception;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthService
{
    public function login(array $credentials)
    {
        $identifier = $credentials['identifier'] ?? null;
        $password = $credentials['password'] ?? null;
        $distributorId = $credentials['distributor_id'] ?? null;

        if ($distributorId) {
            // Es un vendedor. Su login_key se guarda sin código de país (ej. 2/3335707149)
            $cleanIdentifier = app(\App\Services\Auth\SellerAuthKeyService::class)->cleanPhone($identifier);
            $loginKey = $distributorId . '/' . $cleanIdentifier;
        } else {
            // Es un usuario de gestión (admin, logistica, distribuidor). Su login_key es su teléfono con código (ej. +523335707149)
            if (preg_match('/^\d{10}$/', $identifier)) {
                $identifier = app(PhoneNormalizerService::class)->normalize($identifier) ?: $identifier;
            }
            $loginKey = $identifier;
        }

        
        $user = User::with(['role', 'distributor', 'seller'])
            ->where('login_key', $loginKey)
            ->first();

        if (!$user) {
            log_action('LOGIN_FAILED_NOT_FOUND', null, "Intento fallido: Usuario no encontrado con el identificador {$loginKey}");
            throw new Exception('Las credenciales ingresadas son incorrectas.');
        }

        if (!$user->is_active) {
            log_action('LOGIN_FAILED_INACTIVE', $user, "Intento fallido: Cuenta inactiva");
            throw new Exception('Tu cuenta está desactivada. Contacta a soporte.');
        }

        if (!Hash::check($password, $user->password)) {
            log_action('LOGIN_FAILED_PASSWORD', $user, "Intento fallido: Contraseña incorrecta");
            throw new Exception('Las credenciales ingresadas son incorrectas.');
        }

        log_action('LOGIN_SUCCESS', $user, "Inicio de sesión exitoso");

        // Determinar la expiración del token según el rol del usuario
        $expiresAt = match ($user->role->slug) {
            'admin'       => now()->addHours(8),
            'distributor' => now()->addHours(12),
            'seller'      => now()->addDays(1),
            default       => now()->addHours(2),
        };

        // Actualizar el último inicio de sesión
        $user->last_login_at = now();
        $user->save();

        // Generar el token con el rol del usuario como permiso
        $token = $user->createToken(
            'auth_token',
            [$user->role->slug],
            $expiresAt
        )->plainTextToken;

        Log::info('Usuario', ['user' => $user]);

        return [
            'accessToken' => $token,
            'tokenType' => 'Bearer',
            'user' => new AuthUserResource($user),
        ];
    }

    // public function login(array $credentials)
    // {
    //     // $email = $credentials['email'] ?? null;
    //     $phone = $credentials['phone'] ?? null;
    //     $password = $credentials['password'] ?? null;

    //     $user = User::with(['role', 'distributor', 'seller'])
    //         ->where('phone', $phone)
    //         ->first();

    //     if (!$user) {
    //         log_action('LOGIN_FAILED_NOT_FOUND', null, "Intento fallido: Usuario no encontrado con el número de teléfono {$phone}");
    //         throw new Exception('Las credenciales ingresadas son incorrectas.');
    //     }

    //     if (!$user->is_active) {
    //         log_action('LOGIN_FAILED_INACTIVE', $user, "Intento fallido: Cuenta inactiva");
    //         throw new Exception('Tu cuenta está desactivada. Contacta a soporte.');
    //     }

    //     if (!Hash::check($password, $user->password)) {
    //         log_action('LOGIN_FAILED_PASSWORD', $user, "Intento fallido: Contraseña incorrecta");
    //         throw new Exception('Las credenciales ingresadas son incorrectas.');
    //     }

    //     log_action('LOGIN_SUCCESS', $user, "Inicio de sesión exitoso");

    //     // Determinar la expiración del token según el rol del usuario
    //     $expiresAt = match ($user->role->slug) {
    //         'admin'       => now()->addHours(8),
    //         'distributor' => now()->addHours(12),
    //         'seller'      => now()->addDays(1),
    //         default       => now()->addHours(2),
    //     };

    //     // Actualizar el último inicio de sesión
    //     $user->last_login_at = now();
    //     $user->save();

    //     // Generar el token con el rol del usuario como permiso
    //     $token = $user->createToken(
    //         'auth_token',
    //         [$user->role->slug],
    //         $expiresAt
    //     )->plainTextToken;

    //     return [
    //         'accessToken' => $token,
    //         'tokenType' => 'Bearer',
    //         'user' => new AuthUserResource($user),
    //     ];
    // }
}
