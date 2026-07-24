<?php

namespace App\Models;

use App\Enums\PointTransactionTypes;
use App\Models\Sale;
use App\Models\Seller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointTransaction extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'seller_id',
        'amount',
        'type',
        'balance_after',
        'sale_id',
    ];

    protected function casts(): array
    {
        return [
            'amount'       => 'integer',
            'balance_after' => 'integer',
            'type'      => PointTransactionTypes::class,
        ];
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function scopeRanking($query, Campaign $campaign)
    {
        return $query->selectRaw('
            sellers.id as seller_id,
            users.username as seller_name,
            sellers.employee_code,
            distributors.id as distributor_id,
            distributors.company_name as distributor_name,
            SUM(point_transactions.amount) as total_points
        ')
            ->join('sellers', 'sellers.id', '=', 'point_transactions.seller_id')
            ->join('users', 'users.id', '=', 'sellers.user_id')
            ->join('distributors', 'distributors.id', '=', 'sellers.distributor_id')
            ->join('sales', 'sales.id', '=', 'point_transactions.sale_id')
            ->where('point_transactions.type', 'sale_earned')
            ->whereBetween('sales.sale_date', [$campaign->start_date, $campaign->end_date])
            ->whereNull('sellers.deleted_at')
            ->groupBy('sellers.id', 'users.username', 'sellers.employee_code', 'distributors.id', 'distributors.company_name');
    }
}
