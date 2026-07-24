<?php

use App\Http\Middleware\CheckRole;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use PHPUnit\Event\Code\Throwable;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => CheckRole::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('claims:release-expired')->everyFiveMinutes();
        $schedule->command('cycles:snapshot')->dailyAt('00:05');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // 404 - No encontrado
        $exceptions->renderable(function (NotFoundHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Recurso no encontrado',
                ], 404);
            }
        });

        // 403 - Sin permiso
        $exceptions->renderable(function (AccessDeniedHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para esta acción',
                ], 403);
            }
        });
        
        // 401 - No autenticado
        $exceptions->renderable(function (AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autenticado. Por favor, inicia sesión.',
                ], 401);
            }
        });
        
        // 422 - Errores de validación
        $exceptions->renderable(function (ValidationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => $e->errors(),
                ], 422);
            }
        });
        
        // 500 - Error del servidor (solo en producción)
        $exceptions->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*') && app()->environment('production')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error interno del servidor',
                ], 500);
            }
        });
    })->create();
