<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProcessedSalesFile extends Model
{
    protected $fillable = [
        'batch_uuid',
        'file_hash',
        'original_file_name',
        'distributor_id',
        'created_by_id',
    ];

    public function distributor()
    {
        return $this->belongsTo(Distributor::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }
}
