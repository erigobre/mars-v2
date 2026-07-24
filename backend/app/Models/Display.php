<?php

namespace App\Models;

use App\Models\Product;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Display extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'name',
        'slug',
        'value_points',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'value_points' => 'decimal:2',
            'is_active'    => 'boolean',
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function scopeGlobalSearch($query, $value)
    {
        return $query->where('name', 'like', "%{$value}%")
                     ->orWhere('slug', 'like', "%{$value}%");
    }

    public function getLogDescription(string $action): string
    {
        return match ($action) {
            'CREATED' => "Display creado: {$this->name} ({$this->value_points} pts/unidad)",
            'UPDATED' => "Display actualizado: {$this->name}",
            'DELETED' => "Display eliminado: {$this->name}",
            default   => "Acción {$action} en display: {$this->name}",
        };
    }
}
