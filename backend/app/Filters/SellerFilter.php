<?php

namespace App\Filters;

use App\Filters\ApiFilter;

class SellerFilter extends ApiFilter
{

    protected $safeParams = [
        'username' => ['eq', 'like'],
        'email' => ['eq', 'like'],
        'phone' => ['eq', 'like'],
        'employeeCode' => ['eq', 'like'],
        'createdAt' => ['eq', 'lt', 'gt'],
    ];

    protected $columnMap = [
        'isActive' => 'is_active',
        'createdAt' => 'created_at',
        'updatedAt' => 'updated_at',
        'employeeCode' => 'employee_code'
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
