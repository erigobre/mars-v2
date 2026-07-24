<?php

namespace App\Http\Requests\Api\V1\Distributor;

use App\Enums\CredentialType;
use App\Enums\IdentifierType;
use App\Http\Requests\Api\V1\Image\ImageUploadRequest;
use App\Http\Requests\CamelCaseRequest;
// use App\Services\Phone\PhoneNormalizerService;
use Illuminate\Validation\Rule;

class StoreDistributorRequest extends CamelCaseRequest
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
        return array_merge(
            ImageUploadRequest::imageRules('avatar', false),
            [
                // Datos del usuario
                'username' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'required|string|max:20|unique:users,phone',
                'birthdate' => 'required|date',
                'is_active' => 'boolean',

                // Datos del distribuidor
                'company_name' => 'required|string|max:255',
                'points_calculation_strategy' => 'sometimes|string|nullable',
                'growth_percentage'          => 'required|numeric|min:0|max:100',
                'average_evaluation_scope'    => 'required|string',

                'identifier_type' => ['sometimes', 'string', Rule::in(IdentifierType::values())],
                'credential_type' => ['sometimes', 'string', Rule::in(CredentialType::values())],
            ]
        );
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        // $phoneService = app(PhoneNormalizerService::class);

        $this->merge([
            'is_active' => $this->boolean('is_active', true)
        ]);

        // if ($this->filled('phone')) {
        //     $normalized = $phoneService->normalize($this->input('phone'));

        //     if ($normalized) {
        //         $this->merge(['phone' => $normalized]);
        //     }
        // }
    }

    public function normalizedPhone(): string
    {
        return $this->input('phone');
    }

    public function messages()
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'email' => 'El :attribute debe ser una dirección de correo electrónico válida.',
            'unique' => 'El :attribute ya está en uso.',
            'min' => 'El :attribute debe tener al menos :min caracteres.',
            'confirmed' => 'La confirmación de :attribute no coincide.',
            'numeric' => 'El :attribute debe ser un número.',
            'url' => 'El :attribute debe ser una URL válida.',
            'in' => 'El :attribute debe ser uno de los valores permitidos.',

            'image' => 'El archivo debe ser una imagen válida.',
            'mimes' => 'Solo se aceptan imágenes JPG, PNG o WebP.',
            'max' => 'La imagen no debe pesar más de 5 MB.',
            'dimensions' => 'La imagen debe tener al menos 100×100 px.',
        ];
    }

    public function attributes()
    {
        return [
            'username' => 'nombre de usuario',
            'email' => 'correo electrónico',
            'password' => 'contraseña',
            'avatar' => 'avatar',
            'company_name' => 'nombre de la empresa',
            'phone' => 'número de teléfono',
            'points_calculation_strategy' => 'estrategia de cálculo de puntos',
            'growth_percentage'           => 'porcentaje de crecimiento',
            'average_evaluation_scope'    => 'alcance de evaluación promedio',
            'is_active' => 'estado',
            'birthdate' => 'fecha de nacimiento',
            'identifier_type' => 'tipo de identificación',
            'credential_type' => 'tipo de credencial',
        ];
    }
}
