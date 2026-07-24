<?php

namespace App\Http\Requests\Api\V1\Seller;

use App\Http\Requests\Api\V1\Image\ImageUploadRequest;
use App\Http\Requests\CamelCaseRequest;
use App\Services\Phone\PhoneNormalizerService;
use Illuminate\Validation\Rule;

class StoreSellerRequest extends CamelCaseRequest
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
        $user = $this->user();

        return array_merge(
            ImageUploadRequest::imageRules('avatar', false),
            [
                // Datos del usuario
                'username' => 'required|string|max:255',
                'email' => [
                    'nullable',
                    'email',
                    Rule::unique('users', 'email')->whereNull('deleted_at')
                ],
                'phone' => [
                    'nullable',
                    'string',
                    'max:20',
                    Rule::unique('users', 'phone')->whereNull('deleted_at')
                ],
                'birthdate' => 'nullable|date',
                'is_active' => 'boolean',
                
                // Datos del vendedor
                'distributor_id' => $user && $user->role->slug === 'admin' 
                    ? 'required|exists:distributors,id'
                    : 'sometimes',
                'employee_code' => [
                    'nullable',
                    'string',
                    'max:50',
                    Rule::unique('sellers', 'employee_code')
                        ->whereNull('deleted_at')
                        ->where(function ($query) use ($user) {
                            $distributorId = $this->input('distributor_id') ?? ($user->distributor->id ?? null);
                            return $query->where('distributor_id', $distributorId);
                        })
                ],
                
                // Dirección
                'address_street' => 'nullable|string|max:255',
                'address_colonia' => 'nullable|string|max:255',
                'address_city' => 'nullable|string|max:100',
                'address_state' => 'nullable|string|max:100',
                'address_zip' => 'nullable|string|max:10',
                'shipping_notes' => 'nullable|string|max:1000',
                'average_monthly_sales' => 'required|numeric|min:0',
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
            'average_monthly_sales' => 'ventas mensuales promedio',
        ];
    }
}
