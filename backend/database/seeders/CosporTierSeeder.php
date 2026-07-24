<?php

namespace Database\Seeders;

use App\Models\Distributor;
use App\Models\Reward;
use App\Models\SellerTier;
use Database\Seeders\Data\RewardCatalog;
use Illuminate\Database\Seeder;

class CosporTierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $distributor = Distributor::whereHas('user', function ($q) {
            $q->where('username', 'Cospor Distribuciones');
        })->firstOrFail();

        $distributor->update([
            'identifier_type' => 'employee_code',
            'credential_type' => 'employee_code',
        ]);

        $tiers = [
            [
                'name'               => 'Cospor Baja',
                'slug'               => 'cospor-baja',
                'min_average_sales'  => 4.00,
                'max_average_sales'  => 35.00,
                'order'              => 1,
                'color'              => '#CD7F32',
                'icon'               => null,
                'prices'             => [1500 => 3, 3000 => 10, 6000 => 20],
            ],
            [
                'name'               => 'Cospor Regular',
                'slug'               => 'cospor-regular',
                'min_average_sales'  => 47.00,
                'max_average_sales'  => 71.00,
                'order'              => 2,
                'color'              => '#C0C0C0',
                'icon'               => null,
                'prices'             => [1500 => 5, 3000 => 15, 6000 => 30],
            ],
            [
                'name'               => 'Cospor Vip',
                'slug'               => 'cospor-vip',
                'min_average_sales'  => 236.00,
                'max_average_sales'  => null,
                'order'              => 3,
                'color'              => '#FFD700',
                'icon'               => null,
                'prices'             => [1500 => 15, 3000 => 50, 6000 => 65],
            ],
        ];

        $catalog   = collect(RewardCatalog::get());
        $dbRewards = Reward::all();

        foreach ($tiers as $tierData) {
            $pricesMap = $tierData['prices'];
            unset($tierData['prices']);

            $tier = SellerTier::updateOrCreate(
                ['slug' => $tierData['slug'], 'distributor_id' => $distributor->id],
                array_merge($tierData, ['distributor_id' => $distributor->id])
            );

            foreach ($dbRewards as $reward) {
                $catalogItem = $catalog->firstWhere('name', $reward->name);
                if ($catalogItem && isset($catalogItem['base_cost'])) {
                    $baseCost = $catalogItem['base_cost'];
                    if (isset($pricesMap[$baseCost])) {
                        $tier->rewards()->syncWithoutDetaching([
                            $reward->id => ['price_in_points' => $pricesMap[$baseCost]],
                        ]);
                    }
                }
            }
        }

        $this->command->info('CosporTierSeeder: 3 rangos creados y puntos asignados a premios.');
    }
}
