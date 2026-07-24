<?php

namespace App\Models;

use App\Models\RedemptionCycle;
use App\Models\Seller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RedemptionCycleRanking extends Model
{
    protected $fillable = [
        'redemption_cycle_id',
        'seller_id',
        'points_earned',
        'rank_position',
    ];

    public function cycle(): BelongsTo
    {
        return $this->belongsTo(RedemptionCycle::class, 'redemption_cycle_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }
}
