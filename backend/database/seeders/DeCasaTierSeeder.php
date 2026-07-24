<?php

namespace Database\Seeders;

use App\Models\Distributor;
use App\Models\Reward;
use App\Models\SellerTier;
use Database\Seeders\Data\RewardCatalog;
use Illuminate\Database\Seeder;

class DeCasaTierSeeder extends Seeder
{
    public function run(): void
    {
        $distributor = Distributor::whereHas('user', function ($q) {
            $q->where('username', 'Grupo De Casa');
        })->firstOrFail();

        $distributor->update([
            'identifier_type' => 'employee_code',
            'credential_type' => 'employee_code',
        ]);

        $tiers = [
            [
                'name'               => 'DeCasa VIP',
                'slug'               => 'decasa-vip',
                'min_average_sales'  => 100.00,
                'max_average_sales'  => 168.00,
                'order'              => 4,
                'color'              => '#CD7F32',
                'icon'               => null,
                'prices'             => [1500 => 10, 3000 => 15, 6000 => 32],
            ],
            [
                'name'               => 'DeCasa Media alta',
                'slug'               => 'decasa-media-alta',
                'min_average_sales'  => 35.00,
                'max_average_sales'  => 94.00,
                'order'              => 3,
                'color'              => '#C0C0C0',
                'icon'               => null,
                'prices'             => [1500 => 5, 3000 => 10, 6000 => 20],
            ],
            [
                'name'               => 'DeCasa Media baja',
                'slug'               => 'decasa-media-baja',
                'min_average_sales'  => 11.00,
                'max_average_sales'  => 34.00,
                'order'              => 2,
                'color'              => '#FFD700',
                'icon'               => null,
                'prices'             => [1500 => 2, 3000 => 4, 6000 => 8],
            ],
            [
                'name'               => 'DeCasa baja',
                'slug'               => 'decasa-baja',
                'min_average_sales'  => 1.00,
                'max_average_sales'  => 10.00,
                'order'              => 1,
                'color'              => null,
                'icon'               => null,
                'prices'             => [1500 => 1, 3000 => 3, 6000 => 6],
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

        $this->command->info('DeCasaTierSeeder: 4 rangos creados exitosamente.');
    }
}