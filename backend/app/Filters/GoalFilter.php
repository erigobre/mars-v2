<?php

namespace App\Filters;

use App\Filters\ApiFilter;

class GoalFilter extends ApiFilter
{

    protected $safeParams = [
        'cycleId' => ['eq'],
        'isActive'=> ['eq'],
        'type' => ['eq'],
        'createdAt' => ['eq', 'lt', 'gt'],
    ];

    protected $columnMap = [
        'cycleId' => 'redemption_cycle_id',
        'createdAt' => 'created_at',
        'updatedAt' => 'updated_at',
        'isActive' => 'is_active',
    ];

    protected $operatorMap = [
        'eq' => '=',
        'lt' => '<',
        'gt' => '>',
    ];
}
