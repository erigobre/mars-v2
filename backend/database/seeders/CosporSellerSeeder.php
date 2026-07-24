<?php

namespace Database\Seeders;

use App\Models\Distributor;
use App\Models\Role;
use App\Models\Seller;
use App\Models\SellerTier;
use App\Models\User;
use App\Services\Auth\SellerAuthKeyService;
use Illuminate\Database\QueryException;
use Illuminate\Database\Seeder;

class CosporSellerSeeder extends Seeder
{
    public function run(SellerAuthKeyService $authService): void
    {
        $distributor = Distributor::whereHas('user', function ($q) {
            $q->where('username', 'Cospor Distribuciones');
        })->firstOrFail();

        $roleSeller = Role::where('slug', 'seller')->firstOrFail();
        $tiers      = SellerTier::where('distributor_id', $distributor->id)->get();

        $vendedores = [
            ['username' => 'ADRIANA CASILLAS ROMERO',         'employee_code' => '26', 'average_monthly_sales' => 14,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'ALEJANDRO ZEPEDA PEREZ',          'employee_code' => '29', 'average_monthly_sales' => 10,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'ANTONIO EMMANUEL DIAZ ROSAS',     'employee_code' => '28', 'average_monthly_sales' => 30,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'ARTURO EMERSON DELGADO BARBOZA',  'employee_code' => '25', 'average_monthly_sales' => 28,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'DAVID CEDEÑO SORIA',              'employee_code' => '4',  'average_monthly_sales' => 18,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'ERICA RUIZ SUAREZ',               'employee_code' => '20', 'average_monthly_sales' => 4,   'assigned_range' => 'Cospor Baja'],
            ['username' => 'ERNESTO VALENTE LOPEZ',           'employee_code' => '36', 'average_monthly_sales' => 13,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'HUGO ESCOBEDO ESQUIVEL',          'employee_code' => '17', 'average_monthly_sales' => 28,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'JONATHAN SANDOVAL SANDOVAL',      'employee_code' => '34', 'average_monthly_sales' => 20,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'JORGE ARTURO RIVERA',             'employee_code' => '7',  'average_monthly_sales' => 236, 'assigned_range' => 'Cospor Vip'],
            ['username' => 'JOSE DE JESUS RANGEL ORTEGA',     'employee_code' => '33', 'average_monthly_sales' => 22,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'JOSE DE JESUS RODRIGUEZ AREVALO', 'employee_code' => '35', 'average_monthly_sales' => 27,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'JOSE JUAN TELLEZ ALVAREZ',        'employee_code' => '8',  'average_monthly_sales' => 49,  'assigned_range' => 'Cospor Regular'],
            ['username' => 'JOSE RAMON CHAVEZ ARMAS',         'employee_code' => '24', 'average_monthly_sales' => 56,  'assigned_range' => 'Cospor Regular'],
            ['username' => 'JOSE RICARDO GALLEGOS LINARES',   'employee_code' => '18', 'average_monthly_sales' => 55,  'assigned_range' => 'Cospor Regular'],
            ['username' => 'JOSE TRINIDAD SUAREZ SUAREZ',     'employee_code' => '21', 'average_monthly_sales' => 35,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'MARCO ANTONIO MENDOZA ALONSO',    'employee_code' => '3',  'average_monthly_sales' => 14,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'MARCO ARTURO ROJAS PEREZ',        'employee_code' => '22', 'average_monthly_sales' => 71,  'assigned_range' => 'Cospor Regular'],
            ['username' => 'MARCOS CAYETANO GOMEZ',           'employee_code' => '37', 'average_monthly_sales' => 47,  'assigned_range' => 'Cospor Regular'],
            ['username' => 'MARGARITO MARTÍNEZ MENDOZA',      'employee_code' => '12', 'average_monthly_sales' => 29,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'MARIA ELIDET RIZO ANGUIANO',      'employee_code' => '9',  'average_monthly_sales' => 6,   'assigned_range' => 'Cospor Baja'],
            ['username' => 'MARLON MONTES HERNANDEZ',         'employee_code' => '5',  'average_monthly_sales' => 10,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'MAURO MUÑOZ ZAVALA',              'employee_code' => '14', 'average_monthly_sales' => 49,  'assigned_range' => 'Cospor Regular'],
            ['username' => 'OSCAR ARMANDO JIMENEZ JIMENEZ',   'employee_code' => '32', 'average_monthly_sales' => 54,  'assigned_range' => 'Cospor Regular'],
            ['username' => 'PABLO CASTAÑON VILLALON',         'employee_code' => '2',  'average_monthly_sales' => 4,   'assigned_range' => 'Cospor Baja'],
            ['username' => 'PABLO MUÑOZ ZAVALA',              'employee_code' => '10', 'average_monthly_sales' => 26,  'assigned_range' => 'Cospor Baja'],
            // avg=142 pero el cliente lo asigna a Cospor Vip; se respeta el Excel
            ['username' => 'PEDRO DAMIAN AVALOS SEPULVEDA',   'employee_code' => '6',  'average_monthly_sales' => 142, 'assigned_range' => 'Cospor Vip'],
            ['username' => 'RICARDO COSTILLA HARO',           'employee_code' => '19', 'average_monthly_sales' => 27,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'RICHARD MONTIEL GONZÁLEZ',        'employee_code' => '15', 'average_monthly_sales' => 11,  'assigned_range' => 'Cospor Baja'],
            ['username' => 'ROBERTO RAMIREZ ESTRADA',         'employee_code' => '16', 'average_monthly_sales' => 68,  'assigned_range' => 'Cospor Regular'],
        ];

        foreach ($vendedores as $v) {
            // Buscar tier por nombre del Excel; si no coincide, intentar isInRange()
            $assignedTier = $tiers->first(fn($t) => strtolower(trim($t->name)) === strtolower(trim($v['assigned_range'])))
                ?? $tiers->first(fn($t) => $t->isInRange($v['average_monthly_sales']));

            try {
                $user = User::firstOrCreate(
                    ['username' => $v['username'], 'role_id' => $roleSeller->id],
                    [
                        'username'  => $v['username'],
                        'email'     => null,
                        'phone'     => null,
                        'birthdate' => null,
                        'role_id'   => $roleSeller->id,
                        'is_active' => true,
                    ]
                );
            } catch (QueryException $e) {
                $this->command->error(
                    "Error creando user [{$v['employee_code']} - {$v['username']}]: " . $e->getMessage()
                );
                continue;
            }

            $seller = Seller::updateOrCreate(
                ['employee_code' => $v['employee_code'], 'distributor_id' => $distributor->id],
                [
                    'user_id'               => $user->id,
                    'distributor_id'        => $distributor->id,
                    'seller_tier_id'        => $assignedTier?->id,
                    'average_monthly_sales' => $v['average_monthly_sales'],
                    'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
                ]
            );

            try {
                $authService->applyAuth($seller, $distributor);
            } catch (\RuntimeException $e) {
                $this->command->warn("Cospor [{$v['employee_code']}]: {$e->getMessage()}");
            }
        }

        $this->command->info('CosporSellerSeeder: ' . count($vendedores) . ' vendedores procesados.');
    }
}
