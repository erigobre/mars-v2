<?php

use App\Http\Controllers\Api\V1\RewardClaimController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\SellerController;

Route::get('reward-claims/eligibility/{rewardId}', [RewardClaimController::class, 'eligibility']);

// FASE 1: Reservar stock
Route::post('reward-claims/reserve', [RewardClaimController::class, 'reserve']);

// FASE 2: Confirmar con dirección
Route::post('reward-claims/{claim}/confirm', [RewardClaimController::class, 'confirm']);

Route::post('reward-claims/{claim}/cancel', [RewardClaimController::class, 'cancel']);

Route::get('reward-claims/{claim}/receipt', [RewardClaimController::class, 'downloadReceipt']);

Route::prefix('seller')
    ->name('seller.')
    ->group(function () {
        Route::get('dashboard', [SellerController::class, 'dashboard'])->name('dashboard');
        Route::patch('/accept-terms', [SellerController::class, 'acceptTerms']);
        Route::patch('/deactivate-account', [SellerController::class, 'deactivateAccount']);
    });
