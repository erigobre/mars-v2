<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            ['display_id' => 1, 'sku' => '10232426', 'upc' => '7506174506698',  'category' => 'Core',       'image_url' => "products/0e1b8826-ba97-435f-9bda-14e30dea264e.jpg", 'name' => 'M&Ms Milk',            'price' => 105.89],
            ['display_id' => 1, 'sku' => '10232429', 'upc' => '7506174506674',  'category' => 'Core',       'image_url' => "products/a986577a-0712-4598-b735-d152a37bf898.webp", 'name' => 'M&Ms Peanut',          'price' => 105.89],
            ['display_id' => 1, 'sku' => '10173422', 'upc' => '17506174512214', 'category' => 'Core',       'image_url' => "products/501d38d9-7d71-418a-bb12-b51d3fa3d3ee.jpg", 'name' => 'Milky Way',            'price' => 92.25],
            ['display_id' => 1, 'sku' => '10173428', 'upc' => '17506174512252', 'category' => 'Core',       'image_url' => "products/4daa41a6-91b0-4471-b958-d3fd28209e3f.jpg", 'name' => 'Snickers',             'price' => 92.25],
            ['display_id' => 2, 'sku' => '60013724', 'upc' => '7506656100055',  'category' => 'Innovación', 'image_url' => "products/6412e9eb-dca9-477c-8cc2-ed1949824188.jpg", 'name' => 'Milky Way Minis',      'price' => 60.13],
            ['display_id' => 2, 'sku' => '60013712', 'upc' => '7506656100048',  'category' => 'Innovación', 'image_url' => "products/c6f3074d-7ff1-46d3-9161-f0e887adef19.webp", 'name' => 'Snickers Minis',       'price' => 60.13],
            ['display_id' => 2, 'sku' => '10405463', 'upc' => '7502271918266',  'category' => 'Innovación', 'image_url' => "products/10d19c65-3060-4390-ba40-76711e04ff72.webp", 'name' => 'Lucas Lenwas Mango',   'price' => 23.42],
            ['display_id' => 2, 'sku' => '60010301', 'upc' => '7502271919775',  'category' => 'Innovación', 'image_url' => "products/df1eafb0-f18c-40af-9e50-01fdb608639d.jpg", 'name' => 'Lucas Lenwas Sandía',  'price' => 23.42],
        ];

        foreach ($products as $p) {
            Product::create([
                'display_id'    => $p['display_id'],
                'upc'           => $p['upc'],
                'sku'           => $p['sku'],
                'name'          => $p['name'],
                'image_url'     => $p['image_url'],
                'default_price' => $p['price'],
                'category'      => $p['category'],
                'is_active'     => true,
            ]);
        }
    }
}
