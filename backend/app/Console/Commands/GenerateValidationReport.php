<?php

namespace App\Console\Commands;

use App\Models\RedemptionCycle;
use App\Models\Seller;
use App\Models\SellerSalesSnapshot;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateValidationReport extends Command
{
    protected $signature = 'incentivos:validation-report {--campaign= : ID de la campaña}';

    protected $description = 'Genera un reporte CSV para validar que las ventas corresponden al periodo correcto.';

    public function handle()
    {
        $campaignId = $this->option('campaign') ?: \App\Models\Campaign::current()->first()?->id;

        if (!$campaignId) {
            $this->error('No hay campaña activa ni se especificó un ID.');
            return;
        }

        $this->info("Generando reporte para la campaña ID: $campaignId");

        $cycles = RedemptionCycle::where('campaign_id', $campaignId)->orderBy('start_date', 'asc')->get();
        $sellers = Seller::with('user', 'distributor')->get();

        $csvData = [];
        // Header
        $header = [
            'ID Vendedor',
            'Nombre Vendedor',
            'Cod Empleado',
            'Distribuidor',
            'Ventas Promedio Mensual',
            '% Crecimiento Dist',
        ];

        foreach ($cycles as $cycle) {
            $header[] = 'Meta ' . $cycle->name;
            $header[] = 'Unidades ' . $cycle->name;
        }

        $csvData[] = $header;

        $bar = $this->output->createProgressBar($sellers->count());

        foreach ($sellers as $seller) {
            if (!$seller->user || !$seller->distributor) {
                $bar->advance();
                continue;
            }

            $row = [
                $seller->id,
                $seller->user->username,
                $seller->employee_code,
                $seller->distributor->company_name,
                $seller->average_monthly_sales,
                $seller->distributor->growth_percentage,
            ];

            foreach ($cycles as $cycle) {
                $snapshot = SellerSalesSnapshot::where('seller_id', $seller->id)
                    ->where('redemption_cycle_id', $cycle->id)
                    ->first();

                $row[] = $snapshot ? $snapshot->target_average : 0;
                $row[] = $snapshot ? $snapshot->total_units_sold : 0;
            }

            $csvData[] = $row;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        $path = storage_path('app/public/reporte_validacion_ventas.csv');
        $fp = fopen($path, 'w');
        
        // Agregar BOM para que Excel lo abra con UTF-8 correctamente
        fputs($fp, $bom =(chr(0xEF) . chr(0xBB) . chr(0xBF)));

        foreach ($csvData as $fields) {
            fputcsv($fp, $fields);
        }
        fclose($fp);

        $this->info("Reporte generado exitosamente en: " . $path);
    }
}
