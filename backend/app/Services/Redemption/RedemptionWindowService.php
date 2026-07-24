<?php

namespace App\Services\Redemption;

use App\Models\RedemptionCycle;
use App\Models\RedemptionWindow;
use App\Services\Campaign\CampaignService;
use Carbon\Carbon;

class RedemptionWindowService
{

    public function __construct(protected CampaignService $campaignService)
    {
    }

    public function create(RedemptionCycle $cycle, array $data): RedemptionWindow
    {
        $this->validateWindowRange(
            $cycle,
            Carbon::parse($data['opens_at']),
            Carbon::parse($data['closes_at'])
        );

        return RedemptionWindow::create([
            'cycle_id'  => $cycle->id,
            'opens_at'  => $data['opens_at'],
            'closes_at' => $data['closes_at'],
        ]);
    }

    /**
     * Genera automáticamente todas las ventanas Vie–Dom del ciclo.
     *
     * @param  bool $replace  true = borra las ventanas existentes antes de generar
     * @return int            número de ventanas creadas
     */
    public function generateWindows(RedemptionCycle $cycle, bool $replace = false): int
    {
        if ($cycle->claims()->exists() && $replace) {
            throw new \Exception(
                'No se pueden reemplazar las ventanas porque el ciclo ya tiene canjes. '
                . 'Puedes añadir ventanas nuevas sin usar replace=true.'
            );
        }

        return $this->campaignService->generateWindowsForCycle(
            $cycle,
            Carbon::parse($cycle->start_date),
            Carbon::parse($cycle->end_date),
            deletePrevious: $replace,
        );
    }

    public function update(RedemptionWindow $window, array $data): RedemptionWindow
    {
        $opensAt  = Carbon::parse($data['opens_at']  ?? $window->opens_at);
        $closesAt = Carbon::parse($data['closes_at'] ?? $window->closes_at);

        $this->validateWindowRange($window->cycle, $opensAt, $closesAt);

        $window->update([
            'opens_at'  => $opensAt,
            'closes_at' => $closesAt,
        ]);

        return $window->fresh();
    }

    public function delete(RedemptionWindow $window): void
    {
        // No permitir borrar una ventana que esté actualmente abierta
        if (now()->between($window->opens_at, $window->closes_at)) {
            throw new \Exception(
                'No se puede eliminar una ventana que está abierta en este momento.'
            );
        }

        $window->delete();
    }

    private function validateWindowRange(
        RedemptionCycle $cycle,
        Carbon          $opensAt,
        Carbon          $closesAt,
    ): void {
        if ($closesAt->lte($opensAt)) {
            throw new \Exception(
                'La fecha de cierre debe ser posterior a la de apertura.'
            );
        }

        $cycleStart = Carbon::parse($cycle->start_date);
        $cycleEnd   = Carbon::parse($cycle->end_date);

        if ($opensAt->lt($cycleStart) || $closesAt->gt($cycleEnd)) {
            throw new \Exception(
                "La ventana debe estar dentro del rango del ciclo "
                . "({$cycleStart->toDateString()} – {$cycleEnd->toDateString()})."
            );
        }
    }
}