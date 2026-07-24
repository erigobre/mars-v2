<?php

namespace Database\Seeders;

use App\Models\Distributor;
use App\Models\Reward;
use App\Models\SellerTier;
use Database\Seeders\Data\RewardCatalog;
use Illuminate\Database\Seeder;

class DulcesNorteTierSeeder extends Seeder
{
    public function run(): void
    {
        $distributor = Distributor::whereHas('user', function ($q) {
            $q->where('username', 'Dulces del Norte');
        })->firstOrFail();

        $tiers = [
            [
                'name'               => 'Dulces del norte VIP',
                'slug'               => 'dulcesnorte-vip',
                'min_average_sales'  => 333.00,
                'max_average_sales'  => null,        // Sin límite superior
                'order'              => 4,
                'color'              => '#CD7F32',
                'icon'               => null,
                'prices'             => [1500 => 10, 3000 => 15, 6000 => 35],
            ],
            [
                'name'               => 'Dulces del norte Media alta',
                'slug'               => 'dulcesnorte-media-alta',
                'min_average_sales'  => 248.00,
                'max_average_sales'  => 251.00,
                'order'              => 3,
                'color'              => '#C0C0C0',
                'icon'               => null,
                'prices'             => [1500 => 5, 3000 => 10, 6000 => 27],
            ],
            [
                'name'               => 'Dulces del norte Media baja',
                'slug'               => 'dulcesnorte-media-baja',
                'min_average_sales'  => 143.00,
                'max_average_sales'  => 162.00,
                'order'              => 2,
                'color'              => '#FFD700',
                'icon'               => null,
                'prices'             => [1500 => 4, 3000 => 12, 6000 => 17],
            ],
            [
                'name'               => 'Dulces del norte Baja',
                'slug'               => 'dulcesnorte-baja',
                'min_average_sales'  => 64.00,
                'max_average_sales'  => 87.00,
                'order'              => 1,
                'color'              => null,
                'icon'               => null,
                'prices'             => [1500 => 2, 3000 => 6, 6000 => 12],
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

        $this->command->info('DulcesNorteTierSeeder: 4 rangos creados y puntos asignados a premios.');
    }
}