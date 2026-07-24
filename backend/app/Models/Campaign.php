<?php

namespace App\Models;

use App\Enums\CampaignStatus;
use App\Models\CampaignRanking;
use App\Models\RedemptionCycle;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Campaign extends Model
{
    use LogsActivity, SoftDeletes;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'is_active',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date'   => 'datetime',
            'is_active'  => 'boolean',
            'status'     => CampaignStatus::class,
        ];
    }

    // ------------------------ RELATIONS ---------------------------

    public function cycles(): HasMany
    {
        return $this->hasMany(RedemptionCycle::class);
    }

    public function rankings(): HasMany
    {
        return $this->hasMany(CampaignRanking::class);
    }

    // ------------------------ SCOPES ---------------------------

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Campaña vigente en este momento (not necessarily "is_active" flag,
     * sino que NOW() cae dentro del rango de fechas).
     */
    public function scopeCurrent($query)
    {
        $now = now();
        return $query
            ->where('is_active', true)
            ->where('status', CampaignStatus::RUNNING)
            ->where('start_date', '<=', $now)
            ->where('end_date', '>=', $now);
    }

    // ------------------------ HELPERS ---------------------------

    public function isRunning(): bool
    {
        $now = now();
        return $this->is_active
            && $this->status === CampaignStatus::RUNNING
            && $now->between($this->start_date, $this->end_date);
    }

    public function getLogDescription(string $action): string
    {
        return match($action) {
            'CREATED' => "Campaña creada: {$this->name}",
            'UPDATED' => "Campaña actualizada: {$this->name}",
            'DELETED' => "Campaña eliminada: {$this->name}",
            default   => "Acción {$action} en campaña: {$this->name}",
        };
    }
}
