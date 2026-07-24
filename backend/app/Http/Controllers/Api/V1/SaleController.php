<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\Sale\StoreBulkSaleRequest;
use App\Http\Requests\Api\V1\Sale\StoreSaleRequest;
use App\Http\Requests\Api\V1\Sale\UploadSaleFileRequest;
use App\Http\Resources\V1\Sale\SaleResource;
use App\Jobs\ProcessSalesFileJob;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\PointTransaction;
use App\Models\ProcessedSalesFile;
use App\Services\Sale\SaleService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class SaleController extends ApiController
{
    public function __construct(protected SaleService $saleService) {}


    public function index(Request $request)
    {
        $user  = $request->user();
        $search = $request->query('search');
        $query = Sale::with(['seller.user', 'createdBy'])->withCount('items');

        if ($user->role->slug === 'distributor') {
            $distId = $user->distributor?->id;
            if (!$distId) return $this->notFound('Distribuidor no encontrado.');
            $query->whereHas('seller', fn($q) => $q->where('distributor_id', $distId));
        } elseif (in_array($user->role->slug, ['admin', 'manager']) && $request->filled('distributor_id')) {
            $query->whereHas('seller', fn($q) => $q->where('distributor_id', $request->query('distributor_id')));
        }

        if($search) $query->globalSearch($search);

        $paginated = $query->orderByDesc('sale_date')
                           ->orderByDesc('created_at')
                           ->paginate($request->integer('per_page', 15));

        return $this->successResponse(
            'Ventas obtenidas.',
            SaleResource::collection($paginated)->response()->getData(true)
        );
    }

    public function store(StoreSaleRequest $request)
    {
        try {
            $sale = $this->saleService->createManualSale(
                data:      $request->validated(),
                items:     $request->validated()['items'],
                createdBy: $request->user()
            );

            return $this->created(
                new SaleResource($sale->load(['items.product', 'seller.user'])),
                "Venta {$sale->folio} registrada. Puntos asignados: {$sale->points_earned}"
            );
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function bulkStore(StoreBulkSaleRequest $request)
    {
        try {
            $data = $request->validated();

            // Inyectar distributor_id en cada venta si viene a nivel raíz (para admin)
            if (isset($data['distributor_id'])) {
                $data['sales'] = array_map(function ($sale) use ($data) {
                    $sale['distributor_id'] = $sale['distributor_id'] ?? $data['distributor_id'];
                    return $sale;
                }, $data['sales']);
            }

            $sales = $this->saleService->createBulkSales(
                salesData: $data['sales'],
                createdBy: $request->user()
            );

            $loadedSales = collect($sales)->map(
                fn($sale) => $sale->load(['items.product', 'seller.user'])
            );

            $totalPoints = collect($sales)->sum('points_earned');

            return $this->created(
                SaleResource::collection($loadedSales),
                count($sales) . " ventas registradas. Total de puntos asignados: {$totalPoints}"
            );
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function upload(UploadSaleFileRequest $request)
    {
        $user        = $request->user();
        $file        = $request->file('file');
        $batchUuid   = (string) Str::uuid();

        $fileHash = md5_file($file->getRealPath());

        if (\App\Models\ProcessedSalesFile::where('file_hash', $fileHash)->exists()) {
            return $this->errorResponse('Este archivo ya fue procesado exitosamente con anterioridad.', 422);
        }

        try {
            $distributor = $this->saleService->resolveDistributor(
                $user,
                $request->integer('distributor_id') ?: null
            );
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        // Guardar archivo temporalmente en storage/app/sales-uploads/
        $storedPath = $file->store('sales-uploads');

        // Despachar el Job a la cola — la API responde de inmediato
        $laravelBatch = Bus::batch([
            new ProcessSalesFileJob(
                storedFilePath:   $storedPath,
                originalFileName: $file->getClientOriginalName(),
                distributorId:    $distributor->id,
                createdById:      $user->id,
                batchUuid:        $batchUuid,
                fileHash:         $fileHash,
            ),
        ])
        ->name("sales-upload:{$batchUuid}")
        ->allowFailures(false)
        ->dispatch();

        return $this->successResponse(
            'Archivo recibido. El procesamiento está en curso.',
            [
                'batch_uuid' => $batchUuid,
                'job_id'     => $laravelBatch->id,
                'status_url' => route('sales.upload.status', ['jobId' => $laravelBatch->id]),
            ],
            202
        );
    }


    public function uploadStatus(string $jobId)
    {
        $batch = Bus::findBatch($jobId);

        if (!$batch) {
            return $this->notFound('Job no encontrado.');
        }

        // Estado calculado desde el Batch de Laravel
        $status = match (true) {
            $batch->cancelled()         => 'cancelled',
            $batch->hasFailures()       => 'failed',
            $batch->finished()          => 'completed',
            default                     => 'processing',
        };

        $response = [
            'job_id'    => $jobId,
            'status'    => $status,
            'progress'  => $batch->progress(), // 0-100
        ];

        // Si completó, agregar cuántas ventas se generaron (usando el batch_uuid)
        if ($status === 'completed') {
            // El nombre del batch tiene el UUID: "sales-upload:{uuid}"
            $batchUuid = Str::after($batch->name, 'sales-upload:');
            $salesCount = Sale::where('batch_uuid', $batchUuid)->count();
            $response['sales_created'] = $salesCount;
            $response['batch_uuid']    = $batchUuid;
        }

        // Si falló, incluir el mensaje de error
        if ($status === 'failed' || $status === 'cancelled') {
            $batchUuid = Str::after($batch->name, 'sales-upload:');

            $cachedError = Cache::get("batch_error_{$batchUuid}");
            $decoded = is_string($cachedError) ? json_decode($cachedError, true) : null;
            
            if (is_array($decoded)) {
                $response['error'] = $decoded;
            } else {
                $response['error'] = $cachedError ? [$cachedError] : ['Error desconocido durante el procesamiento.'];
            }
        }

        return $this->successResponse('Estado del proceso.', $response);
    }

    public function uploadHistory(Request $request)
    {
        $user = $request->user();
        $query = ProcessedSalesFile::with(['distributor', 'createdBy']);

        if ($user->role->slug === 'distributor') {
            $distId = $user->distributor?->id;
            if (!$distId) return $this->notFound('Distribuidor no encontrado.');
            $query->where('distributor_id', $distId);
        }

        $paginated = $query->orderByDesc('created_at')
                           ->paginate($request->integer('per_page', 15));

        return $this->successResponse(
            'Historial de cargas obtenido.',
            \App\Http\Resources\V1\Sale\ProcessedSalesFileResource::collection($paginated)->response()->getData(true)
        );
    }

    public function revertUpload(string $batchUuid)
    {
        $processedFile = ProcessedSalesFile::where('batch_uuid', $batchUuid)->first();
        if (!$processedFile) {
            return $this->notFound('El registro de carga no existe o ya fue revertido.');
        }

        $sales = Sale::where('batch_uuid', $batchUuid)->get();
        $sellerIds = $sales->pluck('seller_id')->unique()->toArray();

        if ($sales->isEmpty()) {
            $processedFile->delete();
            return $this->successResponse('El archivo no generó ventas. Registro eliminado.');
        }

        $salesIds = $sales->pluck('id')->toArray();

        // 1. Eliminar transacciones e items
        PointTransaction::whereIn('sale_id', $salesIds)->delete();
        SaleItem::whereIn('sale_id', $salesIds)->delete();

        // 2. Eliminar ventas
        Sale::whereIn('id', $salesIds)->delete();

        // 3. Eliminar registro del archivo
        $processedFile->delete();

        // 4. Recalcular puntos
        if (!empty($sellerIds)) {
            // Queue the recalculation command
            Artisan::queue('incentivos:recalculate-points', ['--seller_id' => $sellerIds]);
        }

        return $this->successResponse('Las ventas han sido revertidas y el recálculo está en proceso.', ['sales_deleted' => count($salesIds)]);
    }

    public function template()
    {
        $path = storage_path('app/templates/ventas_plantilla.xlsx');

        if (!file_exists($path)) {
            return $this->errorResponse('Plantilla no disponible.', 404);
        }

        return response()->download($path, 'ventas_plantilla.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function show(Request $request, Sale $sale)
    {
        $user = $request->user();

        if ($user->role->slug === 'distributor') {
            $distId = $user->distributor?->id;
            if ($sale->seller->distributor_id !== $distId) {
                return $this->forbidden('No tienes acceso a esta venta.');
            }
        }

        return $this->successResponse(
            'Venta obtenida.',
            new SaleResource($sale->load(['seller.user', 'createdBy', 'items.product' => function ($query) {
                $query->withTrashed();
            }]))
        );
    }
}