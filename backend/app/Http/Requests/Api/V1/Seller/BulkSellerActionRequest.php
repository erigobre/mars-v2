<?php

namespace App\Http\Requests\Api\V1\Seller;

use App\Http\Requests\CamelCaseRequest;

class BulkSellerActionRequest extends CamelCaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->role->slug === 'admin';
    }

    public function rules(): array
    {
        return [
            'seller_ids' => 'required|array|min:1',
            'seller_ids.*' => 'exists:sellers,id',
            'action' => 'required|string|in:activate,deactivate,delete,adjust_points',
            'points' => 'required_if:action,adjust_points|numeric',
            'effective_date' => 'nullable|date_format:Y-m-d',
        ];
    }

    public function messages()
    {
        return [
            'seller_ids.required' => 'Debe seleccionar al menos un vendedor.',
            'seller_ids.*.exists' => 'Uno o más vendedores seleccionados no son válidos.',
            'action.required' => 'Debe especificar una acción.',
            'action.in' => 'La acción especificada no es válida.',
            'points.required_if' => 'Debe especificar la cantidad de puntos a ajustar.',
            'points.numeric' => 'Los puntos deben ser un valor numérico.',
        ];
    }
}
