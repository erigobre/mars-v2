<?php

namespace App\Http\Requests\Api\V1\RewardClaim;

use App\Http\Requests\CamelCaseRequest;
use App\Models\RewardClaim;

class StoreRewardClaimRequest extends CamelCaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', RewardClaim::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'reward_id' => 'required|integer|exists:rewards,id',
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
            'integer'  => 'El campo :attribute debe ser un número entero.',
            'exists'   => 'El :attribute seleccionado no existe.',
        ];
    }

    public function attributes(): array
    {
        return [
            'reward_id' => 'premio',
        ];
    }
}
