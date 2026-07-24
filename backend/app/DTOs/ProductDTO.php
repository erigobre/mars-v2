<?php

namespace App\DTOs;

use App\Models\DistributorProduct;
use App\Models\Product;

class ProductDTO
{
    public function __construct(
        // IDs
        public readonly int     $id,
        public readonly int     $display_id,
        public readonly ?int    $distributor_product_id,

        // Datos básicos
        public readonly string  $sku,
        public readonly ?string  $upc,
        public readonly string  $name,
        public readonly ?string $description,
        // public readonly ?string $image_url,
        public readonly ?string $image,
        public readonly ?string $image_thumb,

        public readonly string  $unit_type,
        public readonly ?string $custom_unit_type,
        public readonly ?string $category,
        public readonly bool    $is_active,

        // Display (fuente de verdad para puntos)
        public readonly string  $display_name,
        public readonly float   $value_points,      // Puntos por unidad del display

        // Precio efectivo (custom o default)
        public readonly float   $price,
        public readonly float   $base_price,

        // Personalización del distribuidor
        public readonly bool    $is_customized,
        public readonly ?array  $customization,

        // Timestamps
        public readonly ?string $created_at,
        public readonly ?string $updated_at,
    ) {}

    /**
     * Crear DTO desde un Product sin customización de distribuidor.
     * El producto DEBE tener la relación display cargada.
     */
    public static function fromProduct(Product $product): self
    {
        return new self(
            id: $product->id,
            display_id: $product->display_id,
            distributor_product_id: null,
            sku: $product->sku,
            upc: $product->upc,
            name: $product->name,
            description: $product->description,
            image: $product->imageUrl(),
            image_thumb: $product->thumbUrl(),
            unit_type: $product->unit_type->value,
            custom_unit_type: $product->custom_unit_type,
            category: $product->category,
            is_active: $product->is_active,
            display_name: $product->display->name,
            value_points: (float) $product->display->value_points,
            price: (float) $product->default_price,
            base_price: (float) $product->default_price,
            is_customized: false,
            customization: null,
            created_at: $product->created_at?->toISOString(),
            updated_at: $product->updated_at?->toISOString(),
        );
    }

    /**
     * Crear DTO desde un Product CON customización de distribuidor.
     * Los puntos SIEMPRE vienen del display, nunca del distribuidor.
     */
    public static function fromProductWithCustomization(
        Product $product,
        DistributorProduct $custom
    ): self {
        return new self(
            id: $product->id,
            display_id: $product->display_id,
            distributor_product_id: $custom->id,
            // sku: $custom->custom_sku ?? $product->sku,
            sku: $product->sku,
            upc: $product->upc,
            name: $product->name,
            description: $product->description,
            // image_url: $product->image_url,
            image: $product->imageUrl(),
            image_thumb: $product->thumbUrl(),
            unit_type: $product->unit_type->value,
            custom_unit_type: $product->custom_unit_type,
            category: $product->category,
            is_active: $product->is_active,
            display_name: $product->display->name,
            value_points: (float) $product->display->value_points, // SIEMPRE del display
            // price: $custom->custom_price
            //     ? (float) $custom->custom_price
            //     : (float) $product->default_price,
            price: $product->default_price,
            base_price: (float) $product->default_price,
            is_customized: true,
            customization: [
                'id'                => $custom->id,
                'distributor_id'    => $custom->distributor_id,
                'custom_sku'        => $custom->custom_sku,
                'custom_price'      => $custom->custom_price ? (float) $custom->custom_price : null,
                'max_sale_quantity' => $custom->max_sale_quantity ? (float) $custom->max_sale_quantity : null,
                'notes'             => $custom->notes,
                'created_at'        => $custom->created_at?->toISOString(),
                'updated_at'        => $custom->updated_at?->toISOString(),
            ],
            created_at: $product->created_at?->toISOString(),
            updated_at: $product->updated_at?->toISOString(),
        );
    }

    public function toArray(): array
    {
        return [
            'id'                     => $this->id,
            'display_id'             => $this->display_id,
            'distributor_product_id' => $this->distributor_product_id,
            'sku'                    => $this->sku,
            'upc'                    => $this->upc,
            'name'                   => $this->name,
            'description'            => $this->description,
            // 'image_url'              => $this->image_url,
            'image'                  => $this->image,
            'image_thumb'            => $this->image_thumb,
            'unit_type'              => $this->unit_type,
            'custom_unit_type'       => $this->custom_unit_type,
            'category'               => $this->category,
            'is_active'              => $this->is_active,
            'display_name'           => $this->display_name,
            'value_points'           => $this->value_points,
            'price'                  => $this->price,
            'base_price'             => $this->base_price,
            'is_customized'          => $this->is_customized,
            'customization'          => $this->customization,
            'created_at'             => $this->created_at,
            'updated_at'             => $this->updated_at,
        ];
    }
}
