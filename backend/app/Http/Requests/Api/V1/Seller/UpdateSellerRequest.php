<?php

namespace App\Http\Requests\Api\V1\Seller;

use App\Http\Requests\Api\V1\Image\ImageUploadRequest;
use App\Http\Requests\CamelCaseRequest;
use App\Services\Phone\PhoneNormalizerService;
use Illuminate\Validation\Rule;

class UpdateSellerRequest extends CamelCaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $seller = $this->route('seller');
        if (!($seller instanceof \App\Models\Seller)) {
            $seller = \App\Models\Seller::findOrFail($seller);
        }
        
        $userId = $seller->user_id;

        return array_merge(
            ImageUploadRequest::imageRules('avatar', false),
            [
                // Datos del usuario (todos opcionales en update)
                'username' => 'sometimes|string|max:255',
                'birthdate' => 'sometimes|date',
                'email' => [
                    'sometimes',
                    'email',
                    Rule::unique('users', 'email')->ignore($userId)->whereNull('deleted_at')
                ],
                'phone' => [
                    'sometimes',
                    'string',
                    'max:20',
                    Rule::unique('users', 'phone')->ignore($userId)->whereNull('deleted_at')
                ],
                'password' => 'sometimes|string|min:8|confirmed',
                'is_active' => 'sometimes|boolean',
                
                // Datos del vendedor
                'distributor_id' => 'sometimes|exists:distributors,id',
                'employee_code' => [
                    'sometimes',
                    'string',
                    'max:50',
                    Rule::unique('sellers', 'employee_code')
                        ->ignore($seller->id)
                        ->whereNull('deleted_at')
                        ->where(function ($query) use ($seller) {
                            $distributorId = $this->input('distributor_id') ?? $seller->distributor_id;
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
                'average_monthly_sales' => 'sometimes|numeric|min:0',
                'current_points' => 'sometimes|numeric|min:0',

                'seller_tier_id' => 'sometimes|nullable|exists:seller_tiers,id',
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
            'distributor_id' => 'distribuidor',
            'employee_code' => 'código de empleado',
            'address_street' => 'calle',
            'address_colonia' => 'colonia',
            'address_city' => 'ciudad',
            'address_state' => 'estado',
            'address_zip' => 'código postal',
            'shipping_notes' => 'notas de envío',
            'average_monthly_sales' => 'ventas mensuales promedio',
            'current_points' => 'puntos actuales',
            'seller_tier_id' => 'rango del vendedor',
        ];
    }
}
