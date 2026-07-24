<?php

namespace App\Http\Requests\Api\V1\Sale;

use App\Http\Requests\CamelCaseRequest;
use App\Models\Campaign;
use Illuminate\Auth\Access\AuthorizationException;

class StoreSaleRequest extends CamelCaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $campaign = Campaign::current()->first();

        // Solo autorizar si hay una campaña y está en estatus RUNNING
        return $campaign && $campaign->isRunning();
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
            'distributor_id' => $isAdmin ? 'required|integer|exists:distributors,id' : 'sometimes',
            'seller_id' => 'required|integer|exists:sellers,id',
            'sale_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.amount'         => 'required|numeric|min:0',
        ];
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
    }

    protected function failedAuthorization()
    {
        throw new AuthorizationException(
            'No se pueden registrar ventas en este momento. La campaña está pausada o no hay ninguna activa.'
        );
    }

    public function messages()
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'integer'  => 'El campo :attribute debe ser un número entero.',
            'exists'   => 'El :attribute seleccionado no es válido.',
            'date'     => 'El campo :attribute debe ser una fecha válida.',
            'string'   => 'El campo :attribute debe ser una cadena de texto.',
            'max'      => 'El campo :attribute no debe exceder :max caracteres.',
            'array'    => 'El campo :attribute debe ser un arreglo.',
            'min'      => 'El campo :attribute debe tener al menos :min.',
            'numeric'  => 'El campo :attribute debe ser un número.',
            'sometimes' => 'El campo :attribute es opcional.',
            'nullable' => 'El campo :attribute es opcional.',
        ];
    }

    public function attributes()
    {
        return [
            'distributor_id' => 'distribuidor',
            'seller_id'      => 'vendedor',
            'sale_date'      => 'fecha de venta',
            'notes'          => 'notas',
            'items'          => 'artículos',
            'items.*.product_id' => 'ID de producto',
            'items.*.quantity'   => 'cantidad',
            'items.*.amount'     => 'monto',
        ];
    }
}
