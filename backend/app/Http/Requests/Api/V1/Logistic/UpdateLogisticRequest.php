<?php

namespace App\Http\Requests\Api\V1\Logistic;

use App\Http\Requests\Api\V1\Image\ImageUploadRequest;
use App\Http\Requests\CamelCaseRequest;
use App\Services\Phone\PhoneNormalizerService;
use Illuminate\Validation\Rule;

class UpdateLogisticRequest extends CamelCaseRequest
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
        $logistic = $this->route('logistic');

        $userId = $logistic->id;

        return array_merge(
            ImageUploadRequest::imageRules('avatar', false),
            [
                'username' => 'sometimes|string|max:255',
                'birthdate' => 'sometimes|date',
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
            ]
        );
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $phoneService = app(PhoneNormalizerService::class);

        if ($this->filled('phone')) {
            $normalized = $phoneService->normalize($this->input('phone'));

            if ($normalized) {
                $this->merge(['phone' => $normalized]);
            }
        }
    }

    public function messages()
    {
        return [
            'string' => 'El campo :attribute debe ser texto.',
            'email' => 'El :attribute debe ser una dirección de correo electrónico válida.',
            'unique' => 'El :attribute ya está en uso.',
            'min' => 'El :attribute debe tener al menos :min caracteres.',
            'confirmed' => 'La confirmación de :attribute no coincide.',
            'exists' => 'El :attribute seleccionado no existe.',
            'integer' => 'El :attribute debe ser un número entero.',
            'url' => 'El :attribute debe ser una URL válida.',

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
            'birthdate' => 'fecha de nacimiento',
            'phone' => 'teléfono',
            'password' => 'contraseña',
            'avatar' => 'avatar',
        ];
    }
}
