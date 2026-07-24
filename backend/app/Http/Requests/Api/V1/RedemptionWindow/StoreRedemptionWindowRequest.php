<?php

namespace App\Http\Requests\Api\V1\RedemptionWindow;

use App\Http\Requests\CamelCaseRequest;
use Carbon\Carbon;

class StoreRedemptionWindowRequest extends CamelCaseRequest
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
            'opens_at'  => 'sometimes|date_format:Y-m-d H:i:s',
            'closes_at' => 'sometimes|date_format:Y-m-d H:i:s|after:opens_at',
        ];
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $tz = config('app.display_timezone', 'America/Mexico_City'); //

        if ($this->has('opens_at')) {
            $this->merge([
                'opens_at' => Carbon::parse($this->opens_at, $tz)->setTimezone('UTC')->toDateTimeString()
            ]);
        }

        if ($this->has('closes_at')) {
            $this->merge([
                'closes_at' => Carbon::parse($this->closes_at, $tz)->setTimezone('UTC')->toDateTimeString()
            ]);
        }
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'date'     => 'El campo :attribute debe ser una fecha y hora válida.',
            'after'    => 'El cierre debe ser posterior a la apertura.',
        ];
    }

    public function attributes(): array
    {
        return [
            'opens_at'  => 'apertura',
            'closes_at' => 'cierre',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Ajusta 'redemption_cycle' al nombre exacto de tu parámetro de ruta
            $cycle = $this->route('cycle'); 

            if ($cycle && $this->has('opens_at') && $this->has('closes_at')) {
                $windowOpen = Carbon::parse($this->opens_at);
                $windowClose = Carbon::parse($this->closes_at);
                
                $cycleStart = Carbon::parse($cycle->start_date);
                $cycleEnd = Carbon::parse($cycle->end_date);

                if ($windowOpen->lt($cycleStart)) {
                    $validator->errors()->add('opens_at', 'La ventana no puede abrir antes del inicio del ciclo de canje.');
                }

                if ($windowClose->gt($cycleEnd)) {
                    $validator->errors()->add('closes_at', 'La ventana no puede cerrar después del fin del ciclo de canje.');
                }
            }
        });
    }
}
