<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Administrador',
                'slug' => 'admin',
                'description' => 'Acceso total al sistema y configuraciones',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Distribuidor',
                'slug' => 'distributor',
                'description' => 'Gestiona vendedores y asigna metas',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Vendedor',
                'slug' => 'seller',
                'description' => 'Usuario final, registra ventas y canjea puntos',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Logística',
                'slug' => 'logistics',
                'description' => 'Visualiza estadísticas y gestiona los estados de los canjes de premios',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        DB::table('roles')->insert($roles);
    }
}
