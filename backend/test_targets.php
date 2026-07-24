<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$snapshots = \App\Models\SellerSalesSnapshot::with('redemptionCycle', 'seller.distributor')->whereHas('seller.user', function($q) {
    $q->where('username', 'like', '%JOSE RICARDO%');
})->get();

foreach ($snapshots as $snap) {
    echo "Snapshot ID: {$snap->id} CycleID: {$snap->redemption_cycle_id} CampID: {$snap->campaign_id} Scope: {$snap->seller->distributor->average_evaluation_scope}\n";
    echo "Target: " . $snap->target_average . "\n";
    echo "Promedio: " . $snap->seller->average_monthly_sales . "\n";
    echo "Crecimiento: " . $snap->seller->distributor->growth_percentage . "\n";
    if ($snap->redemptionCycle) {
        $start = \Carbon\Carbon::parse($snap->redemptionCycle->start_date);
        $end = \Carbon\Carbon::parse($snap->redemptionCycle->end_date);
        echo "CycleDays: " . ($start->diffInDays($end) + 1) . "\n";
        echo "DaysInMonth: " . $start->daysInMonth . "\n";
    }
}
