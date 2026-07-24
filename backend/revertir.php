<?php
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\PointTransaction;
use App\Models\ProcessedSalesFile;
use Illuminate\Support\Facades\Artisan;

$batchUuid = 'fd6084ef-d2f5-43f6-bef4-0fb14623f235';
$fileId = 19;

$sales = Sale::where('batch_uuid', $batchUuid)->get();
$sellerIds = $sales->pluck('seller_id')->unique()->toArray();

if ($sales->isEmpty()) {
    echo "No se encontraron ventas.\n";
} else {
    $salesCount = $sales->count();
    $salesIds = $sales->pluck('id')->toArray();
    PointTransaction::whereIn('sale_id', $salesIds)->delete();
    SaleItem::whereIn('sale_id', $salesIds)->delete();
    Sale::whereIn('id', $salesIds)->delete();
    echo "Eliminadas {$salesCount} ventas y sus items.\n";
    ProcessedSalesFile::where('id', $fileId)->delete();
    echo "Registro eliminado.\n";
    if (!empty($sellerIds)) {
        echo "Recalculando " . count($sellerIds) . " vendedores...\n";
        Artisan::call('incentivos:recalculate-points', ['--seller_id' => $sellerIds]);
        echo Artisan::output();
    }
    echo "¡Exito!\n";
}
