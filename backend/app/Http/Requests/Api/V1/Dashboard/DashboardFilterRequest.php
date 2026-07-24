<?php

namespace App\Http\Requests\Api\V1\Dashboard;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class DashboardFilterRequest extends FormRequest
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
            'campaign_id'     => 'nullable|integer|exists:campaigns,id',
            'cycle_id'        => 'nullable|integer|exists:redemption_cycles,id',
            'distributor_id'  => 'nullable|integer|exists:distributors,id',
            'start_date'      => 'nullable|date',
            'end_date'        => 'nullable|date|after_or_equal:start_date',
        ];
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $tz = config('app.display_timezone', 'America/Mexico_City');

        if ($this->has('start_date')) {
            $this->merge([
                'start_date' => Carbon::parse($this->start_date, $tz)
                    ->startOfDay()
                    ->setTimezone('UTC')
                    ->toDateTimeString()
            ]);
        }

        if ($this->has('end_date')) {
            $this->merge([
                'end_date' => Carbon::parse($this->end_date, $tz)
                    ->endOfDay()
                    ->setTimezone('UTC')
                    ->toDateTimeString()
            ]);
        }
    }

    public function messages(): array
    {
        return [
            'campaign_id.exists'   => 'La campaña seleccionada no existe.',
            'distributor_id.exists' => 'El distribuidor seleccionado no existe.',
            'start_date.date'      => 'La fecha de inicio debe ser válida.',
            'end_date.date'        => 'La fecha de fin debe ser válida.',
            'end_date.after_or_equal' => 'La fecha de fin debe ser posterior o igual a la de inicio.',
        ];
    }

    public function attributes(): array
    {
        return [
            'campaign_id'    => 'campaña',
            'distributor_id' => 'distribuidor',
            'start_date'     => 'fecha de inicio',
            'end_date'       => 'fecha de fin',
        ];
    }
}
