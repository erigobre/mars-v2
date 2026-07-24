<?php

namespace App\Http\Requests\Api\V1\SellerTier;

use App\Http\Requests\CamelCaseRequest;
use App\Models\SellerTier;
use Illuminate\Validation\Validator;

class StoreSellerTierRequest extends CamelCaseRequest
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
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:50|unique:seller_tiers,slug',
            'distributor_id' => 'nullable|exists:distributors,id',
            'min_average_sales' => 'required|numeric|min:0',
            'max_average_sales' => 'nullable|numeric|gt:min_average_sales',
            'order' => 'nullable|integer',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon' => 'nullable|string|max:50'
        ];
    }

    public function prepareForValidation(): void
    {
        parent::prepareForValidation();
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            if ($this->hasOverlap()) {
                $validator->errors()->add('min_average_sales', 'El rango de ventas se traslapa con un rango existente para este distribuidor o nivel global.');
            }
        });
    }

    protected function hasOverlap(): bool
    {
        $min = $this->input('min_average_sales');
        $max = $this->input('max_average_sales');
        $distributorId = $this->input('distributor_id');

        return SellerTier::where('distributor_id', $distributorId)
            ->where(function ($query) use ($min, $max) {
                $query->where(function ($q) use ($min) {
                    $q->where('min_average_sales', '<=', $min)
                      ->where('max_average_sales', '>', $min);
                })
                ->orWhere(function ($q) use ($max) {
                    if ($max) {
                        $q->where('min_average_sales', '<', $max)
                          ->where('max_average_sales', '>=', $max);
                    } else {
                        $q->whereNull('max_average_sales');
                    }
                });
            })
            ->exists();
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
