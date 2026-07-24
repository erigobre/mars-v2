<?php

namespace App\Console\Commands;

use App\Models\SaleItem;
use App\Models\SellerSalesSnapshot;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RecalculateSellerSnapshots extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'incentivos:recalculate-snapshots';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalcula el total_units_sold de todos los snapshots activos usando la fuente de verdad (SaleItem)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando recálculo de SellerSalesSnapshots...');

        $snapshots = SellerSalesSnapshot::with(['seller.distributor', 'redemptionCycle', 'campaign'])->get();
        
        $bar = $this->output->createProgressBar(count($snapshots));
        $bar->start();

        $updatedCount = 0;
        $differencesCount = 0;

        foreach ($snapshots as $snapshot) {
            $seller = $snapshot->seller;
            
            if (!$seller || !$seller->distributor) {
                $bar->advance();
                continue;
            }

            $scope = $seller->distributor->average_evaluation_scope ?? 'cycle';
            
            if ($scope === 'cycle' && $snapshot->redemptionCycle) {
                $startDate = Carbon::parse($snapshot->redemptionCycle->start_date);
                $endDate = Carbon::parse($snapshot->redemptionCycle->end_date);
            } elseif ($snapshot->campaign) {
                $startDate = Carbon::parse($snapshot->campaign->start_date);
                $endDate = Carbon::parse($snapshot->campaign->end_date);
            } else {
                $bar->advance();
                continue;
            }

            // Real units from DB for this period
            $realUnits = (float) SaleItem::whereNotNull('product_id')
                ->whereHas('sale', function ($q) use ($seller, $startDate, $endDate) {
                    $q->where('seller_id', $seller->id)
                      ->whereBetween('sale_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
                })->sum('quantity');

            $currentUnits = (float) $snapshot->total_units_sold;

            if ($realUnits !== $currentUnits) {
                $snapshot->update(['total_units_sold' => $realUnits]);
                $this->newLine();
                $this->warn("Vendedor ID {$seller->id}: Corregido de {$currentUnits} a {$realUnits}");
                $differencesCount++;
            }

            $updatedCount++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        
        $this->info("Recálculo completado. Se revisaron {$updatedCount} snapshots.");
        if ($differencesCount > 0) {
            $this->warn("Se corrigieron discrepancias en {$differencesCount} snapshots.");
        } else {
            $this->info("Todos los snapshots estaban correctos.");
        }
    }
}
