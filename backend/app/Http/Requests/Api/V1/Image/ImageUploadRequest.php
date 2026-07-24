<?php

namespace App\Http\Requests\Api\V1\Image;

use Illuminate\Foundation\Http\FormRequest;

class ImageUploadRequest extends FormRequest
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
        return self::imageRules();
    }

    /**
     * Retorna las reglas de validación para un campo de imagen.
     *
     * @param  string  $field     nombre del campo en el request
     * @param  bool    $required  true = obligatorio, false = opcional (para updates)
     * @param  int     $maxKb     tamaño máximo en KB (default 5MB)
     */
    public static function imageRules(
        string $field    = 'image',
        bool   $required = true,
        int    $maxKb    = 5120     // 5 MB
    ): array {
        $presence = $required ? 'required' : 'sometimes|nullable';

        return [
            $field => [
                ...(explode('|', $presence)),
                'file',
                'image',                              // valida que sea imagen real (GD/Imagick)
                'mimes:jpg,jpeg,png,webp',            // formatos aceptados
                "max:{$maxKb}",                       // tamaño en KB
                'dimensions:min_width=100,min_height=100',  // evitar miniaturas rotas
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'image.image'      => 'El archivo debe ser una imagen válida.',
            'image.mimes'      => 'Solo se aceptan imágenes JPG, PNG o WebP.',
            'image.max'        => 'La imagen no debe pesar más de 5 MB.',
            'image.dimensions' => 'La imagen debe tener al menos 100×100 px.',
        ];
    }
}
