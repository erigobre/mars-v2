<?php

namespace Database\Seeders;

use App\Models\Distributor;
use App\Models\Reward;
use App\Models\SellerTier;
use Database\Seeders\Data\RewardCatalog;
use Illuminate\Database\Seeder;


class DescuentoTierSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Localizar distribuidor y actualizar config de autenticación
        $distributor = Distributor::whereHas('user', function ($q) {
            $q->where('username', 'Dulces El Descuento');
        })->firstOrFail();

        $distributor->update([
            'identifier_type' => 'phone',
            'credential_type' => 'employee_code',
        ]);

        // 2. Tiers
        $tiers = [
            [
                'name'               => 'Descuento Bajo',
                'slug'               => 'descuento-bajo',
                'min_average_sales'  => 0.00,
                'max_average_sales'  => 1.00,
                'order'              => 1,
                'color'              => null,
                'icon'               => null,
                'prices'             => [1500 => 1, 3000 => 2, 6000 => 3],
            ],
            [
                'name'               => 'Descuento Medio Bajo',
                'slug'               => 'descuento-medio-bajo',
                'min_average_sales'  => 2.00,
                'max_average_sales'  => 3.00,
                'order'              => 2,
                'color'              => '#CD7F32',
                'icon'               => null,
                'prices'             => [1500 => 2, 3000 => 3, 6000 => 5],
            ],
            [
                'name'               => 'Descuento Medio',
                'slug'               => 'descuento-medio',
                'min_average_sales'  => 5.00,
                'max_average_sales'  => 6.00,
                'order'              => 3,
                'color'              => '#C0C0C0',
                'icon'               => null,
                'prices'             => [1500 => 3, 3000 => 5, 6000 => 8],
            ],
            [
                'name'               => 'Descuento Vip',
                'slug'               => 'descuento-vip',
                'min_average_sales'  => 10.00,
                'max_average_sales'  => null,
                'order'              => 4,
                'color'              => '#FFD700',
                'icon'               => null,
                'prices'             => [1500 => 5, 3000 => 10, 6000 => 15],
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

        $this->command->info('DescuentoTierSeeder: 4 rangos creados y puntos asignados a premios.');
    }
}