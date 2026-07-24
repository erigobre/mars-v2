<?php

namespace App\Http\Requests\Api\V1\RedemptionCycle;

use App\Http\Requests\CamelCaseRequest;
use Carbon\Carbon;

class UpdateRedemptionCycleRequest extends CamelCaseRequest
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
            'date'  => 'El campo :attribute debe ser una fecha válida.',
            'after' => 'La fecha de fin debe ser posterior a la de inicio.',
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

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $cycle = $this->route('cycle'); 
            $campaign = $cycle ? $cycle->campaign : null; 

            if ($campaign) {
                $cycleStart = $this->has('start_date') ? Carbon::parse($this->start_date) : Carbon::parse($cycle->start_date);
                $cycleEnd = $this->has('end_date') ? Carbon::parse($this->end_date) : Carbon::parse($cycle->end_date);
                
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
}
