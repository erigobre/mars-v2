<?php

namespace App\Models;

use App\Enums\RewardClaimStatus;
use App\Models\RedemptionCycle;
use App\Models\Reward;
use App\Models\Seller;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardClaim extends Model
{
    use LogsActivity;

    protected $fillable = [
        'redemption_cycle_id',
        'seller_id',
        'reward_id',
        'folio',
        'points_spent',
        'status',
        'carrier',
        'tracking_number',
        'reserved_until',
        'shipping_name',
        'shipping_street',
        'shipping_colonia',
        'shipping_city',
        'shipping_state',
        'shipping_zip',
        'shipping_notes',
        'notes',
        'claimed_at',
    ];

    protected function casts(): array
    {
        return [
            'points_spent' => 'integer',
            'seller_id'    => 'integer',
            'status'       => RewardClaimStatus::class,
            'claimed_at'   => 'datetime',
            'reserved_until'   => 'datetime',
        ];
    }

    public function cycle(): BelongsTo
    {
        return $this->belongsTo(RedemptionCycle::class, 'redemption_cycle_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(Reward::class);
    }

    public function scopeWhereBlockingStatus(Builder $query): void
    {
        $statusesToCheck = array_filter(RewardClaimStatus::cases(), fn($s) => $s->blocksNewClaim()); // Obtenemos los estados que bloquean un nuevo canje
        $statusesToCheckValues = array_map(fn($s) => $s->value, $statusesToCheck); // Solo los valores para la consulta

        $query->whereIn('status', $statusesToCheckValues);
    }

    public function getLogDescription(string $action): string
    {
        return match($action) {
            'CREATED' => "Canje registrado: Folio {$this->folio} – vendedor ID {$this->seller_id}",
            'UPDATED' => "Canje actualizado: Folio {$this->folio} → {$this->status->label()}",
            default   => "Acción {$action} en canje {$this->folio}",
        };
    }
}
