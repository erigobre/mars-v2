<?php

namespace App\Console\Commands;

use App\Models\SellerSalesSnapshot;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupDuplicateSnapshotsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'incentivos:cleanup-snapshots';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Elimina los snapshots repetidos (mismo vendedor y ciclo) dejando solo el más reciente.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Buscando snapshots duplicados...");

        $duplicates = DB::table('seller_sales_snapshots')
            ->select('seller_id', 'redemption_cycle_id', 'campaign_id', DB::raw('COUNT(*) as count'))
            ->groupBy('seller_id', 'redemption_cycle_id', 'campaign_id')
            ->having('count', '>', 1)
            ->get();

        if ($duplicates->isEmpty()) {
            $this->info("No se encontraron snapshots duplicados.");
            return;
        }

        $deletedCount = 0;

        foreach ($duplicates as $dup) {
            // Obtenemos todos los IDs de los snapshots repetidos para este grupo, ordenados del más nuevo al más viejo
            $ids = DB::table('seller_sales_snapshots')
                ->where('seller_id', $dup->seller_id)
                ->where('redemption_cycle_id', $dup->redemption_cycle_id)
                ->where('campaign_id', $dup->campaign_id)
                ->orderBy('id', 'desc')
                ->pluck('id')
                ->toArray();
            
            // Quitamos el primero del array (es el ID más alto, por lo tanto el más reciente que queremos conservar)
            $keepId = array_shift($ids);
            
            // Eliminamos todos los demás
            SellerSalesSnapshot::whereIn('id', $ids)->delete();
            $deletedCount += count($ids);

            $this->line("Vendedor ID {$dup->seller_id}: Conservado snapshot {$keepId}, eliminados " . count($ids) . " duplicados.");
        }

        $this->info("Limpieza completada. Se eliminaron {$deletedCount} snapshots duplicados en total.");
    }
}
