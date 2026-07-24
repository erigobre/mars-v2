<?php

namespace App\Models;

use App\Enums\SaleUploadMethods;
use App\Models\PointTransaction;
use App\Models\SaleItem;
use App\Models\Seller;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    use LogsActivity;

    protected $fillable = [
        'created_by',
        'folio',
        'seller_id',
        'sale_date',
        'total_amount',
        'points_earned',
        'status',
        'batch_uuid',
        'upload_method',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'sale_date'    => 'datetime',
            'total_amount' => 'decimal:2',
            'points_earned' => 'integer',
            'upload_method' => SaleUploadMethods::class,
        ];
    }


    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function pointTransactions(): HasMany
    {
        return $this->hasMany(PointTransaction::class);
    }

    public function scopeGlobalSearch($query, $value)
    {
        return $query->where(function ($q) use ($value) {
            $q->where('folio', 'like', "%{$value}%")
                ->orWhere('seller_id', 'like', "%{$value}%")
                ->orWhere('total_amount', 'like', "%{$value}%")
                ->orWhereHas('seller', function ($subQuery) use ($value) {
                    $subQuery->where('employee_code', 'like', "%{$value}%")
                        ->orWhereHas('user', function ($subSubQuery) use ($value) {
                            $subSubQuery->where('username', 'like', "%{$value}%")
                                ->orWhere('email', 'like', "%{$value}%")
                                ->orWhere('phone', 'like', "%{$value}%");
                        });
                })
                ->orWhereHas('items', function ($itemQuery) use ($value) {
                    $itemQuery->where('unrecognized_sku', 'like', "%{$value}%")
                              ->orWhere('subtotal', 'like', "%{$value}%")
                              ->orWhereHas('product', function ($prodQuery) use ($value) {
                                  $prodQuery->where('name', 'like', "%{$value}%")
                                            ->orWhere('sku', 'like', "%{$value}%");
                              });
                })
                ->orWhere('sale_date', 'like', "%{$value}%");
        });
    }

    public function getLogDescription(string $action): string
    {
        return match ($action) {
            'CREATED' => "Venta creada: Folio {$this->folio} para vendedor ID {$this->seller_id}",
            'UPDATED' => "Venta actualizada: Folio {$this->folio} → estado {$this->status}",
            'DELETED' => "Venta eliminada: Folio {$this->folio}",
            default   => "Acción {$action} en venta {$this->folio}",
        };
    }
}
