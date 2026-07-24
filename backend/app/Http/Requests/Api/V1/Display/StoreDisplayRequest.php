<?php

namespace App\Http\Requests\Api\V1\Display;

use App\Http\Requests\CamelCaseRequest;

class StoreDisplayRequest extends CamelCaseRequest
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
            'name'         => 'required|string|max:255|unique:displays,name',
            'slug'         => 'required|string|max:255|unique:displays,slug',
            'value_points' => 'required|numeric|min:0',
            'is_active'    => 'boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        $this->merge(['is_active' => $this->boolean('is_active', true)]);
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'unique'   => 'Ya existe un display con ese :attribute.',
            'numeric'  => 'El campo :attribute debe ser un número.',
            'min'      => 'El campo :attribute debe ser ≥ :min.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name'         => 'nombre',
            'slug'         => 'slug',
            'value_points' => 'puntos por unidad',
            'is_active'    => 'activo',
        ];
    }
}
