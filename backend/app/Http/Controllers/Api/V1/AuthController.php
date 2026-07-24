<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Services\Auth\AuthService;
use Illuminate\Http\Request;

class AuthController extends ApiController
{

    public function __construct(protected AuthService $authService)
    {
    }

    public function login(LoginRequest $request)
    {
        try {
            $credentials = $request->validated();

            $result = $this->authService->login($credentials);

            return $this->successResponse('Inicio de sesión exitoso', $result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 401);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        log_action('LOGOUT', $request->user(), "Cerró sesión en todos los dispositivos");

        return $this->successResponse('Sesión cerrada exitosamente en todos tus dispositivos');
    }
}
