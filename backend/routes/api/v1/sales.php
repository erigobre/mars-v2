<?php

use App\Http\Controllers\Api\V1\SaleController;
use Illuminate\Support\Facades\Route;

Route::get('template', [SaleController::class, 'template']);
Route::post('upload', [SaleController::class, 'upload']);
Route::get('upload/{jobId}/status', [SaleController::class, 'uploadStatus'])->name('upload.status');
Route::get('upload/history', [SaleController::class, 'uploadHistory']);
Route::delete('upload/{batchUuid}/revert', [SaleController::class, 'revertUpload']);
Route::get('/', [SaleController::class, 'index']);
Route::post('/', [SaleController::class, 'store']);
Route::post('bulk', [SaleController::class, 'bulkStore']);
Route::get('{sale}', [SaleController::class, 'show']);