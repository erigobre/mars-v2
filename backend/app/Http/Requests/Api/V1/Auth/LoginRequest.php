<?php

namespace App\Http\Requests\Api\V1\Auth;

use App\Http\Requests\CamelCaseRequest;
// use App\Services\Phone\PhoneNormalizerService;

class LoginRequest extends CamelCaseRequest
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
        return [
            // 'email' => 'required|email',
            // 'phone' => 'required|string|max:20',
            'distributor_id' => ['nullable', 'integer', 'exists:distributors,id'],
            'identifier'     => ['required', 'string'],
            'password' => 'required|string',
        ];
    }

    public function prepareForValidation(): void
    {
        parent::prepareForValidation();
        // $normalizer = app(PhoneNormalizerService::class);
        // if ($this->has('phone')) {
        //     $normalized = $normalizer->normalize($this->input('phone'));
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
            'required' => 'El :attribute es obligatorio.',
            'email' => 'El :attribute debe ser una dirección de correo electrónico válida.',
            'string' => 'El :attribute debe ser una cadena de texto.',
            'min' => 'El :attribute debe tener al menos :min caracteres.',
            'numeric' => 'El :attribute debe ser un número.',
            'max' => 'El :attribute no debe exceder los :max caracteres.',
        ];
    }

    public function attributes()
    {
        return [
            // 'email' => 'Correo electrónico',
            // 'phone' => 'Teléfono',
            'distributor_id' => 'ID del distribuidor',
            'identifier' => 'Identificador',
            'password' => 'Contraseña',
        ];
    }
}
