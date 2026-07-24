<?php

namespace App\Filters;

use App\Filters\ApiFilter;

class ActivityLogFilter extends ApiFilter
{
    // Parámetros permitidos en la URL y sus operadores
    protected $safeParams = [
        'userId'     => ['eq', 'in'],
        'actionType' => ['eq', 'in', 'like'],
        'modelType'  => ['eq', 'in', 'like'],
        'modelId'    => ['eq', 'in', 'like'],
        'ipAddress'  => ['eq', 'like'],
        'createdAt'  => ['eq', 'gt', 'gte', 'lt', 'lte'],
    ];

    protected $columnMap = [
        'userId'     => 'user_id',
        'actionType' => 'action_type',
        'modelType'  => 'model_type',
        'modelId'    => 'model_id',
        'ipAddress'  => 'ip_address',
        'createdAt'  => 'created_at',
    ];

    protected $operatorMap = [
        'eq'   => '=',
        'lt'   => '<',
        'lte'  => '<=',
        'gt'   => '>',
        'gte'  => '>=',
        'in'   => 'in',
        'like' => 'like',
    ];
}
