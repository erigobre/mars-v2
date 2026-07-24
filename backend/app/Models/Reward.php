<?php

namespace App\Models;

use App\Enums\BaseCost;
use App\Models\RewardClaim;
use App\Models\RewardTierPrice;
use App\Models\SellerTier;
use App\Models\TierPricingRule;
use App\Traits\Filterable;
use App\Traits\HasImage;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reward extends Model
{
    use HasFactory, SoftDeletes, LogsActivity, HasImage, Filterable;

    protected string $imageContext = 'reward';
    protected string $imageColumn  = 'image_url';

    protected $fillable = [
        'name',
        'description',
        'category',
        'visibility',
        'points_required',
        'base_cost',
        'stock',
        'image_url',
        'is_active',
        'is_featured',
        'max_global_claims',
        'total_claimed'
    ];

    protected function casts(): array
    {
        return [
            'points_required'   => 'integer',
            'base_cost'         => BaseCost::class,
            'stock'             => 'integer',
            'is_active'         => 'boolean',
            'is_featured'       => 'boolean',
            'max_global_claims' => 'integer',
            'total_claimed'     => 'integer',
        ];
    }

    public function claims(): HasMany
    {
        return $this->hasMany(RewardClaim::class);
    }

    public function tierPrices(): HasMany
    {
        return $this->hasMany(RewardTierPrice::class);
    }

    public function tiers(): BelongsToMany
    {
        return $this->belongsToMany(SellerTier::class, 'reward_tier_prices')
            ->withPivot('price_in_points')
            ->withTimestamps();
    }

    // public function scopeActive($query)
    // {
    //     return $query->where('is_active', true)->where('stock', '>', 0);
    // }

    public function scopeVisibleNow($query)
    {
        return $query->where('visibility', 'always');
    }

    public function scopeVisibleAtCampaignEnd($query)
    {
        return $query->whereIn('visibility', ['always', 'campaign_end']);
    }

    public function hasStock(): bool
    {
        return $this->stock > 0;
    }

    public function hasGlobalStock(): bool
    {
        if ($this->max_global_claims === null) return true; // sin límite global
        return $this->total_claimed < $this->max_global_claims;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('stock', '>', 0)
            ->where(function ($q) {
                $q->whereNull('max_global_claims')
                    ->orWhereColumn('total_claimed', '<', 'max_global_claims');
            });
    }

    /**
     * Precio efectivo para un vendedor — 3 niveles de prioridad:
     * 1. Override individual en reward_tier_prices (excepción por premio)
     * 2. Regla de matriz en tier_pricing_rules (base_cost × tier) — NUEVO en v2
     * 3. Fallback a rewards.points_required
     */
    public function getPriceForSeller(Seller $seller): int
    {
        if (!$seller->seller_tier_id) {
            return $this->points_required;
        }

        // 1. Override individual
        if ($this->relationLoaded('tierPrices')) {
            $override = $this->tierPrices->firstWhere('seller_tier_id', $seller->seller_tier_id);
        } else {
            $override = $this->tierPrices()
                ->where('seller_tier_id', $seller->seller_tier_id)
                ->first();
        }

        if ($override !== null) {
            return $override->price_in_points;
        }

        // 2. Regla de matriz por base_cost
        if ($this->base_cost) {
            $matrixPrice = TierPricingRule::where('seller_tier_id', $seller->seller_tier_id)
                ->where('base_cost', $this->base_cost->value)
                ->value('price_in_points');

            if ($matrixPrice !== null) {
                return $matrixPrice;
            }
        }

        // 3. Fallback
        return $this->points_required;
    }


    public function getLogDescription(string $action): string
    {
        return match ($action) {
            'CREATED' => "Premio creado: {$this->name} ({$this->points_required} pts)",
            'UPDATED' => "Premio actualizado: {$this->name}",
            'DELETED' => "Premio eliminado: {$this->name}",
            default   => "Acción {$action} en premio: {$this->name}",
        };
    }
}
