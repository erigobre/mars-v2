<?php

use App\Http\Controllers\Api\V1\ActivityLogController;
use App\Http\Controllers\Api\V1\CampaignController;
use App\Http\Controllers\Api\V1\DisplayController;
use App\Http\Controllers\Api\V1\ThemeController;
use App\Http\Controllers\Api\V1\DistributorController;
use App\Http\Controllers\Api\V1\GoalController;
use App\Http\Controllers\Api\V1\LogisticsController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\RedemptionCycleController;
use App\Http\Controllers\Api\V1\RedemptionWindowController;
use App\Http\Controllers\Api\V1\RewardController;
use App\Http\Controllers\Api\V1\SellerSalesSnapshotController;
use App\Http\Controllers\Api\V1\SellerTierController;
use App\Http\Controllers\Api\V1\TierPriceMatrixController;
use Illuminate\Support\Facades\Route;

Route::apiResource('displays', DisplayController::class);

Route::apiResource('logistics', LogisticsController::class);

Route::apiResource('distributors', DistributorController::class);

Route::apiResource('products', ProductController::class);
Route::get('products/{product}/customizations', [ProductController::class, 'showCustomizations'])
    ->name('products.customizations');

Route::apiResource('campaigns', CampaignController::class);
Route::get('campaigns/current', [CampaignController::class, 'current'])->name('campaigns.current');

Route::patch('campaigns/{campaign}/status', [CampaignController::class, 'changeStatus'])->name('campaigns.status');
Route::post('campaigns/{campaign}/close', [CampaignController::class, 'close'])->name('campaigns.close');

Route::prefix('campaigns/{campaign}/cycles')
    ->name('cycles.')
    ->group(function () {

        Route::get('/',         [RedemptionCycleController::class, 'index'])->name('index');
        Route::get('/active', [RedemptionCycleController::class, 'active'])->name('cycles.active');
        Route::post('/',        [RedemptionCycleController::class, 'store'])->name('store');
        Route::get('{cycle}',   [RedemptionCycleController::class, 'show'])->name('show');
        Route::put('{cycle}',   [RedemptionCycleController::class, 'update'])->name('update');
        Route::delete('{cycle}', [RedemptionCycleController::class, 'destroy'])->name('destroy');

        Route::post('{cycle}/generate-windows', [RedemptionWindowController::class, 'generateWindows'])->name('generate-windows');

        Route::post('{cycle}/windows', [RedemptionWindowController::class, 'store'])->name('windows.store');

        Route::put('{cycle}/windows/{window}', [RedemptionWindowController::class, 'update'])->name('windows.update');

        Route::delete('{cycle}/windows/{window}', [RedemptionWindowController::class, 'destroy'])->name('windows.destroy');

        Route::post('{cycle}/ranking', [RedemptionCycleController::class, 'generateRankings'])->name('generate-rankings');
        Route::get('{cycle}/ranking', [RedemptionCycleController::class, 'ranking'])->name('ranking');
    });

Route::apiResource('rewards', RewardController::class)->except(['index', 'show']);
Route::get('rewards/{reward}/tier-prices', [RewardController::class, 'tierPrices']);
Route::put('rewards/{reward}/tier-prices', [RewardController::class, 'updateTierPrices']);

Route::apiResource('seller-tiers', SellerTierController::class);
Route::post('seller-tiers/recalculate', [SellerTierController::class, 'recalculate']);

Route::get('distributors/{distributor}/tier-price-matrix', [TierPriceMatrixController::class, 'show']);
Route::post('distributors/{distributor}/bulk-tier-prices', [TierPriceMatrixController::class, 'bulkUpdate']);

Route::apiResource('goals', GoalController::class);
Route::get('goals/{goal}/progresses', [GoalController::class, 'progresses']);

Route::get('/activity-logs', [ActivityLogController::class, 'index']);

Route::apiResource('/sellers/sales/snapshots', SellerSalesSnapshotController::class)->except(['store'])
    ->parameters(['sellers/sales/snapshots' => 'snapshot']);

// Tema / Skin (v2)
Route::get('theme', [ThemeController::class, 'show']);
Route::put('theme', [ThemeController::class, 'update']);