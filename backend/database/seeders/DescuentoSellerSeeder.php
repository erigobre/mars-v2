<?php

namespace Database\Seeders;

use App\Models\Distributor;
use App\Models\Role;
use App\Models\Seller;
use App\Models\SellerTier;
use App\Models\User;
use App\Services\Auth\SellerAuthKeyService;
use App\Services\Phone\PhoneNormalizerService;
use Illuminate\Database\Seeder;


class DescuentoSellerSeeder extends Seeder
{
    public function run(
        SellerAuthKeyService $authService,
        PhoneNormalizerService $phoneNormalizer
    ): void {
        $distributor = Distributor::whereHas('user', function ($q) {
            $q->where('username', 'Dulces El Descuento');
        })->firstOrFail();

        $roleSeller = Role::where('slug', 'seller')->firstOrFail();
        $tiers      = SellerTier::where('distributor_id', $distributor->id)->get();

        $vendedores = [
            [
                'username'              => 'Pilar Vital Mendez',
                'email'                 => 'pvital@dulceseldescuento.com.mx',
                'phone'                 => '3330290729',
                'employee_code'         => '301',
                'average_monthly_sales' => 5,
                'assigned_range'        => 'Descuento Medio',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Pa Bajio',
                'email'                 => 'aclientes@dulceseldescuento.com.mx',
                'phone'                 => '5621624426',
                'employee_code'         => '304',
                'average_monthly_sales' => 5,
                'assigned_range'        => 'Descuento Medio',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Miriam Gonzalez',
                'email'                 => 'mgonzalez@dulceseldescuento.com.mx',
                'phone'                 => '3310737830',
                'employee_code'         => '305',
                'average_monthly_sales' => 5,
                'assigned_range'        => 'Descuento Medio',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Armando Castro',
                'email'                 => 'acastro@dulceseldescuento.com.mx',
                'phone'                 => '5534648189',
                'employee_code'         => '401',
                'average_monthly_sales' => 36,
                'assigned_range'        => 'Descuento Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Norberto Salas Monarca',
                'email'                 => 'nsalas@dulceseldescuento.com.mx',
                'phone'                 => '2225467724',
                'employee_code'         => '402',
                'average_monthly_sales' => 12,
                'assigned_range'        => 'Descuento Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Mario Mendoza Villegas',
                'email'                 => 'mmendoza@dulceseldescuento.com.mx',
                'phone'                 => '5540171553',
                'employee_code'         => '403',
                'average_monthly_sales' => 45,
                'assigned_range'        => 'Descuento Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                // Email compartido con código 604; éste tiene prioridad por ser el primero
                'username'              => 'Dercy Gudiño',
                'email'                 => 'davalos@dulceseldescuento.com.mx',
                'phone'                 => '3531081616',
                'employee_code'         => '404',
                'average_monthly_sales' => 5,
                'assigned_range'        => 'Descuento Medio',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Nestor Yañez',
                'email'                 => 'nyanez@dulceseldescuento.com.mx',
                'phone'                 => '5566949962',
                'employee_code'         => '405',
                'average_monthly_sales' => 7,
                'assigned_range'        => 'Descuento Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'David Donge',
                'email'                 => 'ddonge@dulceseldescuento.com.mx',
                'phone'                 => '7641300362',
                'employee_code'         => '406',
                'average_monthly_sales' => 173,
                'assigned_range'        => 'Descuento Medio',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Mauricio Correa',
                'email'                 => 'maco@dulceseldescuento.com.mx',
                'phone'                 => '5527729701',
                'employee_code'         => '501',
                'average_monthly_sales' => 80,
                'assigned_range'        => 'Descuento Medio Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Jorge Carrasco',
                'email'                 => 'jcarrasco@dulceseldescuento.com.mx',
                'phone'                 => '5532142574',
                'employee_code'         => '502',
                'average_monthly_sales' => 340,
                'assigned_range'        => 'Descuento Vip',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Pa. Ecatepec',
                'email'                 => 'kalvarado@dulceseldescuento.com.mx',
                'phone'                 => '5517564860',
                'employee_code'         => '503',
                'average_monthly_sales' => 20,
                'assigned_range'        => 'Descuento Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Blanca Martinez Morales',
                'email'                 => 'bmorales@dulceseldescuento.com.mx',
                'phone'                 => '5514481217',
                'employee_code'         => '504',
                'average_monthly_sales' => 61,
                'assigned_range'        => 'Descuento Medio Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Sergio Garcia Alva',
                'email'                 => 'sgarcia@dulceseldescuento.com.mx',
                'phone'                 => '5566880823',
                'employee_code'         => '505',
                'average_monthly_sales' => 102,
                'assigned_range'        => 'Descuento Medio Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Jaqueline Caro Castillo',
                'email'                 => 'jcaro@dulceseldescuento.com.mx',
                'phone'                 => '5535685877',
                'employee_code'         => '506',
                'average_monthly_sales' => 5,
                'assigned_range'        => 'Descuento Medio',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Marco Rosillo',
                'email'                 => 'mrosillo@dulceseldescuento.com.mx',
                'phone'                 => '5563556815',
                'employee_code'         => '507',
                'average_monthly_sales' => 12,
                'assigned_range'        => 'Descuento Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Divina Cajero',
                'email'                 => 'dcajero@dulceseldescuento.com.mx',
                'phone'                 => '5535279034',
                'employee_code'         => '508',
                'average_monthly_sales' => 12,
                'assigned_range'        => 'Descuento Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Julia Hernandez',
                'email'                 => 'j.hernandez@dulceseldescuento.com.mx',
                'phone'                 => '5951161800',
                'employee_code'         => '509',
                'average_monthly_sales' => 16,
                'assigned_range'        => 'Descuento Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                // Sin teléfono → no se puede configurar login (identifier_type=phone)
                'username'              => 'Ruben Barragan',
                'email'                 => 'rbarragan@dulceseldescuento.com.mx',
                'phone'                 => null,
                'employee_code'         => '551',
                'average_monthly_sales' => 51,
                'assigned_range'        => 'Descuento Medio Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Denny Martinez',
                'email'                 => 'dluna@dulceseldescuento.com.mx',
                'phone'                 => '5561657374',
                'employee_code'         => '552',
                'average_monthly_sales' => 155,
                'assigned_range'        => 'Descuento Medio',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Atención a Clientes',
                'email'                 => 'aventas@dulceseldescuento.com.mx',
                'phone'                 => '5566312651',
                'employee_code'         => '553',
                'average_monthly_sales' => 13,
                'assigned_range'        => 'Descuento Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Manuel Martinez',
                'email'                 => 'mmartinez@dulceseldescuento.com.mx',
                'phone'                 => '5574005223',
                'employee_code'         => '601',
                'average_monthly_sales' => 70,
                'assigned_range'        => 'Descuento Medio Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                'username'              => 'Jorge Zamudio',
                'email'                 => 'jzamudio@dulceseldescuento.com.mx',
                'phone'                 => '2711735338',
                'employee_code'         => '603',
                'average_monthly_sales' => 14,
                'assigned_range'        => 'Descuento Bajo',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
            [
                // Email duplicado (mismo que código 404); se deja null para evitar conflicto DB
                'username'              => 'Francisco Hernandez Cordoba',
                'email'                 => null,
                'phone'                 => '9613876405',
                'employee_code'         => '604',
                'average_monthly_sales' => 5,
                'assigned_range'        => 'Descuento Medio',
                'shipping_notes'        => 'Entrega premios en CEDIS de cliente',
            ],
        ];

        foreach ($vendedores as $v) {
            // Normalizar teléfono si viene
            $normalizedPhone = null;
            if (!empty($v['phone'])) {
                $normalizedPhone = $phoneNormalizer->normalize($v['phone']);
            }

            // Buscar tier por nombre del Excel; fallback a isInRange()
            $assignedTier = $tiers->first(fn($t) => strtolower(trim($t->name)) === strtolower(trim($v['assigned_range'])))
                ?? $tiers->first(fn($t) => $t->isInRange($v['average_monthly_sales']));

            // Buscar o crear usuario evitando duplicados de email/phone
            $lookupEmail = $v['email'];
            $user = null;

            if ($lookupEmail) {
                $user = User::where('email', $lookupEmail)->first();
            }
            if (!$user && $normalizedPhone) {
                $user = User::where('phone', $normalizedPhone)->first();
            }

            if (!$user) {
                $user = User::create([
                    'username'  => $v['username'],
                    'email'     => $lookupEmail,
                    'phone'     => $normalizedPhone,
                    'birthdate' => null,
                    'role_id'   => $roleSeller->id,
                    'is_active' => true,
                ]);
            }

            $seller = Seller::updateOrCreate(
                ['employee_code' => $v['employee_code'], 'distributor_id' => $distributor->id],
                [
                    'user_id'               => $user->id,
                    'distributor_id'        => $distributor->id,
                    'seller_tier_id'        => $assignedTier?->id,
                    'average_monthly_sales' => $v['average_monthly_sales'],
                    'shipping_notes'        => $v['shipping_notes'],
                ]
            );

            // Intentar configurar credenciales de login
            try {
                $authService->applyAuth($seller, $distributor);
            } catch (\RuntimeException $e) {
                // Ocurre cuando el vendedor no tiene teléfono (Ruben Barragan, código 551)
                $this->command->warn(
                    "Descuento [{$v['employee_code']} - {$v['username']}]: "
                        . "Login no configurado → {$e->getMessage()}"
                );
            }
        }

        $this->command->info('DescuentoSellerSeeder: ' . count($vendedores) . ' vendedores procesados.');
    }
}
