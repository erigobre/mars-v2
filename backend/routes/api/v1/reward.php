<?php

use App\Http\Controllers\Api\V1\RewardController;
use Illuminate\Support\Facades\Route;

Route::get('/', [RewardController::class, 'index'])->name('index');
Route::get('/{reward}', [RewardController::class, 'show'])->name('show');