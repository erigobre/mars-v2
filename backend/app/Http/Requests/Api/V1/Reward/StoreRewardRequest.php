<?php

namespace App\Http\Requests\Api\V1\Reward;

use App\Http\Requests\Api\V1\Image\ImageUploadRequest;
use App\Http\Requests\CamelCaseRequest;
use Illuminate\Support\Facades\Log;

class StoreRewardRequest extends CamelCaseRequest
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
        Log::info('Datos recibidos:', $this->all());
        Log::info('Tipo de dato de visibility:', [gettype($this->visibility)]);

        return array_merge(
            ImageUploadRequest::imageRules('image', false),
            [
                'name'            => 'required|string|max:255',
                'description'     => 'nullable|string',
                'points_required' => 'required|integer|min:1',
                'stock'           => 'required|integer|min:0',
                'category'        => 'required|string|max:255',
                'visibility'      => 'sometimes|string|in:always,campaign_end',
                'max_global_claims' => 'nullable|integer|min:0',
                'base_cost'       => 'nullable|integer|in:1500,3000,6000',
                'is_active'       => 'boolean',
                'is_featured'     => 'boolean',
            ]
        );
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        $this->merge([
            'is_active' => $this->boolean('is_active', true),
            'visibility' => $this->input('visibility', 'always')
        ]);
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'integer'  => 'El campo :attribute debe ser un número entero.',
            'min'      => 'El campo :attribute debe ser mínimo :min.',
            'url'      => 'El campo :attribute debe ser una URL válida.',
            'string'   => 'El campo :attribute debe ser texto.',
            'in'       => 'El campo :attribute debe ser uno de los siguientes valores: :values.',

            'image' => 'El archivo debe ser una imagen válida.',
            'mimes' => 'Solo se aceptan imágenes JPG, PNG o WebP.',
            'max' => 'La imagen no debe pesar más de 5 MB.',
            'dimensions' => 'La imagen debe tener al menos 100×100 px.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name'            => 'nombre',
            'description'     => 'descripción',
            'points_required' => 'puntos requeridos',
            'stock'           => 'inventario',
            'category'        => 'categoría',
            'visibility'      => 'visibilidad',
            'max_global_claims' => 'canjeos globales máximos',
            'image'           => 'imagen',
            'is_active'       => 'activo',
        ];
    }
}
