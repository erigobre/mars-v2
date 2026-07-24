<?php

namespace App\Http\Requests\Api\V1\Goal;

use App\Enums\GoalType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGoalRequest extends FormRequest
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
            'name'          => 'sometimes|string|max:255',
            'description'   => 'nullable|string|max:1000',
            'type'          => ['sometimes', 'string', Rule::in(GoalType::values())],
            'target_value'  => 'sometimes|numeric|min:0.01',
            'reward_points' => 'sometimes|integer|min:0',
            'is_active'     => 'sometimes|boolean',

            'product_id' => [
                Rule::requiredIf(function () {
                    $type = $this->input('type') ?? $this->route('goal')?->type?->value;
                    return $type === GoalType::SPECIFIC_PRODUCT_QTY->value;
                }),
                'nullable',
                'integer',
                'exists:products,id',
            ],

            'display_id' => [
                Rule::requiredIf(function () {
                    $type = $this->input('type') ?? $this->route('goal')?->type?->value;
                    return $type === GoalType::TOTAL_DISPLAY_QTY->value;
                }),
                'nullable',
                'integer',
                'exists:displays,id',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        if ($this->has('is_active')) {
            $this->merge(['is_active' => $this->boolean('is_active')]);
        }
    }

    public function messages(): array
    {
        return [
            'exists'  => 'El :attribute seleccionado no existe.',
            'numeric' => 'El campo :attribute debe ser un número.',
            'integer' => 'El campo :attribute debe ser un entero.',
            'min'     => 'El campo :attribute debe ser ≥ :min.',
            'in'      => 'El tipo de meta no es válido.',
        ];
    }

    public function attributes(): array
    {
        return [
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
