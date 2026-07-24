<?php

use App\Models\ActivityLog;
use App\Models\User;

if (!function_exists('log_action')) {
    /**
     * Registra una acción en el sistema de auditoría.
     * * @param string $action Acción realizada (ej: 'LOGIN', 'CREATED', 'UPDATED')
     * @param mixed $entity El modelo afectado (opcional)
     * @param string|null $summary Resumen personalizado (opcional)
     * @param array|null $oldValues Valores antes del cambio (opcional)
     * @param array|null $newValues Valores nuevos (opcional)
     */
    function log_action(string $action, $entity = null, ?string $summary = null, ?array $oldValues = null, ?array $newValues = null): void
    {
        $userId = auth()->id();

        if (!$userId && $entity instanceof User) {
            $userId = $entity->id;
        }

        if (!$summary && $entity) {
            $entityClass = class_basename($entity);
            $summary = ucfirst(strtolower($action)) . " {$entityClass}";
            
            // Agregar información identificadora
            if (isset($entity->id)) $summary .= " ID {$entity->id}";
            if (isset($entity->email)) $summary .= " ({$entity->email})";
            if (isset($entity->name)) $summary .= " ({$entity->name})";
            if (isset($entity->title)) $summary .= " ({$entity->title})";
        }

        // Insertar en la tabla activity_logs
        ActivityLog::create([
            'user_id'     => $userId,
            'action_type' => strtoupper($action),
            'model_type'  => $entity ? class_basename($entity) : null,
            'model_id'    => $entity?->id,
            'description' => $summary ?? ucfirst(strtolower($action)),
            'old_values'  => $oldValues,
            'new_values'  => $newValues,
            'ip_address'  => request()->ip(),
            'user_agent'  => request()->userAgent(),
        ]);
    }
}