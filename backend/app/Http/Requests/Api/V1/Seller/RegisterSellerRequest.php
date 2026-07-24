<?php

namespace App\Http\Requests\Api\V1\Seller;

use App\Http\Requests\Api\V1\Image\ImageUploadRequest;
use App\Services\Phone\PhoneNormalizerService;
use Illuminate\Foundation\Http\FormRequest;

class RegisterSellerRequest extends FormRequest
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
                'email' => 'required|email',
                'phone' => 'required|string|max:20',
                'birthdate' => 'required|date',
                
                // Datos del vendedor
                'distributor_id' => 'required|exists:distributors,id',
                'employee_code' => 'required|string|max:50',
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

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $email = $this->input('email');
            $phone = $this->input('phone');
            $employeeCode = $this->input('employee_code');

            // Check if user exists by email or phone
            $user = \App\Models\User::where('email', $email)->orWhere('phone', $phone)->first();

            if ($user) {
                if ($user->last_login_at === null) {
                    // Allowed to re-send email
                    $this->merge(['existing_user' => $user]);
                } else {
                    $validator->errors()->add('email', 'Este correo o teléfono ya está en uso y la cuenta ya está activa.');
                }
            } else {
                // If it's a new user, we must ensure employee_code is unique
                if (\App\Models\Seller::where('employee_code', $employeeCode)->where('distributor_id', $this->input('distributor_id'))->exists()) {
                    $validator->errors()->add('employee_code', 'Este código de empleado ya está en uso en este distribuidor.');
                }
            }
        });
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
            'password' => 'contraseña',
            'avatar' => 'avatar',
            'distributor_id' => 'distribuidor',
            'employee_code' => 'código de empleado',
            'address_street' => 'calle',
            'address_colonia' => 'colonia',
            'address_city' => 'ciudad',
            'address_state' => 'estado',
            'address_zip' => 'código postal',
            'shipping_notes' => 'notas de envío',
        ];
    }
}
