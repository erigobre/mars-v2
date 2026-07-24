<?php

namespace App\Filters;

use App\Filters\ApiFilter;

class ProductFilter extends ApiFilter
{

    protected $safeParams = [
        'name' => ['eq', 'like'],
        'price' => ['eq', 'like'],
        'sku' => ['eq', 'like'],
        'upc' => ['eq', 'like'],
        'category' => ['eq', 'like'],
        'phone' => ['eq', 'like'],
        'employeeCode' => ['eq', 'like'],
        'isActive'=> ['eq'],
        'createdAt' => ['eq', 'lt', 'gt'],
    ];

    protected $columnMap = [
        'isActive' => 'is_active',
        'createdAt' => 'created_at',
        'updatedAt' => 'updated_at',
        'price' => 'default_price',
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
