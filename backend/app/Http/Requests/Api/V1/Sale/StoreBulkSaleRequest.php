<?php

namespace App\Http\Requests\Api\V1\Sale;

use App\Http\Requests\CamelCaseRequest;

class StoreBulkSaleRequest extends CamelCaseRequest
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
        $isAdmin = $this->user()?->role?->slug === 'admin';

        return [
            'distributor_id' => $isAdmin
                ? 'required|integer|exists:distributors,id'
                : 'sometimes',

            'sales' => 'required|array|min:1|max:100',
            'sales.*.seller_id' => 'required|integer|exists:sellers,id',
            'sales.*.sale_date' => 'required|date',
            'sales.*.notes' => 'nullable|string|max:1000',
            'sales.*.items' => 'required|array|min:1',
            'sales.*.items.*.product_id' => 'required|integer|exists:products,id',
            'sales.*.items.*.quantity' => 'required|numeric|min:0.01',
            'sales.*.items.*.amount' => 'required|numeric|min:0',
        ];
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
    }

    public function messages()
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'integer'  => 'El campo :attribute debe ser un número entero.',
            'exists'   => 'El :attribute seleccionado no es válido.',
            'date'     => 'El campo :attribute debe ser una fecha válida.',
            'string'   => 'El campo :attribute debe ser una cadena de texto.',
            'max'      => 'El campo :attribute no debe exceder los :max caracteres.',
            'array'    => 'El campo :attribute debe ser un arreglo.',
            'min'      => 'El campo :attribute debe tener al menos :min.',
            'numeric'  => 'El campo :attribute debe ser un valor numérico.',
            'sometimes' => 'El campo :attribute es opcional.',
            'nullable' => 'El campo :attribute es opcional.',
        ];
    }

    public function attributes()
    {
        return [
            'distributor_id' => 'distribuidor',
            'sales'          => 'ventas',
            'sales.*.seller_id'  => 'vendedor',
            'sales.*.sale_date'  => 'fecha de venta',
            'sales.*.notes'      => 'notas',
            'sales.*.items'      => 'líneas de venta',
            'sales.*.items.*.product_id' => 'producto',
            'sales.*.items.*.quantity'   => 'cantidad',
            'sales.*.items.*.amount'     => 'monto',
        ];
    }
}
