<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Services\Analytics\DailyUsageAnalyticsService;
use App\Traits\TransformsCamelCase;
use Illuminate\Http\Request;

class DailyUsageController extends ApiController
{
    use TransformsCamelCase; 

    public function __construct(
        private readonly DailyUsageAnalyticsService $usageService
    ) {}

    public function today(Request $request)
    {
        $validated = $request->validate([
            'date'          => ['nullable', 'date_format:Y-m-d'],
            'tz'            => ['nullable', 'string', 'max:64'],
            'role'          => ['nullable', 'string', 'in:seller,distributor,admin,logistics'],
            'distributorId' => ['nullable', 'integer', 'exists:distributors,id'],
        ]);
 
        $role = $validated['role'] ?? null;
        $distributorId = isset($validated['distributorId'])
            ? (int) $validated['distributorId']
            : null;
 
        if ($distributorId && $role && $role !== 'seller') {
            return $this->errorResponse(
                'El filtro de distribuidor solo es compatible con el rol "seller".',
                422
            );
        }
 
        $report = $this->usageService->getDailyUsageReport(
            date:          $validated['date'] ?? null,
            tz:            $validated['tz']   ?? null,
            role:          $role,
            distributorId: $distributorId,
        );
 
        $camelReport = $this->camel($report);
 
        return $this->successResponse(
            'Analíticas de uso diario obtenidas exitosamente.',
            $camelReport
        );
    }
}
