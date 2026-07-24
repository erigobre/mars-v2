<?php

namespace App\Http\Requests\Api\V1\Campaign;

use App\Http\Requests\CamelCaseRequest;
use Carbon\Carbon;

class UpdateCampaignRequest extends CamelCaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => 'sometimes|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date'   => 'sometimes|date|after:start_date',
            'is_active'  => 'sometimes|boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $tz = config('app.display_timezone', 'America/Mexico_City'); //

        if ($this->has('start_date')) {
            $this->merge([
                'start_date' => Carbon::parse($this->start_date, $tz)->startOfDay()->setTimezone('UTC')->toDateTimeString()
            ]);
        }

        if ($this->has('end_date')) {
            $this->merge([
                'end_date' => Carbon::parse($this->end_date, $tz)->endOfDay()->setTimezone('UTC')->toDateTimeString()
            ]);
        }

        if ($this->has('is_active')) {
            $this->merge(['is_active' => $this->boolean('is_active')]);
        }
    }

    public function messages(): array
    {
        return [
            'date'    => 'El campo :attribute debe ser una fecha válida.',
            'after'   => 'La fecha de fin debe ser posterior a la fecha de inicio.',
            'string'  => 'El campo :attribute debe ser texto.',
            'max'     => 'El campo :attribute no debe exceder :max caracteres.',
            'boolean' => 'El campo :attribute debe ser verdadero o falso.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name'       => 'nombre',
            'start_date' => 'fecha de inicio',
            'end_date'   => 'fecha de fin',
            'is_active'  => 'activo',
        ];
    }
}
