<?php

namespace App\Models;

use App\Models\Campaign;
use App\Models\Seller;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CampaignRanking extends Model
{
    use SoftDeletes, LogsActivity;

    protected $fillable = [
        'campaign_id',
        'seller_id',
        'points_earned',
        'rank_position',
        'final_rank',
    ];

    protected function casts(): array
    {
        return [
            'points_earned' => 'integer',
            'rank_position' => 'integer',
            'final_rank'    => 'integer',
        ];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }
}
