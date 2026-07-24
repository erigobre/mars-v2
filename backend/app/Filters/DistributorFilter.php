<?php

namespace App\Filters;

use App\Filters\ApiFilter;

class DistributorFilter extends ApiFilter
{

    protected $safeParams = [
        'username' => ['eq', 'like'],
        'phone' => ['eq', 'like'],
        'email' => ['eq', 'like'],
        'companyName' => ['eq', 'like'],
        'isActive'=> ['eq'],
        'createdAt' => ['eq', 'lt', 'gt'],
    ];

    protected $columnMap = [
        'isActive' => 'is_active',
        'createdAt' => 'created_at',
        'updatedAt' => 'updated_at',
    ];

    protected $operatorMap = [
        'eq' => '=',
        'lt' => '<',
        'gt' => '>',
        'like' => 'like',
        'neq' => '!=',
        'in' => 'in',
        'notIn' => 'notIn',
    ];
}
