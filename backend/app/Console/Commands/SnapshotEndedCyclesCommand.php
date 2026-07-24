<?php

namespace App\Console\Commands;

use App\Models\RedemptionCycle;
use App\Services\Campaign\CampaignService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SnapshotEndedCyclesCommand extends Command
{
    protected $signature = 'cycles:snapshot';
    protected $description = 'Toma el snapshot del ranking para los ciclos que terminaron ayer.';

    /**
     * Execute the console command.
     */
    public function handle(CampaignService $service)
    {
        $yesterday = Carbon::yesterday()->toDateString();
        
        $endedCycles = RedemptionCycle::whereDate('end_date', '<=', $yesterday)
            ->where('is_active', true)
            ->get();

        if ($endedCycles->isEmpty()) {
            $this->info('No hay ciclos por cerrar hoy.');
            return;
        }

        foreach ($endedCycles as $cycle) {
            $this->info("Procesando ciclo ID: {$cycle->id}");
            
            $service->snapshotCycleRanking($cycle);
            
            $cycle->update(['is_active' => false]);
            
            $this->info("Ciclo ID: {$cycle->id} cerrado exitosamente.");
        }
    }
}
