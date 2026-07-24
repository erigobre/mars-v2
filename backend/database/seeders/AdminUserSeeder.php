<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\Auth\SellerAuthKeyService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(SellerAuthKeyService $authService): void
    {
        $adminRoleId = DB::table('roles')->where('slug', 'admin')->value('id');

        // 2. Definimos los usuarios y phone como E.164
        $admins = [
            [
                'role_id' => $adminRoleId,
                'username' => 'Mario Cobian',
                'email' => 'mcobian@wimbly.me',
                'phone' => '+524691331080',
                'birthdate' => '2003-12-09',
                'is_active' => true,
            ],
            [
                'role_id' => $adminRoleId,
                'username' => 'Enrique Lopez',
                'email' => 'elopez@hydis.mx',
                'birthdate' => '1986-10-04',
                'phone' => '+525564499303',
                'is_active' => true,
            ],
            [
                'role_id' => $adminRoleId,
                'username' => 'Rodrigo Reyes',
                'birthdate' => '2003-09-12',
                'email' => 'rreyes@hydis.mx',
                'phone' => '+525591955029',
                'is_active' => true,
            ],
        ];

        // DB::table('users')->insert($admins);
        foreach ($admins as $admin) {

            // $admin['password'] = Carbon::parse($admin['birthdate'])->format('dmY');

            $user = User::create($admin);
            $authService->applyNonSellerAuth($user);
        }
    }
}
