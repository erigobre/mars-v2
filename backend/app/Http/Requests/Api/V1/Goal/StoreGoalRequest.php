<?php

namespace App\Http\Requests\Api\V1\Goal;

use App\Enums\GoalType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGoalRequest extends FormRequest
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
            'cycle_id'     => 'required|integer|exists:redemption_cycles,id',
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string|max:1000',
            'type'         => ['required', 'string', Rule::in(GoalType::values())],
            'target_value' => 'required|numeric|min:0.01',
            'reward_points'=> 'required|integer|min:0',
            'is_active'    => 'boolean',

            // product_id obligatorio para SPECIFIC_PRODUCT_QTY
            'product_id' => [
                Rule::requiredIf(
                    fn() => $this->input('type') === GoalType::SPECIFIC_PRODUCT_QTY->value
                ),
                'nullable',
                'integer',
                'exists:products,id',
            ],

            // display_id obligatorio para TOTAL_DISPLAY_QTY
            'display_id' => [
                Rule::requiredIf(
                    fn() => $this->input('type') === GoalType::TOTAL_DISPLAY_QTY->value
                ),
                'nullable',
                'integer',
                'exists:displays,id',
            ],
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
            'required'           => 'El campo :attribute es obligatorio.',
            'exists'             => 'El :attribute seleccionado no existe.',
            'numeric'            => 'El campo :attribute debe ser un número.',
            'integer'            => 'El campo :attribute debe ser un entero.',
            'min'                => 'El campo :attribute debe ser ≥ :min.',
            'in'                 => 'El tipo de meta no es válido.',
            'product_id.required_if' => 'Se requiere un producto para metas del tipo SPECIFIC_PRODUCT_QTY.',
            'display_id.required_if' => 'Se requiere un display para metas del tipo TOTAL_DISPLAY_QTY.',
        ];
    }

    public function attributes(): array
    {
        return [
            'cycle_id'      => 'ciclo',
            'name'          => 'nombre',
            'description'   => 'descripción',
            'type'          => 'tipo',
            'target_value'  => 'valor objetivo',
            'reward_points' => 'puntos de recompensa',
            'product_id'    => 'producto',
            'display_id'    => 'display',
            'is_active'     => 'activa',
        ];
    }
}
