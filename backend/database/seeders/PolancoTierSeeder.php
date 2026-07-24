<?php

namespace Database\Seeders;

use App\Models\Distributor;
use App\Models\Reward;
use App\Models\SellerTier;
use Database\Seeders\Data\RewardCatalog;
use Illuminate\Database\Seeder;

class PolancoTierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $distributor = Distributor::whereHas('user', function ($query) {
            $query->where('username', 'Polanco Representaciones');
        })->first();

        $tiers = [
            [
                'name' => 'Polanco Regular',
                'slug' => 'polanco-regular',
                'min_average_sales' => 1.00,
                'max_average_sales' => 38.00, //
                'order' => 1,
                'color' => '#C0C0C0',
                'prices' => [1500 => 1, 3000 => 3, 6000 => 5] // Puntos x Premio
            ],
            [
                'name' => 'Polanco VIP',
                'slug' => 'polanco-vip',
                'min_average_sales' => 106.00,
                'max_average_sales' => null, // "Sin limite"
                'order' => 2,
                'color' => '#FFD700',
                'prices' => [1500 => 5, 3000 => 10, 6000 => 15] // Puntos x Premio
            ]
        ];

        $catalog = collect(RewardCatalog::get());
        
        $dbRewards = Reward::all();


        foreach ($tiers as $tierData) {
            $pricesMap = $tierData['prices']; // Ejemplo: [1500 => 1, 3000 => 3, 6000 => 5]
            unset($tierData['prices']);

            $tier = SellerTier::updateOrCreate(
                ['slug' => $tierData['slug'], 'distributor_id' => $distributor->id],
                $tierData
            );

            foreach ($dbRewards as $reward) {
                // Buscamos el premio en el catálogo usando el nombre
                $catalogItem = $catalog->firstWhere('name', $reward->name);
                
                if ($catalogItem && isset($catalogItem['base_cost'])) {
                    $baseCost = $catalogItem['base_cost'];
                    
                    if (isset($pricesMap[$baseCost])) {
                        $tierPoints = $pricesMap[$baseCost];

                        $tier->rewards()->syncWithoutDetaching([
                            $reward->id => ['price_in_points' => $tierPoints]
                        ]);
                    }
                }
            }
        }
    }
}
