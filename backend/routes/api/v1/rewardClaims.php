<?php

use App\Http\Controllers\Api\V1\RewardClaimController;
use Illuminate\Support\Facades\Route;

// Consultar canjes propios
Route::get('/',        [RewardClaimController::class, 'index']);
Route::get('/{claim}', [RewardClaimController::class, 'show']);
Route::put('/{claim}', [RewardClaimController::class, 'update']);
Route::patch('/{claim}', [RewardClaimController::class, 'update']);