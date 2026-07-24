<?php

namespace App\Http\Requests\Api\V1\Logistic;

use App\Http\Requests\Api\V1\Image\ImageUploadRequest;
use App\Http\Requests\CamelCaseRequest;
use App\Services\Phone\PhoneNormalizerService;

class StoreLogisticRequest extends CamelCaseRequest
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
                'username' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'required|string|max:20|unique:users,phone',
                'birthdate' => 'required|date',
                'is_active' => 'boolean',
            ]
        );
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $phoneService = app(PhoneNormalizerService::class);

        $this->merge([
            'is_active' => $this->boolean('is_active'),
        ]);

        if ($this->filled('phone')) {
            $normalized = $phoneService->normalize($this->input('phone'));

            if ($normalized) {
                $this->merge(['phone' => $normalized]);
            }
        }
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
            'exists' => 'El :attribute seleccionado no existe.',
            'integer' => 'El :attribute debe ser un número entero.',
            'url' => 'El :attribute debe ser una URL válida.',
            'boolean' => 'El :attribute debe ser verdadero o falso.',

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
            'phone' => 'teléfono',
            'birthdate' => 'fecha de nacimiento',
            'is_active' => 'estado activo',
            'avatar' => 'foto de perfil',
        ];
    }
}
