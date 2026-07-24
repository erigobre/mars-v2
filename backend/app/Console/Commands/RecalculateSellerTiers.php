<?php

namespace App\Console\Commands;

use App\Services\Seller\SellerTierService;
use Illuminate\Console\Command;

class RecalculateSellerTiers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sellers:recalculate-tiers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalcula y asigna el rango (tier) a todos los vendedores en base a sus metas de ventas promedio.';

    /**
     * Execute the console command.
     */
    public function handle(SellerTierService $tierService)
    {
        $this->info('Iniciando recálculo de rangos para vendedores...');

        $stats = $tierService->recalculateAllTiers();

        $this->table(
            ['Resultado', 'Cantidad'],
            [
                ['Actualizados (Rango Asignado/Cambiado)', $stats['updated']],
                ['Sin Cambios (Ya tenían el rango correcto)', $stats['unchanged']],
                ['Errores', $stats['errors']],
            ]
        );

        $this->info('Proceso finalizado.');
    }
}
