<?php

namespace Database\Seeders;

use App\Models\Distributor;
use App\Models\Reward;
use App\Models\Role;
use App\Models\Seller;
use App\Models\SellerTier;
use App\Models\User;
use App\Services\Auth\SellerAuthKeyService;
use App\Services\Phone\PhoneNormalizerService;
use Database\Seeders\Data\RewardCatalog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class MarsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(SellerAuthKeyService $authService): void
    {
        $distributorRole = Role::where('slug', 'distributor')->first();
        $roleSeller = Role::where('slug', 'seller')->first();

        $user = User::updateOrCreate(
            ['email' => 'distribuidor@mars.pruebas.com'],
            [
                'username' => 'MARS PRUEBAS',
                'phone' => app(PhoneNormalizerService::class)->normalize('5587654321'),
                'birthdate' => '1980-01-01',
                'role_id' => $distributorRole->id,
                'is_active' => true,
            ]
        );

        $authService->applyNonSellerAuth($user);

        $distributor = Distributor::updateOrCreate(
            ['user_id' => $user->id],
            [
                'company_name' => 'MARS PRUEBAS S.A. DE C.V.',
                'growth_percentage' => 1, // Ficticio (entre 0 y 100)
                'identifier_type'     => 'phone',
                'credential_type'     => 'birthdate',
            ]
        );

        $tiersData = [
            [
                'name' => 'Mars Regular',
                'slug' => 'mars-regular',
                'min_average_sales' => 1.00,
                'max_average_sales' => 38.00,
                'order' => 1,
                'color' => '#C0C0C0',
                'prices' => [1500 => 1, 3000 => 3, 6000 => 5]
            ],
            [
                'name' => 'Mars VIP',
                'slug' => 'mars-vip',
                'min_average_sales' => 106.00,
                'max_average_sales' => null,
                'order' => 2,
                'color' => '#FFD700',
                'prices' => [1500 => 5, 3000 => 10, 6000 => 15]
            ]
        ];

        $catalog = collect(RewardCatalog::get());
        $dbRewards = Reward::all();
        $createdTiers = collect();

        foreach ($tiersData as $tierData) {
            $pricesMap = $tierData['prices'];
            unset($tierData['prices']);

            $tier = SellerTier::updateOrCreate(
                ['slug' => $tierData['slug'], 'distributor_id' => $distributor->id],
                $tierData
            );

            $createdTiers->push($tier); // Guardamos para asignárselo al vendedor más adelante

            // Asignar los precios a los premios en la tabla pivote
            foreach ($dbRewards as $reward) {
                $catalogItem = $catalog->firstWhere('name', $reward->name);

                if ($catalogItem && isset($catalogItem['base_cost'])) {
                    $baseCost = $catalogItem['base_cost'];
                    if (isset($pricesMap[$baseCost])) {
                        $tier->rewards()->syncWithoutDetaching([
                            $reward->id => ['price_in_points' => $pricesMap[$baseCost]]
                        ]);
                    }
                }
            }
        }

        $sellerUser = User::updateOrCreate(
            ['email' => 'vendedor@mars.pruebas.com'], // Lo buscamos por email
            [
                'username' => 'MARS PRUEBA VENDEDOR',
                'phone' => app(PhoneNormalizerService::class)->normalize('5587654322'),
                'birthdate' => '1980-01-01',
                'role_id' => $roleSeller->id,
                'is_active' => true,
            ]
        );

        // Determinamos el Tier VIP para este vendedor en base a su promedio de ventas (Le ponemos 150 para que sea VIP)
        $averageSales = 150.00;
        $assignedTier = $createdTiers->first(function ($tier) use ($averageSales) {
            return $averageSales >= $tier->min_average_sales && ($tier->max_average_sales === null || $averageSales <= $tier->max_average_sales);
        });

        $seller = Seller::updateOrCreate(
            ['employee_code' => 'MARS-001'],
            [
                'user_id' => $sellerUser->id,
                'distributor_id' => $distributor->id,
                'seller_tier_id' => $assignedTier ? $assignedTier->id : null,
                'average_monthly_sales' => $averageSales,
            ]
        );

        Log::info('Distribuidor y seller', ['distributor' => $distributor, 'seller' => $seller]);
        $authService->applyAuth($seller, $distributor);

        $this->command->info('Seeder ejecutado: Distribuidor MARS, Vendedor MARS y Tiers creados con éxito.');
    }
}
