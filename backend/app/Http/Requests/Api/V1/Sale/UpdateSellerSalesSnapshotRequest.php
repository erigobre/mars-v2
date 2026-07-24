<?php

namespace App\Http\Requests\Api\V1\Sale;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSellerSalesSnapshotRequest extends FormRequest
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
            'seller_id' => ['sometimes', 'exists:sellers,id'],
            'campaign_id' => ['sometimes', 'exists:campaigns,id'],
            'redemption_cycle_id' => ['nullable', 'exists:redemption_cycles,id'],
            'total_units_sold' => ['sometimes', 'numeric', 'min:0'],
        ];
    }

    public function messages()
    {
        return [
            'string' => 'El campo :attribute debe ser una cadena de texto.',
            'integer' => 'El campo :attribute debe ser un número entero.',
            'exists' => 'El :attribute seleccionado no es válido.',
            'numeric' => 'El campo :attribute debe ser un número.',
            'sometimes' => 'El campo :attribute es opcional.',
            'nullable' => 'El campo :attribute es opcional.',
            'min' => 'El campo :attribute debe ser mayor o igual a :min.',
            'max' => 'El campo :attribute no debe exceder los :max caracteres.',
            'array' => 'El campo :attribute debe ser un arreglo.',
            'required' => 'El campo :attribute es requerido.',
        ];
    }

    public function attributes()
    {
        return [
            'seller_id' => 'ID del vendedor',
            'campaign_id' => 'ID de la campaña',
            'redemption_cycle_id' => 'ID del ciclo de redención',
            'total_units_sold' => 'Total de unidades vendidas',
        ];
    }
}
