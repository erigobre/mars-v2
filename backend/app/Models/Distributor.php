<?php

namespace App\Models;

use App\Enums\CredentialType;
use App\Enums\IdentifierType;
use App\Models\DistributorProduct;
use App\Models\Seller;
use App\Models\SellerTier;
use App\Models\User;
use App\Traits\Filterable;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Distributor extends Model
{
    use SoftDeletes, LogsActivity, Filterable;

    protected $fillable = [
        'user_id',
        'company_name',
        'growth_percentage',
        'points_calculation_strategy',
        'average_evaluation_scope',
        'is_active',
        'identifier_type',
        'credential_type',
    ];

    protected function casts(): array
    {
        return [
            'growth_percentage' => 'decimal:2',
            'identifier_type' => IdentifierType::class,
            'credential_type' => CredentialType::class,
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tiers()
    {
        return $this->hasMany(SellerTier::class);
    }

    public function sellers()
    {
        return $this->hasMany(Seller::class);
    }

    public function distributorProducts(): HasMany
    {
        return $this->hasMany(DistributorProduct::class);
    }

    public function scopeGlobalSearch($query, $value)
    {
        return $query->where(function ($q) use ($value) {
            $q->where('company_name', 'like', "%{$value}%")
                ->orWhereHas('user', function ($subQuery) use ($value) {
                    $subQuery->where('username', 'like', "%{$value}%")
                        ->orWhere('email', 'like', "%{$value}%")
                        ->orWhere('phone', 'like', "%{$value}%");
                });
        });
    }

    public function customProducts()
    {
        return $this->distributorProducts()->with('product');
    }

    public function getLogDescription(string $action): string
    {
        return match ($action) {
            'CREATED' => "Distribuidor registrado: {$this->company_name} con el correo electrónico {$this->user->email}",
            'UPDATED' => "Distribuidor actualizado: {$this->company_name} con el correo electrónico {$this->user->email}",
            'DELETED' => "Distribuidor eliminado: {$this->company_name} con el correo electrónico {$this->user->email}",
            default   => "Acción {$action} en distribuidor: {$this->company_name}",
        };
    }
}
