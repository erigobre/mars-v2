<?php

namespace App\Models;

use App\Models\Distributor;
use App\Models\PointTransaction;
use App\Models\RewardClaim;
use App\Models\Sale;
use App\Models\SellerGoalProgress;
use App\Models\SellerSalesSnapshot;
use App\Models\SellerTier;
use App\Models\User;
use App\Traits\Filterable;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Seller extends Model
{
    use SoftDeletes, LogsActivity, HasFactory, Filterable;

    protected $fillable = [
        'user_id',
        'distributor_id',
        'employee_code',
        'current_points',
        'terms_accepted',

        'address_street',
        'address_colonia',
        'address_city',
        'address_state',
        'address_zip',
        'shipping_notes',

        'seller_tier_id',

        'average_monthly_sales',
    ];

    protected function casts(): array
    {
        return [
            'user_id'        => 'integer',
            'distributor_id' => 'integer',
            'terms_accepted' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withTrashed();
    }

    public function distributor(): BelongsTo
    {
        return $this->belongsTo(Distributor::class);
    }

    public function claims(): HasMany
    {
        return $this->hasMany(RewardClaim::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function pointTransactions(): HasMany
    {
        return $this->hasMany(PointTransaction::class);
    }

    public function goalProgresses(): HasMany
    {
        return $this->hasMany(SellerGoalProgress::class);
    }

    public function tier(): BelongsTo
    {
        return $this->belongsTo(SellerTier::class, 'seller_tier_id');
    }

    public function salesSnapshots(): HasMany
    {
        return $this->hasMany(SellerSalesSnapshot::class);
    }

    public function equivalences(): HasMany
    {
        return $this->hasMany(SellerEquivalence::class);
    }

    public function hasShippingAddress(): bool
    {
        return !empty($this->address_street)
            && !empty($this->address_city)
            && !empty($this->address_state)
            && !empty($this->address_zip);
    }

    public function getFormattedAddress(): array
    {
        return [
            'shippingName'    => $this->user->name,
            'shippingStreet'  => $this->address_street,
            'shippingColonia' => $this->address_colonia,
            'shippingCity'    => $this->address_city,
            'shippingState'   => $this->address_state,
            'shippingZip'     => $this->address_zip,
            'shippingNotes'   => $this->shipping_notes,
        ];
    }

    public function scopeGlobalSearch($query, $value)
    {
        return $query->where(function ($q) use ($value) {
            $q->where('employee_code', 'like', "%{$value}%")
                ->orWhereHas('user', function ($subQuery) use ($value) {
                    $subQuery->where('username', 'like', "%{$value}%")
                        ->orWhere('email', 'like', "%{$value}%")
                        ->orWhere('phone', 'like', "%{$value}%");
                });
        });
    }

    public function getLogDescription(string $action): string
    {
        if ($action === 'UPDATED' && $this->wasChanged('average_monthly_sales')) {
            $oldMeta = $this->getOriginal('average_monthly_sales');
            $newMeta = $this->average_monthly_sales;

            return "Meta de ventas actualizada para el vendedor {$this->user->username}. Anterior: {$oldMeta} -> Nueva: {$newMeta}";
        }

        return match ($action) {
            'CREATED' => "Vendedor registrado: {$this->user->username} y el código de empleado {$this->employee_code}",
            'UPDATED' => "Vendedor actualizado: {$this->user->username} y el código de empleado {$this->employee_code}",
            'DELETED' => "Vendedor eliminado: {$this->user->username} y el código de empleado {$this->employee_code}",
            default   => "Acción {$action} en vendedor: {$this->user->username} y el código de empleado {$this->employee_code}",
        };
    }
}
