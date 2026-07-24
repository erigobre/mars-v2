<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{

    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['Abarrotes', 'Bebidas', 'Limpieza', 'Despensa', 'Snacks'];
        $unitTypes  = ['PIECE', 'PACKAGE', 'BOX', 'KG'];

        return [
            'display_id'    => Display::factory(),
            'sku'           => 'SKU-' . fake()->unique()->numerify('######'),
            'name'          => fake()->words(3, true),
            'description'   => fake()->sentence(),
            'image_url'     => fake()->imageUrl(400, 400, 'products'),
            'default_price' => fake()->randomFloat(2, 10, 500),
            'unit_type'     => fake()->randomElement($unitTypes),
            'category'      => fake()->randomElement($categories),
            'stock'         => fake()->numberBetween(0, 500),
            'is_active'     => fake()->boolean(90),
        ];
    }

    /**
     * Producto activo
     */
    public function active(): static
    {
        return $this->state(['is_active' => true]);
    }

    /**
     * Producto sin stock
     */
    public function outOfStock()
    {
        return $this->state(fn (array $attributes) => [
            'stock' => 0,
        ]);
    }
}
