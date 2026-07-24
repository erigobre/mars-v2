<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$seller = \App\Models\Seller::whereHas('user', function($q) {
    $q->where('username', 'like', '%JOSE RICARDO GALLEGOS%');
})->with('user', 'distributor')->first();

$sale = \App\Models\Sale::with('items.product')->where('seller_id', $seller->id)->first();

$strategy = new \App\Services\Points\Strategies\AverageBasedStrategy();

$resolvedItems = $sale->items->map(function ($item) {
    return [
        'product_id' => $item->product_id,
        'quantity' => $item->quantity,
        'points_per_unit' => (float) $item->points_per_unit,
        'subtotal' => $item->subtotal
    ];
})->toArray();

$points = $strategy->calculatePoints($sale, $seller, $seller->distributor, $resolvedItems);

echo "Calculated points: " . $points . "\n";
print_r($strategy->getCalculationDetails());

