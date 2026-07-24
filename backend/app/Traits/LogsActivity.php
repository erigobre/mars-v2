<?php

namespace App\Traits;


trait LogsActivity
{
    public static function bootLogsActivity()
    {
        static::created(function ($model) {
            $model->recordActivity('CREATED');
        });

        static::updated(function ($model) {
            $model->recordActivity('UPDATED');
        });

        static::deleted(function ($model) {
            $model->recordActivity('DELETED');
        });
        
        if (method_exists(static::class, 'restored')) {
            static::restored(function ($model) {
                $model->recordActivity('RESTORED');
            });
        }
    }

    protected function recordActivity(string $action)
    {
        $oldValues = null;
        $newValues = null;

        if ($action === 'UPDATED') {
            $newValues = $this->getChanges(); 
            $oldValues = array_intersect_key($this->getOriginal(), $newValues);
            
            // Evitar logs si solo cambió el 'updated_at'
            if (count($newValues) === 1 && isset($newValues['updated_at'])) {
                return;
            }
        } elseif ($action === 'CREATED') {
            $newValues = $this->getAttributes();
        }

        // Revisar si el modelo tiene una descripción personalizada
        $description = method_exists($this, 'getLogDescription') 
            ? $this->getLogDescription($action) 
            : null; // Si es null, el Helper armará el resumen automático

        log_action($action, $this, $description, $oldValues, $newValues);
    }
}