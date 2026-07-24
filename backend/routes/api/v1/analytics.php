<?php

use App\Http\Controllers\Api\V1\AdminDashboardController;
use App\Http\Controllers\Api\V1\DailyUsageController;
use App\Http\Controllers\Api\V1\SellerAdoptionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\RewardClaimController;

Route::get('/analytics/reward-claims/export', [RewardClaimController::class, 'export']);

Route::prefix('dashboard')->group(function () {
    Route::get('/overview', [AdminDashboardController::class, 'overview']);
    Route::get('/sales', [AdminDashboardController::class, 'salesPerformance']);
    Route::get('/sales/export', [AdminDashboardController::class, 'exportSalesPerformance']);
    Route::get('/sales/validation-export', [AdminDashboardController::class, 'exportValidationReport']);
    Route::get('/economy', [AdminDashboardController::class, 'economySummary']);
    Route::get('/rewards', [AdminDashboardController::class, 'rewardsSummary']);
    Route::get('/adoption', [AdminDashboardController::class, 'adoptionSummary']);

    Route::get('/usage/today', [DailyUsageController::class, 'today'])->name('today');

    Route::get('/sellers/adoption', [SellerAdoptionController::class, 'report']);

    Route::get('/sellers/adoption/funnel', [SellerAdoptionController::class, 'funnel']);

    // Desglose por empresa/distribuidor
    Route::get('/sellers/adoption/by-company', [SellerAdoptionController::class, 'byCompany']);

    // Lista de vendedores por segmento
    Route::get('/sellers/adoption/list', [SellerAdoptionController::class, 'list']);

    // Lista de vendedores con estado
    Route::get('/sellers/adoption/status-list', [SellerAdoptionController::class, 'statusList']);
    Route::get('/sellers/adoption/status-list/export', [SellerAdoptionController::class, 'statusListExport']);
});
