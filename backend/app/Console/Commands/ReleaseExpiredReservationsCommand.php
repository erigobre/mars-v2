<?php

namespace App\Console\Commands;

use App\Services\RewardClaim\RewardClaimService;
use Illuminate\Console\Command;

class ReleaseExpiredReservationsCommand extends Command
{
    protected $signature   = 'claims:release-expired';
    protected $description = 'Libera reservas de premios vencidas y restaura stock y puntos';

    /**
     * Execute the console command.
     */
    public function handle(RewardClaimService $service): int
    {
        $this->info('Buscando reservas vencidas...');

        $released = $service->releaseExpiredReservations();

        if ($released === 0) {
            $this->line('Sin reservas vencidas.');
        } else {
            $this->info("✓ {$released} reserva(s) liberada(s). Stock y puntos restaurados.");
        }

        return Command::SUCCESS;
    }
}
