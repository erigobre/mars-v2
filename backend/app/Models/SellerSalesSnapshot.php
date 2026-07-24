<?php

namespace App\Models;

use App\Models\Campaign;
use App\Models\RedemptionCycle;
use App\Models\Seller;
use Illuminate\Database\Eloquent\Model;

class SellerSalesSnapshot extends Model
{
    protected $fillable = [
        'seller_id',
        'campaign_id',
        'redemption_cycle_id',
        'target_average',
        'total_units_sold',
    ];

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }
    public function campaign()
    {
        return $this->belongsTo(Campaign::class)->withTrashed();
    }
    public function redemptionCycle()
    {
        return $this->belongsTo(RedemptionCycle::class);
    }
}
