<?php

namespace App\Traits;

/**
 * Convierte automáticamente las claves de snake_case a camelCase
 * en todos los Resources que usen este trait.
 *
 * Uso: añade `use TransformsCamelCase;` en el Resource y llama a
 *      `return $this->camel($data);` al final de toArray().
 */
trait TransformsCamelCase
{
    /**
     * Convierte un array con claves snake_case a camelCase recursivamente.
     */
    protected function camel(array $data): array
    {
        $result = [];

        foreach ($data as $key => $value) {
            $camelKey = lcfirst(str_replace('_', '', ucwords((string) $key, '_')));

            if (is_array($value)) {
                $result[$camelKey] = $this->camel($value);
            } else {
                $result[$camelKey] = $value;
            }
        }

        return $result;
    }
}