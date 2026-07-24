<?php

namespace App\Http\Requests\Api\V1\SellerTier;

use App\Http\Requests\CamelCaseRequest;

class UpdateSellerTierRequest extends CamelCaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $sellerTier = $this->route('seller_tier') ?? $this->route('sellerTier');

        $rules = [
            'name' => 'string|max:100',
            'distributor_id' => 'nullable|exists:distributors,id',
            'slug' => 'string|max:50|unique:seller_tiers,slug,' . $sellerTier?->id,
            'min_average_sales' => 'numeric|min:0',
            'max_average_sales' => 'nullable|numeric|gt:min_average_sales',
            'order' => 'integer',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ];

        $hasDistributor = $this->has('distributorId') || $this->has('distributor_id');
        $incomingDistributorId = $this->input('distributorId', $this->input('distributor_id'));

        if($hasDistributor && $incomingDistributorId == $sellerTier?->id) {
            unset($rules['distributor_id']);
        }
        return $rules;
    }

    public function prepareForValidation(): void
    {
        parent::prepareForValidation();
    }

    public function messages()
    {
        return [
            'string' => 'El campo :attribute debe ser una cadena de texto.',
            'required' => 'El campo :attribute es obligatorio.',
            'max' => 'El campo :attribute no debe exceder :max caracteres.',
            'numeric' => 'El campo :attribute debe ser un número.',
            'min' => 'El campo :attribute debe ser al menos :min.',
            'gt' => 'El campo :attribute debe ser mayor que :value.',
            'unique' => 'El campo :attribute ya existe.',
            'regex' => 'El campo :attribute debe ser un código de color hexadecimal válido.'
        ];
    }

    public function attributes()
    {
        return [
            'name' => 'nombre',
            'slug' => 'slug',
            'min_average_sales' => 'promedio mínimo de ventas',
            'max_average_sales' => 'promedio máximo de ventas',
            'order' => 'orden',
            'color' => 'color',
            'icon' => 'ícono'
        ];
    }
}
