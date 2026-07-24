<?php

namespace Database\Factories;

use App\Models\Role;
use App\Services\Phone\PhoneNormalizerService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        // $phone = $this->faker->numerify('##########');
        $phone = '55' . $this->faker->numerify('########'); 

        $phoneNormalize = app(PhoneNormalizerService::class)->normalize($phone);

        return [
            'role_id'       => Role::inRandomOrder()->first()?->id ?? Role::factory()->create()->id,
            'username'      => $this->faker->name(),
            'email'         => $this->faker->unique()->safeEmail(),
            'phone'         => $phoneNormalize, // Genera 10 dígitos co
            'birthdate'     => $this->faker->date('Y-m-d', '2005-01-01'), // Formato para BD
            'is_active'     => true,
            'last_login_at' => null,
        ];
    }

    public function admin(): static
    {
        return $this->state(fn(array $attributes) => [
            'role_id' => Role::where('slug', 'admin')->first()->id,
        ]);
    }

    public function distributor(): static
    {
        return $this->state(fn(array $attributes) => [
            'role_id' => Role::where('slug', 'distributor')->first()->id,
        ]);
    }

    public function seller(): static
    {
        return $this->state(fn(array $attributes) => [
            'role_id' => Role::where('slug', 'seller')->first()->id,
        ]);
    }
}
