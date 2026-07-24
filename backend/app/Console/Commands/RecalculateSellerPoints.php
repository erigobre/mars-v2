<?php

namespace App\Console\Commands;

use App\Models\PointTransaction;
use App\Models\Sale;
use App\Models\Seller;
use App\Models\SellerSalesSnapshot;
use App\Services\Points\Strategies\AverageBasedStrategy;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RecalculateSellerPoints extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'incentivos:recalculate-points {--seller_id=* : ID de vendedor(es) específico(s) a recalcular}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalcula de manera profunda los puntos de los vendedores, procesando sus ventas cronológicamente para aplicar las correcciones.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando recálculo PROFUNDO de puntos...');

        $sellerIds = $this->option('seller_id');
        $query = Seller::with('distributor');
        
        if (!empty($sellerIds)) {
            $query->whereIn('id', $sellerIds);
        }

        // Tomamos TODOS los vendedores o los filtrados, para arreglar sus metas
        $sellers = $query->get();

        $bar = $this->output->createProgressBar($sellers->count());
        $bar->start();

        $strategy = new AverageBasedStrategy();
        $snapshotUpdater = app(\App\Services\Points\SnapshotUpdateService::class);
        $correctedSellers = 0;

        foreach ($sellers as $seller) {
            if (!$seller->distributor) {
                $bar->advance();
                continue;
            }

            DB::transaction(function () use ($seller, $strategy, $snapshotUpdater, &$correctedSellers) {
                // 1. Resetear todos los snapshots del vendedor a 0.
                SellerSalesSnapshot::where('seller_id', $seller->id)->update([
                    'total_units_sold' => 0,
                    'target_average' => 0,
                ]);

                // 1.5 Recalcular las metas para dejar el snapshot con el target correcto actual
                $snapshotUpdater->updateActiveSnapshotsForSeller($seller, false);

                // 2. Encontrar todas las ventas del vendedor cronológicamente
                $sales = Sale::with(['items.product'])
                    ->where('seller_id', $seller->id)
                    ->orderBy('sale_date', 'asc')
                    ->orderBy('id', 'asc')
                    ->get();
                
                $expectedPoints = 0;

                // 3. Borramos el historial viejo de puntos ganados para reconstruirlo limpio
                $oldTransactionsQuery = PointTransaction::where('seller_id', $seller->id)
                    ->where('type', \App\Enums\PointTransactionTypes::SALE_EARNED->value);
                
                $oldActualPoints = (int) $oldTransactionsQuery->sum('amount');
                $oldTransactionsQuery->delete();

                // Limpiamos los puntos ganados de las ventas e items
                Sale::whereIn('id', $sales->pluck('id'))->update(['points_earned' => 0]);
                \App\Models\SaleItem::whereIn('sale_id', $sales->pluck('id'))->update(['earned_points' => 0]);

                // 4. Simulamos y reconstruimos
                foreach ($sales as $sale) {
                    $resolvedItems = $sale->items->map(function ($item) {
                        return [
                            'product_id' => $item->product_id,
                            'quantity' => $item->quantity,
                            'points_per_unit' => (float) $item->points_per_unit,
                            'subtotal' => $item->subtotal
                        ];
                    })->toArray();

                    // Al llamar a calculatePoints, la estrategia leerá la fecha de la venta, 
                    // encontrará el ciclo correcto, cargará (o creará) el snapshot correcto, y lo actualizará.
                    $pointsForSale = $strategy->calculatePoints($sale, $seller, $seller->distributor, $resolvedItems);
                    
                    if ($pointsForSale > 0) {
                        $expectedPoints += $pointsForSale;

                        // Actualizar la venta usando Query Builder para evitar el bug de isDirty de Eloquent (el in-memory object tiene el valor viejo)
                        Sale::where('id', $sale->id)->update(['points_earned' => $pointsForSale]);

                        // Actualizar los items
                        $calcDetails = $strategy->getCalculationDetails();
                        if (isset($calcDetails['desglose']) && is_array($calcDetails['desglose'])) {
                            foreach ($calcDetails['desglose'] as $detalle) {
                                \App\Models\SaleItem::where('sale_id', $sale->id)
                                    ->where('product_id', $detalle['product_id'])
                                    ->update(['earned_points' => $detalle['puntos_ganados']]);
                            }
                        }

                        // Crear la nueva transacción correcta
                        PointTransaction::create([
                            'seller_id' => $seller->id,
                            'amount' => $pointsForSale,
                            'type' => \App\Enums\PointTransactionTypes::SALE_EARNED->value,
                            'balance_after' => 0, // Lo corregiremos al final para no enredar con la deuda
                            'sale_id' => $sale->id,
                            'metadata' => json_encode(['strategy' => $strategy->getName(), 'details' => $calcDetails]),
                        ]);
                    }
                }

                // 5. Ajuste final del saldo (current_points) absoluto desde cero
                // Como las transacciones de gasto (store_purchase) ya se guardan con amount negativo,
                // simplemente sumar toda la columna amount nos da el balance exacto real del ledger.
                $newBalance = (int) PointTransaction::where('seller_id', $seller->id)->sum('amount');
                
                $debtForgiven = 0;
                if ($newBalance < 0) {
                    $debtForgiven = abs($newBalance);
                    $newBalance = 0;
                }

                $seller->update(['current_points' => $newBalance]);

                // Si perdonamos deuda (ej. gastó puntos que no debía y quedó negativo), creamos una transacción de ajuste para cuadrar el ledger
                if ($debtForgiven > 0) {
                    PointTransaction::create([
                        'seller_id' => $seller->id,
                        'type' => \App\Enums\PointTransactionTypes::MANUAL_ADJUSTMENT->value,
                        'amount' => $debtForgiven,
                        'balance_after' => $newBalance,
                        'sale_id' => null,
                        'metadata' => json_encode(['reason' => 'Perdón de deuda por recálculo de sistema']),
                    ]);
                }

                $this->newLine();
                $this->warn("Vendedor {$seller->id}: Puntos ajustados. Nuevo Balance: {$newBalance}. Deuda perdonada: {$debtForgiven}");
                $correctedSellers++;
            });

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Recálculo profundo completado.");
    }
}
