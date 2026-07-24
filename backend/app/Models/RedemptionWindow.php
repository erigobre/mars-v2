<?php

namespace App\Models;

use App\Models\RedemptionCycle;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RedemptionWindow extends Model
{
    protected $fillable = [
        'cycle_id',
        'opens_at',
        'closes_at',
    ];

    protected function casts(): array
    {
        return [
            'opens_at'  => 'datetime',
            'closes_at' => 'datetime',
        ];
    }

    // ------------------------ RELATIONS ---------------------------

    public function cycle(): BelongsTo
    {
        return $this->belongsTo(RedemptionCycle::class, 'cycle_id');
    }

    // ------------------------ SCOPES ---------------------------

    public function scopeOpen($query)
    {
        $now = now();
        return $query
            ->where('opens_at', '<=', $now)
            ->where('closes_at', '>=', $now);
    }

}
