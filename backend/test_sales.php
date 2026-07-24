<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$seller = \App\Models\Seller::whereHas('user', function($q) {
    $q->where('username', 'like', '%JOSE RICARDO GALLEGOS%');
})->with('user')->first();

$sales = \App\Models\Sale::where('seller_id', $seller->id)->orderBy('sale_date', 'asc')->get();
foreach ($sales as $sale) {
    echo "Sale ID: {$sale->id} Date: {$sale->sale_date}\n";
    
    // Evaluate cycle for sale
    $saleDate = \Carbon\Carbon::parse($sale->sale_date);
    $activeCycle = \App\Models\RedemptionCycle::with('campaign')
        ->where('start_date', '<=', $saleDate->format('Y-m-d H:i:s'))
        ->where('end_date', '>=', $saleDate->format('Y-m-d H:i:s'))
        ->first();
        
    if ($activeCycle) {
        echo "Belongs to cycle: {$activeCycle->id} ({$activeCycle->start_date} to {$activeCycle->end_date})\n";
    } else {
        echo "No cycle found for this date!\n";
    }
}
