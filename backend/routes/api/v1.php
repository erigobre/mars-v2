<?php

use App\Http\Controllers\Api\V1\DistributorController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\RewardClaimController;
use App\Http\Controllers\Api\V1\SellerController;
use App\Http\Controllers\Api\V1\ThemeController;
use Illuminate\Support\Facades\Route;

Route::get('public/distributors', [DistributorController::class, 'publicIndex']);
Route::get('public/theme', [ThemeController::class, 'show']); // Sin auth — para carga inicial del frontend

Route::prefix('auth')->group(base_path('routes/api/v1/auth.php'));

Route::middleware('auth:sanctum')->group(function () {

    // --- RUTAS PARA CUALQUIER USUARIO AUTENTICADO ---

    // Perfil
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'show'])->name('show');
        Route::put('/', [ProfileController::class, 'update'])->name('update');
    });

    // Campañas
    Route::prefix('campaigns')
        ->name('campaigns.')
        ->group(base_path('routes/api/v1/campaign.php'));

    // Premios
    Route::prefix('rewards')
        ->name('rewards.')
        ->group(base_path('routes/api/v1/reward.php'));

    Route::prefix('reward-claims')
        ->name('reward-claims.')
        ->group(base_path('routes/api/v1/rewardClaims.php'));

    // --- RUTAS PROTEGIDAS POR ROL ---

    Route::middleware(['role:admin'])
        ->prefix('admin')
        ->name('admin.')
        ->group(base_path('routes/api/v1/admin.php'));

    Route::middleware(['role:distributor'])
        ->prefix('distributor')
        ->name('distributor.')
        ->group(base_path('routes/api/v1/distributor.php'));

    Route::middleware(['role:seller'])
        ->group(base_path('routes/api/v1/seller.php'));

    Route::middleware(['role:admin,logistics'])
        ->group(base_path('routes/api/v1/analytics.php'));

    Route::middleware(['role:admin'])->group(function () {
        Route::get('sellers/export', [SellerController::class, 'export']);
        Route::post('sellers/bulk', [SellerController::class, 'bulkAction']);
        Route::post('sellers/{seller}/magic-password', [SellerController::class, 'generateMagicPassword']);
    });

    Route::middleware(['role:admin,distributor'])->group(function () {
        Route::prefix('sales')
            ->name('sales.')
            ->group(base_path('routes/api/v1/sales.php'));
        Route::get('sellers/{seller}/transactions', [SellerController::class, 'transactions']);
        Route::apiResource('sellers', SellerController::class);
        Route::patch('reward-claims/{claim}', [RewardClaimController::class, 'update']);
    });
});
