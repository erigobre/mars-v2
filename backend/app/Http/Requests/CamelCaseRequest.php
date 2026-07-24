<?php

namespace App\Http\Requests;

use App\Traits\ApiResponse;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

abstract class CamelCaseRequest extends FormRequest
{
    use ApiResponse;
    /**
     * Convierte todas las claves camelCase del request a snake_case
     * antes de la validación.
     */
    protected function prepareForValidation(): void
    {
        $converted = $this->convertKeysToSnake($this->all());
        $this->replace($converted);
    }

    /**
     * Convierte camelCase → snake_case recursivamente.
     */
    private function convertKeysToSnake(array $data): array
    {
        $result = [];

        foreach ($data as $key => $value) {
            $snakeKey = $this->camelToSnake((string) $key);

            $result[$snakeKey] = is_array($value)
                ? $this->convertKeysToSnake($value)
                : $value;
        }

        return $result;
    }

    private function camelToSnake(string $key): string
    {
        return strtolower(preg_replace('/([A-Z])/', '_$1', lcfirst($key)));
    }

    protected function failedValidation(Validator $validator)
    {
        // Obtenemos los errores y los convertimos a camelCase usando el trait ApiResponse
        throw new HttpResponseException(
            $this->validationError($validator->errors()->toArray())
        );
    }
}
