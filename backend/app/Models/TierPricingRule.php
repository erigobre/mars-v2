<?php

namespace App\Models;

use App\Enums\BaseCost;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TierPricingRule extends Model
{
    protected $fillable = [
        'seller_tier_id',
        'base_cost',
        'price_in_points',
    ];

    protected $casts = [
        'base_cost'      => BaseCost::class,
        'price_in_points'=> 'integer',
    ];

    public function sellerTier(): BelongsTo
    {
        return $this->belongsTo(SellerTier::class);
    }
}
