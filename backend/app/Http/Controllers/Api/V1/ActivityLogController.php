<?php

namespace App\Http\Controllers\Api\V1;

use App\Filters\ActivityLogFilter;
use App\Http\Controllers\ApiController;
use App\Http\Resources\V1\ActivityLog\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends ApiController
{
    public function index(Request $request)
    {

        $logs = ActivityLog::with('user:id,username,email')
            ->filter(new ActivityLogFilter())
            ->orderBy('created_at', 'desc')
            ->paginate($request->query('per_page', 15));

        $resourceCollection = ActivityLogResource::collection($logs);

        $paginatedData = $resourceCollection->response()->getData(true);

        return $this->successResponse(
            'Logs de actividad obtenidos exitosamente',
            $paginatedData
        );
    }
}
