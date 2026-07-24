<?php

namespace App\Jobs;

use App\Models\Distributor;
use App\Models\User;
use App\Services\Sale\SaleService;
use App\Services\Sale\SalesFileParser;
use Exception;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ProcessSalesFileJob implements ShouldQueue
{
    use Queueable, // Permite que el trabajo sea colocado en una cola para su procesamiento asíncrono.
        Dispatchable, // Proporciona el método estático "dispatch" para enviar el trabajo a la cola.
        InteractsWithQueue, // Permite que el trabajo interactúe con la cola, como eliminarlo o liberarlo.
        SerializesModels, // Permite que los modelos Eloquent sean serializados y deserializados automáticamente cuando el trabajo se envía a la cola.
        Batchable; // Permite que el trabajo sea parte de un lote, lo que facilita la agrupación y el seguimiento de múltiples trabajos relacionados.

    public int $tries = 3;
    public int $timeout = 300;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly string $storedFilePath,
        private readonly string $originalFileName,
        private readonly int    $distributorId,
        private readonly int    $createdById,
        private readonly string $batchUuid,
        private readonly string $fileHash,
    ){}

    /**
     * Execute the job.
     */
    public function handle(SaleService $saleService, \App\Services\Product\DistributorProductService $distributorProductService): void
    {
        $distributor = Distributor::findOrFail($this->distributorId);
        $createdBy = User::findOrFail($this->createdById);
        // $filepath = storage_path($this->storedFilePath);

        Log::info("ProcessSalesFileJob iniciado", [
            'batch_uuid' => $this->batchUuid,
            'file'       => $this->originalFileName,
            'distributor'=> $distributor->company_name,
        ]);

        try {
            $parser = new SalesFileParser($distributor, $saleService, $distributorProductService);
            $result = $parser->parse($this->storedFilePath);

            $groups = $result['groups'];
            $sellersAutoCreated = $result['auto_created'];
            $validationErrors = $result['errors'] ?? [];

            foreach ($groups as $group){
                $resolution = $saleService->resolveItems(
                    $group['items'],
                    $distributor,
                    false // throwOnError = false
                );
                if (!empty($resolution['errors'])) {
                    $validationErrors = array_merge($validationErrors, $resolution['errors']);
                }
            }

            if (!empty($validationErrors)) {
                Cache::put(
                    "batch_error_{$this->batchUuid}", 
                    json_encode($validationErrors), 
                    now()->addMinutes(30)
                );
                throw new Exception("Errores de validación.");
            }

            DB::transaction(function () use ($groups, $saleService, $distributor, $createdBy) {
                foreach ($groups as $group) {
                    $saleService->persistOneSale(
                        sellerId:     $group['seller_id'],
                        saleDate:     $group['sale_date'],
                        items:        $group['items'],
                        distributor:  $distributor,
                        createdBy:    $createdBy,
                        notes:        $group['notes'],
                        batchUuid:    $this->batchUuid,
                        uploadMethod: 'csv',
                    );
                }

                \App\Models\ProcessedSalesFile::create([
                    'batch_uuid' => $this->batchUuid,
                    'file_hash' => $this->fileHash,
                    'original_file_name' => $this->originalFileName,
                    'distributor_id' => $distributor->id,
                    'created_by_id' => $this->createdById,
                ]);
            });

            Log::info("ProcessSalesFileJob completado", [
                'batch_uuid'      => $this->batchUuid,
                'sales_created'   => $groups->count(),
                'sellers_created' => $sellersAutoCreated,
            ]);

        } catch (Exception $e) {
            Log::error("ProcessSalesFileJob falló", [
                'batch_uuid' => $this->batchUuid,
                'error'      => $e->getMessage(),
            ]);

            if (!Cache::has("batch_error_{$this->batchUuid}")) {
                Cache::put(
                    "batch_error_{$this->batchUuid}", 
                    json_encode([$e->getMessage()]), 
                    now()->addMinutes(30)
                );
            }

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error("ProcessSalesFileJob agotó reintentos", [
            'batch_uuid' => $this->batchUuid,
            'error'      => $exception->getMessage(),
        ]);

        Storage::delete($this->storedFilePath);
    }
}
