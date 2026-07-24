<?php

namespace App\Http\Requests\Api\V1\DistributorProduct;

use App\Http\Requests\CamelCaseRequest;

class CustomizeProductRequest extends CamelCaseRequest
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
        return [
            'product_id'        => 'required|exists:products,id',
            'custom_sku'        => 'nullable|string|max:100',
            'custom_price'      => 'nullable|numeric|min:0',
            'notes'             => 'nullable|string|max:1000',
        ];
    }

    public function prepareForValidation(): void
    {
        parent::prepareForValidation();
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'exists'   => 'El :attribute no existe.',
            'string'   => 'El :attribute debe ser texto.',
            'numeric'  => 'El :attribute debe ser un número.',
            'min'      => 'El :attribute debe ser ≥ :min.',
            'max'      => 'El :attribute no debe exceder :max caracteres.',
        ];
    }

    public function attributes(): array
    {
        return [
            'product_id'        => 'producto',
            'custom_sku'        => 'SKU personalizado',
            'custom_price'      => 'precio personalizado',
            'notes'             => 'notas',
        ];
    }
}
