<?php

namespace Database\Factories;

use App\Models\Distributor;
use App\Models\Role;
use App\Models\Seller;
use App\Models\User;
use App\Services\Auth\SellerAuthKeyService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Seller>
 */
class SellerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sellerRole = Role::where('slug', 'seller')->first();

        return [
            'user_id' => User::factory()->create([
                'role_id' => $sellerRole->id,
            ])->id,
            'distributor_id' => Distributor::inRandomOrder()->first()?->id,
            'employee_code'  => $this->faker->unique()->bothify('EMP-####'),
            'current_points' => $this->faker->randomFloat(2, 0, 1000),
            'address_street' => $this->faker->streetAddress(),
            'address_colonia'=> $this->faker->word(),
            'address_city'   => $this->faker->city(),
            'address_state'  => $this->faker->state(),
            'address_zip'    => $this->faker->postcode(),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Seller $seller) {
            $distributor = $seller->distributor;
            
            app(SellerAuthKeyService::class)->applyAuth($seller, $distributor);
        });
    }
}
