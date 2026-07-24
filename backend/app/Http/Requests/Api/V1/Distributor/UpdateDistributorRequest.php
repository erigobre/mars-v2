<?php

namespace App\Http\Requests\Api\V1\Distributor;

use App\Enums\CredentialType;
use App\Enums\IdentifierType;
use App\Http\Requests\Api\V1\Image\ImageUploadRequest;
use App\Http\Requests\CamelCaseRequest;
// use App\Services\Phone\PhoneNormalizerService;
use Illuminate\Validation\Rule;

class UpdateDistributorRequest extends CamelCaseRequest
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
        $distributor = $this->route('distributor');

        $userId = $distributor->user_id;

        return array_merge(
            ImageUploadRequest::imageRules('avatar', false),
            [
                // Datos del usuario (todos opcionales en update)
                'username' => 'sometimes|string|max:255',
                'email' => [
                    'sometimes',
                    'email',
                    Rule::unique('users', 'email')->ignore($userId)
                ],
                'phone' => [
                    'sometimes',
                    'string',
                    'max:20',
                    Rule::unique('users', 'phone')->ignore($userId)
                ],
                'password' => 'sometimes|string|min:8|confirmed',
                'is_active' => 'sometimes|boolean',

                // Datos del distribuidor
                'company_name' => 'sometimes|string|max:255',
                'points_calculation_strategy' => 'sometimes|string|nullable',
                'growth_percentage'          => 'sometimes|numeric|min:0|max:100',
                'average_evaluation_scope'    => 'sometimes|string|in:cycle,campaign',
                'identifier_type' => ['sometimes', 'string', Rule::in(IdentifierType::values())],
                'credential_type' => ['sometimes', 'string', Rule::in(CredentialType::values())],
            ]
        );
    }

    public function prepareForValidation(): void
    {
        parent::prepareForValidation();

        // $phoneService = app(PhoneNormalizerService::class);

        // if ($this->filled('phone')) {
        //     $normalized = $phoneService->normalize($this->input('phone'));

        //     if ($normalized) {
        //         $this->merge(['phone' => $normalized]);
        //     }
        // }
    }

    public function messages()
    {
        return [
            'string' => 'El campo :attribute debe ser texto.',
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
            'phone' => 'teléfono de contacto',
            'pointsCalculationStrategy' => 'estrategia de cálculo de puntos',
            'growthPercentage' => 'porcentaje de crecimiento',
            'averageEvaluationScope' => 'alcance de evaluación promedio',
            'is_active' => 'estado',
            'birthdate' => 'fecha de nacimiento',
            'identifier_type' => 'tipo de identificación',
            'credential_type' => 'tipo de credencial',
        ];
    }
}
