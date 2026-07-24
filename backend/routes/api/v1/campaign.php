<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\CampaignController;
use App\Http\Controllers\Api\V1\RedemptionCycleController;

Route::get('/current/cycles', [RedemptionCycleController::class, 'validCycles']);
Route::get('/current/cycles/{cycle}/ranking', [CampaignController::class, 'pastCycleRanking']);
Route::get('/current/cycle/current/ranking', [CampaignController::class, 'currentCycleRanking'])->name('campaigns.current.period-ranking');
Route::get('/current/ranking', [CampaignController::class, 'currentRanking'])->name('campaigns.current.ranking');
Route::get('/{campaign}/ranking', [CampaignController::class, 'ranking'])->name('campaigns.ranking');