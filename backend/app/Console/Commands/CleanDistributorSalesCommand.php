<?php

namespace App\Console\Commands;

use App\Models\Distributor;
use App\Models\PointTransaction;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CleanDistributorSalesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sales:cleanup-distributor';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Limpia ventas mal cargadas de un distribuidor en un periodo de tiempo y recalcula los puntos.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->warn('--- HERRAMIENTA CRÍTICA DE BORRADO DE VENTAS ---');

        // 1. Authenticate Admin User
        $adminPhone = $this->ask('Por seguridad, ingresa el teléfono de un usuario Administrador (ej. 4691331080)');
        
        // Formatear a +52 si no lo tiene
        $adminPhone = preg_replace('/[^0-9+]/', '', $adminPhone); // Limpiar caracteres raros
        if (!str_starts_with($adminPhone, '+52') && strlen($adminPhone) == 10) {
            $adminPhone = '+52' . $adminPhone;
        }

        $adminUser = User::where('phone', $adminPhone)->first();

        if (!$adminUser || !$adminUser->isAdmin()) {
            $this->error('Usuario no encontrado o no tiene rol de Administrador.');
            return;
        }

        $adminPassword = $this->secret('Ingresa la contraseña del Administrador');
        if (!Hash::check($adminPassword, $adminUser->password)) {
            $this->error('Contraseña incorrecta. Operación abortada.');
            return;
        }

        $this->info("Autenticado como {$adminUser->username}. Acceso concedido.");

        // 2. Distributor
        $distributors = Distributor::all();
        if ($distributors->isEmpty()) {
            $this->error('No hay distribuidores registrados.');
            return;
        }

        $distributorChoices = $distributors->mapWithKeys(function ($d) {
            return [$d->id => "{$d->id} - {$d->company_name}"];
        })->toArray();

        $distributorId = $this->choice(
            'Selecciona el Distribuidor al que se le borrarán las ventas',
            $distributorChoices
        );

        // Get actual ID from the selected string
        $distributorId = explode(' - ', $distributorId)[0];
        $distributor = Distributor::find($distributorId);

        // 3. Period
        $startDateStr = $this->ask('Ingresa la fecha de INICIO del periodo a borrar (formato YYYY-MM-DD)');
        $endDateStr = $this->ask('Ingresa la fecha de FIN del periodo a borrar (formato YYYY-MM-DD)');

        try {
            $startDate = Carbon::createFromFormat('Y-m-d', $startDateStr)->startOfDay();
            $endDate = Carbon::createFromFormat('Y-m-d', $endDateStr)->endOfDay();
        } catch (\Exception $e) {
            $this->error('Formato de fecha inválido. Asegúrate de usar YYYY-MM-DD.');
            return;
        }

        if ($startDate->gt($endDate)) {
            $this->error('La fecha de inicio no puede ser mayor a la fecha de fin.');
            return;
        }

        // 4. Find affected sales
        $sales = Sale::whereHas('seller', function ($query) use ($distributorId) {
            $query->where('distributor_id', $distributorId);
        })
        ->whereBetween('sale_date', [$startDate, $endDate])
        ->get();

        if ($sales->isEmpty()) {
            $this->info("No se encontraron ventas para {$distributor->company_name} entre {$startDate->toDateString()} y {$endDate->toDateString()}.");
            return;
        }

        $salesCount = $sales->count();
        $sellerIds = $sales->pluck('seller_id')->unique();
        $sellersCount = $sellerIds->count();

        $this->warn("Se encontraron {$salesCount} ventas pertenecientes a {$sellersCount} vendedores de {$distributor->company_name}.");
        $this->warn("Periodo: {$startDate->toDateString()} al {$endDate->toDateString()}");

        if (!$this->confirm('¿ESTÁS ABSOLUTAMENTE SEGURO de querer borrar estas ventas permanentemente?', false)) {
            $this->info('Operación cancelada.');
            return;
        }

        // 5. Delete and Recalculate
        $this->info('Iniciando borrado...');
        
        DB::beginTransaction();

        try {
            $saleIds = $sales->pluck('id');

            // a. Eliminar PointTransactions
            $deletedTransactions = PointTransaction::whereIn('sale_id', $saleIds)->delete();
            $this->line("- Eliminadas {$deletedTransactions} transacciones de puntos.");

            // b. Eliminar SaleItems
            $deletedItems = SaleItem::whereIn('sale_id', $saleIds)->delete();
            $this->line("- Eliminados {$deletedItems} items de ventas.");

            // c. Eliminar Sales
            $deletedSales = Sale::whereIn('id', $saleIds)->delete();
            $this->line("- Eliminadas {$deletedSales} ventas.");

            DB::commit();
            $this->info('Ventas borradas exitosamente de la base de datos.');

            Log::info("Limpieza de ventas ejecutada por Admin ({$adminUser->email}). Distribuidor: {$distributor->company_name}. Periodo: {$startDateStr} al {$endDateStr}. Ventas borradas: {$salesCount}.");

            // 6. Recalcular puntos
            $this->info('Iniciando recálculo de puntos para los vendedores afectados...');

            // Pasamos todos los IDs de vendedores a la vez en lugar de iterar para mejorar la eficiencia y mostrar una sola barra de progreso
            Artisan::call('incentivos:recalculate-points', [
                '--seller_id' => $sellerIds->toArray()
            ]);
            
            $this->info(Artisan::output());

            $this->info('Recálculo de puntos finalizado.');
            $this->info('Proceso completado con éxito. Todo cuadra como si las ventas nunca hubieran ocurrido.');

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Ocurrió un error al borrar las ventas. Se ha revertido la operación: ' . $e->getMessage());
            Log::error('Error en sales:cleanup-distributor: ' . $e->getMessage());
        }
    }
}
