<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DisplaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            // [
            //     "name" => "Caja",
            //     "slug" => "caja",
            //     "value_points" => 1.00,
            //     "is_active" => true,
            //     "created_at" => now(),
            //     "updated_at" => now(),
            // ],
            [
                "name" => "Core",
                "slug" => "core",
                "value_points" => 1.00,
                "is_active" => true,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "name" => "Innovación",
                "slug" => "innovacion",
                "value_points" => 2.00,
                "is_active" => true,
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ];

        DB::table('displays')->insert($data);
    }
}
