<?php

namespace App\Console\Commands;

use App\Models\Seller;
use App\Services\Auth\SellerAuthKeyService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixSellerLoginKeysCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-login-keys';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalcula y corrige los login_keys de todos los vendedores para alinearlos con el formato estricto de libphonenumber';

    /**
     * Execute the console command.
     */
    public function handle(SellerAuthKeyService $authService)
    {
        $this->info("Iniciando corrección masiva de login_keys...");

        $sellers = Seller::with(['user', 'distributor'])->get();
        $updated = 0;

        foreach ($sellers as $seller) {
            $user = $seller->user;
            $distributor = $seller->distributor;

            if (!$user || !$distributor) {
                continue;
            }

            try {
                $oldKey = $user->login_key;
                $newKey = $authService->buildLoginKey(
                    $distributor->id,
                    $distributor->identifier_type,
                    $user,
                    $seller
                );

                if ($oldKey !== $newKey) {
                    DB::table('users')->where('id', $user->id)->update([
                        'login_key' => $newKey
                    ]);
                    $this->line("Usuario ID {$user->id}: {$oldKey} -> {$newKey}");
                    $updated++;
                }
            } catch (\Exception $e) {
                $this->error("Error con vendedor ID {$seller->id}: " . $e->getMessage());
            }
        }

        $this->info("Proceso completado. Se actualizaron {$updated} registros.");
    }
}
