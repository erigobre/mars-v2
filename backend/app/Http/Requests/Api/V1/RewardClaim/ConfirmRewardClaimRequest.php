<?php

namespace App\Http\Requests\Api\V1\RewardClaim;

use App\Http\Requests\CamelCaseRequest;

class ConfirmRewardClaimRequest extends CamelCaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $rewardClaim = $this->route('claim');
        return $this->user()->can('completeClaim', $rewardClaim);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'shipping_name'    => 'required|string|max:150',
            'shipping_street'  => 'required|string|max:255',
            'shipping_colonia' => 'required|string|max:150',
            'shipping_city'    => 'required|string|max:100',
            'shipping_state'   => 'required|string|max:100',
            'shipping_zip'     => 'required|string|regex:/^\d{5}$/',
            'shipping_notes'   => 'nullable|string|max:500',
            'save_to_profile'  => 'boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
    }

    public function messages(): array
    {
        return [
            'shipping_zip.regex' => 'El código postal debe tener 5 dígitos.',
            'required'           => 'El campo :attribute es obligatorio para el envío.',
        ];
    }

    public function attributes(): array
    {
        return [
            'shipping_name'    => 'nombre de destinatario',
            'shipping_street'  => 'calle y número',
            'shipping_colonia' => 'colonia',
            'shipping_city'    => 'ciudad',
            'shipping_state'   => 'estado',
            'shipping_zip'     => 'código postal',
            'shipping_notes'   => 'instrucciones de entrega',
        ];
    }

    /**
     * Retorna los datos de envío en snake_case para el servicio.
     */
    public function shippingData(): array
    {
        return $this->only([
            'shipping_name',
            'shipping_street',
            'shipping_colonia',
            'shipping_city',
            'shipping_state',
            'shipping_zip',
            'shipping_notes',
        ]);
    }
}
