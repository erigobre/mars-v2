<?php

namespace App\Http\Requests\Api\V1\Profile;

use App\Http\Requests\Api\V1\Image\ImageUploadRequest;
use App\Services\Phone\PhoneNormalizerService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
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
        $userId   = $this->user()->id;
        $roleSlug = $this->user()->role->slug;

        $rules = array_merge(
            ImageUploadRequest::imageRules('avatar', false),
            [
                'username' => 'sometimes|string|max:255',
                'email'    => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($userId)],
                'phone'    => ['sometimes', 'string', 'max:20', Rule::unique('users', 'phone')->ignore($userId)],
                'password' => 'sometimes|string|min:8|confirmed',
            ]
        );

        // Solo sellers pueden cambiar su dirección de envío
        if ($roleSlug === 'seller') {
            $rules = array_merge($rules, [
                'address_street'  => 'nullable|string|max:255',
                'address_colonia' => 'nullable|string|max:255',
                'address_city'    => 'nullable|string|max:100',
                'address_state'   => 'nullable|string|max:100',
                'address_zip'     => 'nullable|string|max:10',
                'shipping_notes'  => 'nullable|string|max:1000',
            ]);
        }

        // Solo distribuidores pueden cambiar su company_name
        if ($roleSlug === 'distributor') {
            $rules['company_name'] = 'sometimes|string|max:255';
        }

        return $rules;
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        if ($this->filled('phone')) {
            $normalized = app(PhoneNormalizerService::class)->normalize($this->input('phone'));
            if ($normalized) $this->merge(['phone' => $normalized]);
        }
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'avatar'          => 'foto de perfil',
            'username'        => 'nombre de usuario',
            'email'           => 'correo electrónico',
            'phone'           => 'número de teléfono',
            'password'        => 'contraseña',
            'address_street'  => 'calle',
            'address_colonia' => 'colonia',
            'address_city'    => 'ciudad',
            'address_state'   => 'estado',
            'address_zip'     => 'código postal',
            'shipping_notes'  => 'notas de envío',
            'company_name'    => 'nombre de la empresa',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'string'    => 'El campo :attribute debe ser una cadena de texto válida.',
            'max'       => 'El campo :attribute no debe exceder los :max caracteres.',
            'min'       => 'El campo :attribute debe tener al menos :min caracteres.',
            
            'email'     => 'El :attribute debe ser una dirección válida.',
            'unique'    => 'Este :attribute ya se encuentra registrado.',
            'confirmed' => 'La confirmación de la :attribute no coincide.',
            
            'image'     => 'El archivo seleccionado en :attribute debe ser una imagen.',
            'mimes'     => 'El :attribute debe ser un archivo de tipo: :values.',
        ];
    }
}
