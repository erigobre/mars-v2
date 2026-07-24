<?php

namespace App\Http\Requests\Api\V1\Sale;

use App\Http\Requests\CamelCaseRequest;

class UploadSaleFileRequest extends CamelCaseRequest
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
        $isAdmin = $this->user()?->role?->slug === 'admin';

        return [
            'file'           => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10 MB
            'distributor_id' => $isAdmin ? 'required|integer|exists:distributors,id' : 'sometimes',
        ];
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
    }

    public function messages(): array
    {
        return [
            'file.required'  => 'Debes adjuntar un archivo.',
            'file.mimes'     => 'El archivo debe ser .xlsx, .xls o .csv.',
            'file.max'       => 'El archivo no debe superar los 10 MB.',
            'distributor_id.required' => 'El administrador debe indicar el distribuidor.',
            'distributor_id.exists'   => 'El distribuidor indicado no existe.',
        ];
    }
}
