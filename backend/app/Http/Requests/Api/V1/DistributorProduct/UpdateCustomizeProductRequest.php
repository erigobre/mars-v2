<?php

namespace App\Http\Requests\Api\V1\DistributorProduct;

use App\Http\Requests\CamelCaseRequest;

class UpdateCustomizeProductRequest extends CamelCaseRequest
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
            'custom_sku' => 'nullable|string|max:100',
            'custom_price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function prepareForValidation(): void
    {
        parent::prepareForValidation();
    }

    public function messages()
    {
        return [
            'string' => 'El campo :attribute debe ser una cadena de texto.',
            'max' => 'El campo :attribute debe tener un máximo de :max caracteres.',
            'numeric' => 'El campo :attribute debe ser un número.',
            'min' => 'El campo :attribute debe ser mayor o igual a :min.',
            'required' => 'El campo :attribute es obligatorio.',
            'exists' => 'El campo :attribute no existe.',
        ];
    }

    public function attributes()
    {
        return [
            'custom_sku' => 'Custom SKU',
            'custom_price' => 'Custom Price',
            'notes' => 'Notes',
        ];
    }
}
