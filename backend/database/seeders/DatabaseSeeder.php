<?php

namespace Database\Seeders;

use App\Models\Seller;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\CosporSellerSeeder;
use Database\Seeders\CosporTierSeeder;
use Database\Seeders\DeCasaSellerSeeder;
use Database\Seeders\DeCasaTierSeeder;
use Database\Seeders\DescuentoSellerSeeder;
use Database\Seeders\DescuentoTierSeeder;
use Database\Seeders\DisplaySeeder;
use Database\Seeders\DulcesNorteDistributorSeeder;
use Database\Seeders\DulcesNorteSellerSeeder;
use Database\Seeders\DulcesNorteTierSeeder;
use Database\Seeders\MarsSeeder;
use Database\Seeders\PolancoSellerSeeder;
use Database\Seeders\PolancoTierSeeder;
use Database\Seeders\RewardSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    // use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            AdminUserSeeder::class,
            DisplaySeeder::class,

            DistributorSeeder::class,
            DulcesNorteDistributorSeeder::class,
            
            ProductSeeder::class,
            RewardSeeder::class,

            MarsSeeder::class,

            PolancoTierSeeder::class,    // Rangos y precios de Polanco
            CosporTierSeeder::class,
            DescuentoTierSeeder::class,
            DulcesNorteTierSeeder::class,
            DeCasaTierSeeder::class,

            PolancoSellerSeeder::class,  // Vendedores reales de Polanco
            CosporSellerSeeder::class,
            DescuentoSellerSeeder::class,
            DulcesNorteSellerSeeder::class,
            DeCasaSellerSeeder::class,
        ]);

        
        if (app()->environment('local', 'testing')) {
            $this->command->info('Entorno local detectado: Generando datos de prueba...');
            
            // Seller::factory(20)->create();
        } else {
            $this->command->info('Entorno de producción detectado: Omitiendo factories de prueba.');
        }
    }
}
