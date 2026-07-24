<?php

namespace App\Http\Requests\Api\V1\Product;

use App\Enums\UnitType;
use App\Http\Requests\Api\V1\Image\ImageUploadRequest;
use App\Http\Requests\CamelCaseRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends CamelCaseRequest
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
        $productId = $this->route('product');

        return array_merge(
            ImageUploadRequest::imageRules('image', false),
            [
                'display_id'       => 'sometimes|integer|exists:displays,id',
                'sku'              => ['sometimes', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($productId)],
                'upc'              => ['nullable', 'string', Rule::unique('products', 'upc')->ignore($productId)],
                'name'             => 'sometimes|string|max:255',
                'description'      => 'nullable|string',
                // 'image_url'        => 'nullable|url|max:500',
                'default_price'    => 'sometimes|numeric|min:0',
                'unit_type'        => ['sometimes', 'string', 'max:50', Rule::in(UnitType::values())],
                'custom_unit_type' => 'required_if:unit_type,SPECIFY|nullable|string|max:100',
                'category'         => 'nullable|string|max:100',
                'is_active'        => 'sometimes|boolean',
            ]
        );
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        if ($this->has('is_active')) {
            $this->merge(['is_active' => $this->boolean('is_active')]);
        }
    }

    public function messages(): array
    {
        return [
            'exists'      => 'El :attribute seleccionado no existe.',
            'unique'      => 'El :attribute ya existe.',
            'string'      => 'El :attribute debe ser texto.',
            'numeric'     => 'El :attribute debe ser un número.',
            'integer'     => 'El :attribute debe ser un entero.',
            'min'         => 'El :attribute debe ser ≥ :min.',
            'boolean'     => 'El :attribute debe ser booleano.',
            'url'         => 'El :attribute debe ser una URL válida.',
            'in'          => 'El :attribute debe ser uno de: :values.',
            'required_if' => 'El :attribute es obligatorio cuando :other es :value.',

            'image' => 'El archivo debe ser una imagen válida.',
            'mimes' => 'Solo se aceptan imágenes JPG, PNG o WebP.',
            'max' => 'La imagen no debe pesar más de 5 MB.',
            'dimensions' => 'La imagen debe tener al menos 100×100 px.',
        ];
    }

    public function attributes(): array
    {
        return [
            'display_id'    => 'display',
            'sku'           => 'SKU',
            'upc'           => 'UPC',
            'name'          => 'nombre',
            'description'   => 'descripción',
            // 'image_url'     => 'URL de imagen',
            'image'         => 'imagen',
            'default_price' => 'precio',
            'unit_type'     => 'tipo de unidad',
            'category'      => 'categoría',
            'is_active'     => 'activo',
        ];
    }
}
