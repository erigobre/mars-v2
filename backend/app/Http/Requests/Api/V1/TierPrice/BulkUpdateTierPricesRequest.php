<?php

namespace App\Http\Requests\Api\V1\TierPrice;

use App\Enums\BaseCost;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkUpdateTierPricesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rules'                  => 'required|array|min:1',
            'rules.*.base_cost'      => ['required', 'integer', Rule::in(BaseCost::values())],
            'rules.*.tier_id'        => 'required|integer|exists:seller_tiers,id',
            'rules.*.price_in_points' => 'required|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'rules.required'                     => 'Debe enviar al menos una regla de precios.',
            'rules.*.base_cost.required'         => 'La categoría de costo es requerida.',
            'rules.*.base_cost.in'               => 'La categoría de costo debe ser: 1500, 3000 o 6000.',
            'rules.*.tier_id.required'           => 'El rango es requerido.',
            'rules.*.tier_id.exists'             => 'El rango seleccionado no existe.',
            'rules.*.price_in_points.required'   => 'El precio en puntos es requerido.',
            'rules.*.price_in_points.min'        => 'El precio en puntos no puede ser negativo.',
        ];
    }
}
