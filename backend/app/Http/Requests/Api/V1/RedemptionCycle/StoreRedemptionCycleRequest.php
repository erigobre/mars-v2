<?php

namespace App\Http\Requests\Api\V1\RedemptionCycle;

use App\Http\Requests\CamelCaseRequest;
use Carbon\Carbon;

class StoreRedemptionCycleRequest extends CamelCaseRequest
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
            'name'                   => 'required|string|max:255',
            'start_date'             => 'required|date',
            'end_date'               => 'required|date|after:start_date',
            'is_active'              => 'boolean',
            'auto_generate_windows'  => 'boolean',
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

        $this->merge([
            'is_active'             => $this->boolean('is_active', true), // Por defecto, el ciclo se crea como activo
            'auto_generate_windows' => $this->boolean('auto_generate_windows', false), // Por defecto, no se generan ventanas automáticamente
        ]);
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Ajusta 'campaign' al nombre exacto de tu parámetro de ruta
            $campaign = $this->route('campaign'); 

            if ($campaign && $this->has('start_date') && $this->has('end_date')) {
                $cycleStart = Carbon::parse($this->start_date); // Ya está en UTC por el prepareForValidation
                $cycleEnd = Carbon::parse($this->end_date);     // Ya está en UTC
                
                $campaignStart = Carbon::parse($campaign->start_date);
                $campaignEnd = Carbon::parse($campaign->end_date);

                if ($cycleStart->lt($campaignStart)) {
                    $validator->errors()->add('start_date', 'El ciclo no puede iniciar antes del inicio de la campaña.');
                }

                if ($cycleEnd->gt($campaignEnd)) {
                    $validator->errors()->add('end_date', 'El ciclo no puede terminar después del fin de la campaña.');
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'required'  => 'El campo :attribute es obligatorio.',
            'date'      => 'El campo :attribute debe ser una fecha válida.',
            'after'     => 'La fecha de fin debe ser posterior a la de inicio.',
            'string'    => 'El campo :attribute debe ser texto.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name'                   => 'nombre',
            'start_date'             => 'fecha de inicio',
            'end_date'               => 'fecha de fin',
            'is_active'              => 'activo',
            'auto_generate_windows'  => 'auto-generar ventanas',
        ];
    }
}
