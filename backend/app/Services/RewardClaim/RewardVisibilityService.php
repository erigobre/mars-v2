<?php

namespace App\Services\RewardClaim;

use App\Models\Campaign;
use App\Models\RedemptionCycle;
use App\Models\RedemptionWindow;

/**
 * Determina qué niveles de visibilidad de premios están activos
 * en función del estado actual de la campaña, ciclo y ventana.
 *
 * Niveles posibles:
 *  - 'always'       → siempre visible (cuando la tienda está abierta)
 *  - 'cycle_end'    → visible solo durante la ÚLTIMA ventana del ciclo actual
 *  - 'campaign_end' → visible solo durante la ÚLTIMA ventana del ÚLTIMO ciclo de la campaña
 *
 * Se revelan premios si hay una
 * ventana ABIERTA que sea efectivamente la última del ciclo/campaña.
 * El admin puede asegurarse de crear una ventana que cubra la fecha de fin
 * de campaña. No abrimos la tienda automáticamente fuera de ventanas.
 */
class RewardVisibilityService
{
    /**
     * Retorna los niveles de visibilidad que aplican AHORA MISMO.
     * Si la tienda está cerrada, retorna array vacío (no se muestra nada).
     */
    public function currentVisibilityLevels(): array
    {
        $openWindow = RedemptionWindow::open()->first();

        // La tienda está cerrada: no se muestran premios
        if (!$openWindow) {
            return [];
        }

        // Siempre se muestran los premios 'always'
        $levels = ['always'];

        $cycle = RedemptionCycle::where('id', $openWindow->cycle_id)
            ->where('is_active', true)
            ->first();

        if (!$cycle) {
            return $levels;
        }

        // ¿Es esta la última ventana del ciclo actual?
        $isLastWindowOfCycle = !RedemptionWindow::where('cycle_id', $cycle->id)
            ->where('opens_at', '>', $openWindow->closes_at)
            ->exists();

        if ($isLastWindowOfCycle) {
            $levels[] = 'cycle_end';

            // ¿Además es el último ciclo activo de la campaña?
            $campaign = Campaign::current()->first();

            if ($campaign) {
                $isLastCycleOfCampaign = !RedemptionCycle::where('campaign_id', $campaign->id)
                    ->where('is_active', true)
                    ->where('start_date', '>', $cycle->end_date)
                    ->exists();

                if ($isLastCycleOfCampaign) {
                    $levels[] = 'campaign_end';
                }
            }
        }

        return $levels;
    }

    /**
     * Para la vista de admin, retorna todos los niveles (ve todo).
     */
    public function allLevels(): array
    {
        return ['always', 'cycle_end', 'campaign_end'];
    }
}