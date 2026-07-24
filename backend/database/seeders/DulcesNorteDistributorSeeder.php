<?php

namespace Database\Seeders;

use App\Models\Distributor;
use App\Models\Role;
use App\Models\User;
use App\Services\Auth\SellerAuthKeyService;
use App\Services\Phone\PhoneNormalizerService;
use Illuminate\Database\Seeder;


class DulcesNorteDistributorSeeder extends Seeder
{
    public function run(
        SellerAuthKeyService $authService,
        PhoneNormalizerService $phoneNormalizer
    ): void {
        $distributorRole = Role::where('slug', 'distributor')->firstOrFail();

        $user = User::firstOrCreate(
            ['email' => 'distribuidora@dulcesdelnorte.com'],
            [
                'username'  => 'Dulces del Norte',
                'email'     => 'distribuidora@dulcesdelnorte.com',
                'phone'     => $phoneNormalizer->normalize('8001234567'),
                'birthdate' => '1990-01-01',
                'role_id'   => $distributorRole->id,
                'is_active' => true,
            ]
        );

        $authService->applyNonSellerAuth($user);

        Distributor::updateOrCreate(
            ['user_id' => $user->id],
            [
                'company_name'        => 'DULCES DEL NORTE',
                'growth_percentage'   => 0,
                'average_evaluation_scope' => 'cycle',
                // Vendedores de esta sucursal: login con código de empleado
                'identifier_type'     => 'employee_code',
                'credential_type'     => 'employee_code',
            ]
        );

        $this->command->info('DulcesNorteDistributorSeeder: Distribuidor "Dulces del Norte" creado/actualizado.');
    }
}