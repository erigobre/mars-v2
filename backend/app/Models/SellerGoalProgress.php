<?php

namespace App\Models;

use App\Models\Goal;
use App\Models\Seller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellerGoalProgress extends Model
{
    protected $table = 'seller_goal_progress';

    protected $fillable = [
        'goal_id',
        'seller_id',
        'current_value',
        'reached',
        'bonus_awarded',
        'reached_at',
    ];

    protected function casts(): array
    {
        return [
            'current_value' => 'decimal:4',
            'reached'       => 'boolean',
            'bonus_awarded' => 'boolean',
            'reached_at'    => 'datetime',
        ];
    }

    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class)->withTrashed();
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }


    /**
     * Porcentaje de avance calculado SIEMPRE contra el target_value vigente de la meta.
     * Si la meta se edita (sube o baja el target), el % refleja el valor actualizado.
     */
    public function percentage(): float
    {
        $target = (float) $this->goal->target_value;

        if ($target === 0.0) return 100.0;

        return min(round((float) $this->current_value / $target * 100, 1), 100.0);
    }

    /**
     * ¿El vendedor ha alcanzado la meta con el target VIGENTE?
     * Útil para re-evaluar si el admin bajó el target.
     */
    public function isCurrentlyReached(): bool
    {
        return (float) $this->current_value >= (float) $this->goal->target_value;
    }
}
