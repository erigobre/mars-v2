<?php

namespace App\Filters;

class RewardFilter extends ApiFilter {

    protected $safeParams = [
        'name' => ['eq', 'like'],
        'description' => ['eq', 'like'],
        'points' => ['eq', 'lt', 'gt', 'lte', 'gte'],
        'category' => ['eq', 'in'],
        'createdAt'=> ['eq', 'lt', 'gt'],
        'updatedAt'=> ['eq', 'lt', 'gt'],
    ];

    protected $columnMap = [
        'createdAt' => 'created_at',
        'updatedAt' => 'updated_at',
        'isActive' => 'is_active',
        'points'    => 'points_required',
        'baseCost'  => 'base_cost'
    ];

    protected $operatorMap = [
        'eq' => '=',
        'lt' => '<',
        'gt' => '>',
        'lte' => '<=',
        'gte' => '>=',
        'like' => 'like',
        'neq' => '!='
    ];
}