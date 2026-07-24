<?php

namespace App\Filters;

use Illuminate\Http\Request;

class ApiFilter
{

    protected $safeParams = [];
    protected $columnMap = [];
    protected $operatorMap = [];

    public function transform(Request $request): array
    {
        $eloQuery = [];

        foreach ($this->safeParams as $param => $operators) {
            $query = $request->query($param);

            if (!isset($query)) {
                continue;
            }

            $column = $this->columnMap[$param] ?? $param;

            foreach ($operators as $operator) {
                if (isset($query[$operator])) {
                    $value = $query[$operator];
                    if ($operator === 'in' || is_array($value)) {
                        $values = is_array($value) ? $value : explode(',', $value);

                        $eloQuery[] = [
                            'method' => 'whereIn',
                            'column' => $column,
                            'values' => $values
                        ];
                    } else {
                        $eloQuery[] = [
                            'method'   => 'where',
                            'column'   => $column,
                            'operator' => $this->operatorMap[$operator],
                            'value'    => $value
                        ];
                    }
                }
            }
        }

        return $eloQuery;
    }
}
