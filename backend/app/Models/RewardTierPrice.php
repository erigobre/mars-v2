<?php

namespace App\Models;

use App\Models\Reward;
use App\Models\SellerTier;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardTierPrice extends Model
{
    protected $fillable = [
        'reward_id',
        'seller_tier_id',
        'price_in_points',
    ];

    protected $casts = [
        'price_in_points' => 'integer',
    ];

    public function reward(): BelongsTo
    {
        return $this->belongsTo(Reward::class);
    }

    public function sellerTier(): BelongsTo
    {
        return $this->belongsTo(SellerTier::class);
    }
}
