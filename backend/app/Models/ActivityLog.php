<?php

namespace App\Models;

use App\Models\User;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use Filterable;

    public const UPDATED_AT = null;

    protected $fillable = [
        'user_id', 'action_type', 'model_type', 'model_id',
        'description', 'old_values', 'new_values',
        'ip_address', 'user_agent'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
