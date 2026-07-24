<?php

namespace App\Traits;

use App\Filters\ApiFilter;
use Illuminate\Database\Eloquent\Builder;

trait Filterable
{
    /**
     * Scope para aplicar filtros dinámicos desde un ApiFilter.
     */
    public function scopeFilter(Builder $query, ApiFilter $filter): Builder
    {
        // Obtenemos los elementos transformados de la request actual
        $filterItems = $filter->transform(request());

        foreach ($filterItems as $item) {
            $column = $item['column'];
            $method = $item['method'];

            // Ejecutamos dinámicamente: where, whereIn, etc.
            if ($method === 'whereIn') {
                $query->whereIn($column, $item['values']);
            } else {
                $query->where($column, $item['operator'], $item['value']);
            }
        }

        return $query;
    }
}
