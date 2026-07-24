<?php

namespace App\Http\Requests\Api\V1\Display;

use App\Http\Requests\CamelCaseRequest;
use Illuminate\Validation\Rule;

class UpdateDisplayRequest extends CamelCaseRequest
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
        $displayId = $this->route('display');

        return [
            'name'         => ['sometimes', 'string', 'max:255', Rule::unique('displays', 'name')->ignore($displayId)],
            'slug'         => ['sometimes', 'string', 'max:255', Rule::unique('displays', 'slug')->ignore($displayId)],
            'value_points' => 'sometimes|numeric|min:0',
            'is_active'    => 'sometimes|boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        if ($this->has('is_active')) {
            $this->merge(['is_active' => $this->boolean('is_active', true)]);
        }
    }

    public function messages(): array
    {
        return [
            'unique'  => 'Ya existe un display con ese :attribute.',
            'numeric' => 'El campo :attribute debe ser un número.',
            'min'     => 'El campo :attribute debe ser ≥ :min.',
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
