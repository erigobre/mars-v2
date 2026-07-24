<?php

namespace App\Models;

use App\Enums\GoalType;
use App\Models\Display;
use App\Models\Product;
use App\Models\RedemptionCycle;
use App\Models\SellerGoalProgress;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Goal extends Model
{
    use LogsActivity, SoftDeletes;

    protected $fillable = [
        'cycle_id',
        'name',
        'description',
        'type',
        'target_value',
        'reward_points',
        'is_active',
        'product_id',
        'display_id',
    ];

    protected function casts(): array
    {
        return [
            'type'         => GoalType::class,
            'target_value' => 'decimal:4',
            'reward_points' => 'integer',
            'is_active'    => 'boolean',
        ];
    }


    public function cycle(): BelongsTo
    {
        return $this->belongsTo(RedemptionCycle::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function display(): BelongsTo
    {
        return $this->belongsTo(Display::class);
    }

    public function progresses(): HasMany
    {
        return $this->hasMany(SellerGoalProgress::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForCycle($query, int $cycleId)
    {
        return $query->where('cycle_id', $cycleId);
    }

    public function getRepresentationImage(): ?string
    {
        return match ($this->type) {
            GoalType::SPECIFIC_PRODUCT_QTY => $this->product?->imageUrl(),
            GoalType::TOTAL_DISPLAY_QTY    => asset('images/display-goal.png'), // O $this->display?->imageUrl() si añades HasImage a Display
            GoalType::TOTAL_SALES_AMOUNT   => asset('images/sales-amount-goal.png'),
            default => null,
        };
    }

    /**
     * Progreso de un seller específico en esta meta.
     */
    public function progressFor(int $sellerId): ?SellerGoalProgress
    {
        return $this->progresses()->where('seller_id', $sellerId)->first();
    }

    public function getLogDescription(string $action): string
    {
        return match ($action) {
            'CREATED' => "Meta creada: '{$this->name}' (ciclo ID {$this->cycle_id})",
            'UPDATED' => "Meta actualizada: '{$this->name}'",
            'DELETED' => "Meta eliminada: '{$this->name}'",
            default   => "Acción {$action} en meta: '{$this->name}'",
        };
    }
}
