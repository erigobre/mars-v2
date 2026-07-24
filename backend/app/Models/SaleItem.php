<?php

namespace App\Models;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleItem extends Model
{
    protected $fillable = [
        'sale_id',
        'product_id',
        'unrecognized_sku',
        'display_id',
        'quantity',
        'unit_price',
        'subtotal',
        'points_per_unit',
        'total_points',
        'earned_points',
        'applied_rule',
    ];

    protected function casts(): array
    {
        return [
            'quantity'        => 'decimal:2',
            'unit_price'      => 'decimal:2',
            'subtotal'        => 'decimal:2',
            'points_per_unit' => 'decimal:2',
            'total_points'    => 'decimal:2',
            'earned_points'   => 'decimal:2',
        ];
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
