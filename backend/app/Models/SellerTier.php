<?php

namespace App\Models;

use App\Models\Distributor;
use App\Models\Reward;
use App\Models\RewardTierPrice;
use App\Models\Seller;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SellerTier extends Model
{
    use LogsActivity;

    protected $fillable = [
        'distributor_id',
        'name',
        'slug',
        'min_average_sales',
        'max_average_sales',
        'order',
        'color',
        'icon',
        'is_active',
    ];

    protected $casts = [
        'min_average_sales' => 'decimal:2',
        'max_average_sales' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (SellerTier $tier) {
            // Si no se proporcionó un orden (es null), calculamos el siguiente disponible
            if (is_null($tier->order)) {
                $maxOrder = static::where('distributor_id', $tier->distributor_id)->max('order');
                $tier->order = $maxOrder !== null ? $maxOrder + 1 : 1;
            }
        });
    }

    public function distributor(): BelongsTo
    {
        return $this->belongsTo(Distributor::class);
    }

    public function sellers(): HasMany
    {
        return $this->hasMany(Seller::class);
    }

    public function rewardPrices(): HasMany
    {
        return $this->hasMany(RewardTierPrice::class);
    }

    public function rewards(): BelongsToMany
    {
        return $this->belongsToMany(Reward::class, 'reward_tier_prices')
            ->withPivot('price_in_points')
            ->withTimestamps();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeGlobal($query)
    {
        return $query->whereNull('distributor_id');
    }

    public function scopeForDistributor($query, $distributorId)
    {
        return $query->where('distributor_id', $distributorId);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('min_average_sales');
    }

    // Helpers
    public function isInRange(float $average): bool
    {
        if ($average < $this->min_average_sales) {
            return false;
        }

        if ($this->max_average_sales !== null && $average > $this->max_average_sales) {
            return false;
        }

        return true;
    }

    // public function getLogDescription($action)
    // {
    //     return match($action) {
    //         'CREATED' => "Se creó el {$tipo} con el nombre {$this->username} y el correo {$this->email}",
    //         'UPDATED' => "Se actualizaron los datos del {$tipo} ({$this->email})",
    //         'DELETED' => "Se eliminó el {$tipo} con el nombre {$this->username} y el correo {$this->email}",
    //         default   => "Acción sobre {$tipo}"
    //     };
    // }
}
