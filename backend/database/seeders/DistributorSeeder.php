<?php

namespace Database\Seeders;

use App\Models\Distributor;
use App\Models\Role;
use App\Models\User;
use App\Services\Auth\SellerAuthKeyService;
use App\Services\Phone\PhoneNormalizerService;
use Illuminate\Database\Seeder;

class DistributorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(SellerAuthKeyService $authService): void
    {
        $distributorRole = Role::where('slug', 'distributor')->first();

        $distributors = [
            [
                'username' => 'Grupo De Casa',
                'email' => 'grupodecasa@correo.com',
                'birthdate' => '1985-05-15',
                'company_name' => 'GRUPO DE CASA',
                'phone' => '4629876543',
                'identifier_type'     => 'email',
                'credential_type'     => 'employee_code',
            ],
            [
                'username' => 'Polanco Representaciones',
                'email' => 'pocalcorepresentaciones@correo.com',
                'birthdate' => '2003-12-09',
                'company_name' => 'POLANCO REPRESENTACIONES',
                'phone' => '4621234568',
                'identifier_type'     => 'phone',
                'credential_type'     => 'birthdate',
            ],
            [
                'username' => 'Dulces El Descuento',
                'email' => 'eldescuento@correo.com',
                'birthdate' => '1990-02-28',
                'company_name' => 'DULCES EL DESCUENTO S.A. DE C.V.',
                'phone' => '4625551234',
                'identifier_type'     => 'phone',
                'credential_type'     => 'employee_code',
            ],
            [
                'username' => 'Cospor Distribuciones',
                'email' => 'cospor@correo.com',
                'birthdate' => '1988-11-20',
                'company_name' => 'COSPOR DISTRIBUCIONES SA DE CV',
                'phone' => '4624449876',
                'identifier_type'     => 'employee_code',
                'credential_type'     => 'employee_code',
            ],
        ];

        foreach ($distributors as $data) {
            // Creamos el usuario con el rol de distribuidor
            $user = User::create([
                'username'  => $data['username'],
                'email'     => $data['email'],
                'role_id'   => $distributorRole->id,
                'birthdate' => $data['birthdate'],
                'phone'     => app(PhoneNormalizerService::class)->normalize($data['phone']), // Campo en la tabla users
                'is_active' => true,
            ]);

            $authService->applyNonSellerAuth($user);

            // Creamos el perfil de distribuidor vinculado al usuario
            Distributor::create([
                'user_id'      => $user->id,
                'company_name' => $data['company_name'],
                'identifier_type' => $data['identifier_type'] ?? null,
                'credential_type' => $data['credential_type'] ?? null,
            ]);
        }
    }
}
