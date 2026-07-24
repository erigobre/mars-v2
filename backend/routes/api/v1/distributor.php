<?php

use App\Http\Controllers\Api\V1\DistributorDashboardController;
use App\Http\Controllers\Api\V1\DistributorProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('products')->group(function () {
    Route::get('/', [DistributorProductController::class, 'index']); // Listar todos (merged)
    Route::get('customized', [DistributorProductController::class, 'customized']); // Solo personalizados
    Route::get('{product}', [DistributorProductController::class, 'show']); // Ver uno (merged)
    Route::post('customize', [DistributorProductController::class, 'store']); // Crear o actualizar personalización

    Route::put('customizations/{distributorProduct}', [DistributorProductController::class, 'update']);
    Route::delete('customizations/{distributorProduct}', [DistributorProductController::class, 'destroy']);

});

Route::prefix('dashboard')->group(function () {
    Route::get('/commercial', [DistributorDashboardController::class, 'commercialNetwork']);
    Route::get('/rewards', [DistributorDashboardController::class, 'rewardsNetwork']);
});