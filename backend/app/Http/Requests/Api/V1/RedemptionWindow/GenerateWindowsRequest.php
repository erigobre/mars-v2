<?php

namespace App\Http\Requests\Api\V1\RedemptionWindow;

use App\Http\Requests\CamelCaseRequest;

class GenerateWindowsRequest extends CamelCaseRequest
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
            // replace=true: borra las ventanas existentes y regenera todas
            // replace=false (default): agrega solo las que aún no existen
            'replace' => 'boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        $this->merge(['replace' => $this->boolean('replace', false)]);
    }

    public function messages(): array
    {
        return ['boolean' => 'El campo :attribute debe ser verdadero o falso.'];
    }

    public function attributes(): array
    {
        return ['replace' => 'reemplazar'];
    }
}
