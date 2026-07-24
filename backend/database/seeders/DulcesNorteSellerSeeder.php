<?php

namespace Database\Seeders;

use App\Models\Distributor;
use App\Models\Role;
use App\Models\Seller;
use App\Models\SellerTier;
use App\Models\User;
use App\Services\Auth\SellerAuthKeyService;
use Illuminate\Database\Seeder;


class DulcesNorteSellerSeeder extends Seeder
{
    public function run(SellerAuthKeyService $authService): void
    {
        $distributor = Distributor::whereHas('user', function ($q) {
            $q->where('username', 'Dulces del Norte');
        })->firstOrFail();

        $roleSeller = Role::where('slug', 'seller')->firstOrFail();
        $tiers      = SellerTier::where('distributor_id', $distributor->id)->get();

        $vendedores = [
            ['employee_code' => 'Vendedor 4 P',  'average_monthly_sales' => 333, 'assigned_range' => 'Dulces del norte VIP'],
            ['employee_code' => 'Vendedor 1 F',  'average_monthly_sales' => 251, 'assigned_range' => 'Dulces del norte Media alta'],
            ['employee_code' => 'Vendedor 5 R',  'average_monthly_sales' => 248, 'assigned_range' => 'Dulces del norte Media alta'],
            ['employee_code' => 'Vendedor 6 T',  'average_monthly_sales' => 162, 'assigned_range' => 'Dulces del norte Media baja'],
            ['employee_code' => 'Vendedor 7C',   'average_monthly_sales' => 143, 'assigned_range' => 'Dulces del norte Media baja'],
            ['employee_code' => 'Vendedor 3O',   'average_monthly_sales' => 87,  'assigned_range' => 'Dulces del norte Baja'],
            ['employee_code' => 'Vendedor 7',    'average_monthly_sales' => 74,  'assigned_range' => 'Dulces del norte Baja'],
            ['employee_code' => 'Vendedor 2 G',  'average_monthly_sales' => 64,  'assigned_range' => 'Dulces del norte Baja'],
        ];

        foreach ($vendedores as $index => $v) {
            // Generar username desde nombre del distribuidor + número secuencial
            $generatedUsername = 'DULCES DEL NORTE ' . ($index + 1);

            $assignedTier = $tiers->first(fn($t) => strtolower(trim($t->name)) === strtolower(trim($v['assigned_range'])))
                ?? $tiers->first(fn($t) => $t->isInRange($v['average_monthly_sales']));

            // Verificar que el código no esté duplicado antes de crear el usuario
            $existingSeller = Seller::where('employee_code', $v['employee_code'])->first();

            if ($existingSeller) {
                // Actualizar datos del seller existente
                $existingSeller->update([
                    'distributor_id'        => $distributor->id,
                    'seller_tier_id'        => $assignedTier?->id,
                    'average_monthly_sales' => $v['average_monthly_sales'],
                    'shipping_notes'        => 'Entrega en sucursal',
                ]);
                $seller = $existingSeller;
            } else {
                $user = User::create([
                    'username'  => $generatedUsername,
                    'email'     => null,
                    'phone'     => null,
                    'birthdate' => null,
                    'role_id'   => $roleSeller->id,
                    'is_active' => true,
                ]);

                $seller = Seller::create([
                    'user_id'               => $user->id,
                    'employee_code'         => $v['employee_code'],
                    'distributor_id'        => $distributor->id,
                    'seller_tier_id'        => $assignedTier?->id,
                    'average_monthly_sales' => $v['average_monthly_sales'],
                    'shipping_notes'        => 'Entrega en sucursal',
                ]);
            }

            try {
                $authService->applyAuth($seller, $distributor);
            } catch (\RuntimeException $e) {
                $this->command->warn("DulcesNorte [{$v['employee_code']}]: {$e->getMessage()}");
            }
        }

        $this->command->info('DulcesNorteSellerSeeder: ' . count($vendedores) . ' vendedores procesados.');
    }
}
