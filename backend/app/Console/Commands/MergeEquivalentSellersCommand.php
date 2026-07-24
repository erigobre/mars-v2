<?php

namespace App\Console\Commands;

use App\Models\PointTransaction;
use App\Models\RewardClaim;
use App\Models\Sale;
use App\Models\Seller;
use App\Models\SellerEquivalence;
use App\Models\SellerGoalProgress;
use App\Models\SellerSalesSnapshot;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class MergeEquivalentSellersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'incentivos:merge-equivalent-sellers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Unifica las ventas y transacciones de los vendedores duplicados (creados por error de código) hacia su vendedor principal, basado en las equivalencias, y elimina lógicamente al duplicado.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Iniciando unificación de vendedores equivalentes...");

        $equivalences = SellerEquivalence::with('seller')->get();
        $mergedCount = 0;
        $affectedMainSellers = [];

        foreach ($equivalences as $eq) {
            $mainSellerId = $eq->seller_id;
            $badCode = $eq->equivalent_code;

            // Encontrar al vendedor duplicado usando el código erróneo
            // MySQL es case-insensitive por defecto, por lo que 'VENDEDOR 3O' podría hacer match con 'Vendedor 3O'.
            // Para asegurarnos de que agarramos al malo, evitamos el ID del principal.
            $badSeller = Seller::withTrashed()
                ->where('employee_code', $badCode)
                ->where('id', '!=', $mainSellerId)
                ->first();

            if (!$badSeller) {
                // No existe un vendedor con este código erróneo, se saltará
                continue;
            }

            // Si el vendedor principal es el mismo que el "malo", algo está mal en la equivalencia
            if ($badSeller->id === $mainSellerId) {
                continue;
            }

            $badSellerId = $badSeller->id;

            // Iniciamos transacción para que la migración sea segura
            DB::beginTransaction();

            try {
                // 1. Mover Ventas (Sales)
                $salesMoved = Sale::where('seller_id', $badSellerId)
                    ->update(['seller_id' => $mainSellerId]);

                // 2. Mover Transacciones de Puntos
                $pointsMoved = PointTransaction::where('seller_id', $badSellerId)
                    ->update(['seller_id' => $mainSellerId]);

                // 3. Mover Progresos de Metas (si los hay)
                $goalsMoved = SellerGoalProgress::where('seller_id', $badSellerId)
                    ->update(['seller_id' => $mainSellerId]);

                // 4. Mover Reclamaciones de Recompensas (si las hay)
                $claimsMoved = RewardClaim::where('seller_id', $badSellerId)
                    ->update(['seller_id' => $mainSellerId]);

                // 5. Eliminar los Snapshots viejos del vendedor malo (se reconstruirán al recalcular)
                $snapshotsDeleted = SellerSalesSnapshot::where('seller_id', $badSellerId)->delete();

                // 6. Si el vendedor malo no estaba eliminado, lo eliminamos (soft delete)
                if (!$badSeller->trashed()) {
                    $badSeller->delete();
                }

                DB::commit();

                if ($salesMoved > 0 || $pointsMoved > 0) {
                    $this->info("Unificado: [{$badCode}] -> Principal ID: [{$mainSellerId}] | Ventas: {$salesMoved} | Puntos: {$pointsMoved} | Metas: {$goalsMoved} | Claims: {$claimsMoved}");
                    $mergedCount++;
                    // Guardamos el vendedor principal para recalcularlo después
                    $affectedMainSellers[$mainSellerId] = true;
                }

            } catch (\Exception $e) {
                DB::rollBack();
                $this->error("Error unificando {$badCode}: " . $e->getMessage());
            }
        }

        $this->info("Unificación completada. Se unificaron datos de {$mergedCount} vendedores equivalentes.");

        if (!empty($affectedMainSellers)) {
            $this->info("Recalculando puntos para " . count($affectedMainSellers) . " vendedores principales afectados...");
            
            // Llamamos al comando de recálculo solo para los vendedores principales que recibieron ventas
            foreach (array_keys($affectedMainSellers) as $sellerId) {
                // Suponiendo que el comando recalculate-points acepte opcionalmente un ID
                // Pero como actualmente procesa todos, lo llamaremos de forma masiva al final.
            }
            
            // Corremos el comando completo para asegurar la integridad de la base de datos de manera uniforme
            Artisan::call('incentivos:recalculate-points');
            $this->info("Recálculo completado.");
        }
    }
}
