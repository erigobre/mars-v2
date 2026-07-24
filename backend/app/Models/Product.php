<?php

namespace App\Models;

use App\Enums\UnitType;
use App\Models\Display;
use App\Models\DistributorProduct;
use App\Traits\HasImage;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory, LogsActivity, HasImage, SoftDeletes;

    protected string $imageContext = 'product';
    protected string $imageColumn  = 'image_url';

    protected $fillable = [
        'display_id',
        'sku',
        'upc',
        'name',
        'description',
        'image_url',
        'default_price',
        'unit_type',
        'custom_unit_type',
        'category',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'unit_type' => UnitType::class,
            'is_active' => 'boolean',
            'default_price' => 'decimal:2'
        ];
    }

    public function display(): BelongsTo
    {
        return $this->belongsTo(Display::class);
    }

    public function distributorProducts(): HasMany
    {
        return $this->hasMany(DistributorProduct::class);
    }

    public function scopeGlobalSearch($query, $value)
    {
        return $query->where(function ($q) use ($value) {
            $q->where('name', 'like', "%{$value}%")
                ->orWhere('sku', 'like', "%{$value}%")
                ->orWhere('description', 'like', "%{$value}%")
                ->orWhereHas('distributorProducts', function ($subQuery) use ($value) {
                    $subQuery->where('custom_sku', 'like', "%{$value}%");
                })
                ->orWhereHas('distributorProducts.distributor', function ($subQuery) use ($value) {
                    $subQuery->where('company_name', 'like', "%{$value}%");
                });
        });
    }

    public function getLogDescription(string $action): string
    {
        switch ($action) {
            case 'CREATED':
                return "Producto creado: {$this->name} (SKU: {$this->sku})";
            case 'UPDATED':
                return "Producto actualizado: {$this->name} (SKU: {$this->sku})";
            case 'DELETED':
                return "Producto eliminado: {$this->name} (SKU: {$this->sku})";
            default:
                return "Acción {$action} en producto: {$this->name} (SKU: {$this->sku})";
        }
    }
}
