<?php

namespace App\Http\Requests\Api\V1\RewardClaim;

use App\Enums\RewardClaimStatus;
use App\Http\Requests\CamelCaseRequest;
use Illuminate\Validation\Rule;

class UpdateRewardClaimRequest extends CamelCaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('claim'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(RewardClaimStatus::values())],
            'notes'  => 'nullable|string|max:1000',
            'carrier' => 'nullable|string|max:100',
            'tracking_number' => 'nullable|string|max:100',
        ];
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'in'       => 'El estado :attribute no es válido.',
        ];
    }

    public function attributes(): array
    {
        return [
            'status' => 'estado',
            'notes'  => 'notas',
            'carrier' => 'transportista',
            'tracking_number' => 'número de seguimiento',
        ];
    }
}
