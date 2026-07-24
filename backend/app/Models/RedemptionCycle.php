<?php

namespace App\Models;

use App\Models\Campaign;
use App\Models\RedemptionCycleRanking;
use App\Models\RedemptionWindow;
use App\Models\RewardClaim;
use App\Traits\LogsActivity;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RedemptionCycle extends Model
{
    use LogsActivity;

    protected $fillable = [
        'campaign_id',
        'name',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date'   => 'datetime',
            'is_active'  => 'boolean',
        ];
    }

    // ------------------------ RELATIONS ---------------------------

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function windows(): HasMany
    {
        return $this->hasMany(RedemptionWindow::class, 'cycle_id');
    }

    public function claims(): HasMany
    {
        return $this->hasMany(RewardClaim::class);
    }

    public function rankings(): HasMany
    {
        return $this->hasMany(RedemptionCycleRanking::class);
    }


    // ------------------------ SCOPES ---------------------------

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Ciclo vigente en este momento (not necessarily "is_active" flag,
     * sino que NOW() cae dentro del rango de fechas).
     */
    public function scopeCurrent($query)
    {
        $now = now();
        return $query
            ->where('is_active', true)
            ->where('start_date', '<=', $now)
            ->where('end_date', '>=', $now);
    }

    // ------------------------ HELPERS ---------------------------

    public function hasOpenWindow(): bool
    {
        $now = now();
        return $this->windows()
            ->where('opens_at', '<=', $now)
            ->where('closes_at', '>=', $now)
            ->exists();
    }

    public function calculateProportionalGoal(float $monthlyAverage): float
    {
        $startDate = Carbon::parse($this->start_date);
        $endDate = Carbon::parse($this->end_date);

        $daysInMonth = $startDate->daysInMonth;
        $cycleDays = $startDate->diffInDays($endDate) + 1;

        return round(($monthlyAverage / $daysInMonth) * $cycleDays, 2);
    }

    public function getLogDescription(string $action): string
    {
        return match ($action) {
            'created' => "Ciclo de redención '{$this->name}' creado para campaña '{$this->campaign->name}'",
            'updated' => "Ciclo de redención '{$this->name}' actualizado para campaña '{$this->campaign->name}'",
            'deleted' => "Ciclo de redención '{$this->name}' eliminado de campaña '{$this->campaign->name}'",
            default => "Ciclo de redención '{$this->name}' ha sido {$action} en campaña '{$this->campaign->name}'",
        };
    }
}
