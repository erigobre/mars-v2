<?php

namespace App\Models;

use App\Models\Distributor;
use App\Models\Product;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DistributorProduct extends Model
{
    /** @use HasFactory<\Database\Factories\DistributorProductFactory> */
    use HasFactory, LogsActivity;

    protected $fillable = [
        'distributor_id',
        'product_id',
        'custom_sku',
        'custom_price',
        'notes'
    ];

    protected $casts = [
        'custom_price' => 'decimal:2'
    ];

    public function distributor(): BelongsTo
    {
        return $this->belongsTo(Distributor::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getLogDescription(string $action): string
    {

        switch ($action) {
            case 'CREATED':
                return "Personalización de producto: {$this->name} del distribuidor {$this->distributor->company_name} (SKU: {$this->sku})";
            case 'UPDATED':
                return "Personalización de producto actualizada: {$this->name} del distribuidor {$this->distributor->company_name} (SKU: {$this->sku})";
            case 'DELETED':
                return "Personalización de producto eliminada: {$this->name} del distribuidor {$this->distributor->company_name} (SKU: {$this->sku})";
            default:
                return "Acción {$action} en personalización de producto: {$this->name} del distribuidor {$this->distributor->company_name} (SKU: {$this->sku})";
        }
    }
}
