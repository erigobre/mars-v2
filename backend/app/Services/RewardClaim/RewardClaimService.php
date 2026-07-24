<?php

namespace App\Services\RewardClaim;

use App\Enums\PointTransactionTypes;
use App\Enums\RewardClaimStatus;
use App\Mail\RewardClaimConfirmedMail;
use App\Mail\SellerRewardClaimMail;
use App\Models\PointTransaction;
use App\Models\RedemptionCycle;
use App\Models\RedemptionWindow;
use App\Models\Reward;
use App\Models\RewardClaim;
use App\Models\Seller;
use App\Services\RewardClaim\RewardVisibilityService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class RewardClaimService
{
    const RESERVATION_TTL_MINUTES = 30;

    public function __construct(
        protected RewardVisibilityService $visibilityService
    ) {}

    /**
     * Verifica si el vendedor puede canjear un premio SIN reservar stock.
     * Muestra el estado en el frontend antes de que el usuario decida.
     *
     * GET /reward-claims/eligibility/{rewardId}
     *
     * Retorna un array con:
     *   canClaim        bool   puede proceder con la reserva
     *   hasShippingData bool   tiene dirección guardada (para saber si mostrar el form)
     *   reasons         array  lista de razones de bloqueo (vacía si canClaim=true)
     */
    public function checkEligibility(int $sellerId, int $rewardId): array
    {
        $reasons  = [];
        $seller   = Seller::with('user')->find($sellerId);
        $reward   = Reward::with('tierPrices')->find($rewardId);

        $openWindow = RedemptionWindow::open()->exists();

        // Ventana abierta
        if (!$openWindow) {
            $next = RedemptionWindow::where('opens_at', '>', now())
                ->orderBy('opens_at')
                ->first();
            $reasons[] = [
                'code'    => 'store_closed',
                'message' => 'La tienda no está abierta en este momento.',
                'detail'  => $next ? "Próxima apertura: {$next->opens_at->toISOString()}" : null,
            ];
        }

        // Premio visible en este momento
        if ($openWindow) {
            $visibleLevels = $this->visibilityService->currentVisibilityLevels();
            if ($reward && !in_array($reward->visibility, $visibleLevels)) {
                $reasons[] = [
                    'code'    => 'reward_not_visible',
                    'message' => 'Este premio no está disponible en este momento.',
                ];
            }
        }

        if (!$reward || !$reward->is_active) {
            $reasons[] = ['code' => 'reward_unavailable', 'message' => 'El premio no está disponible.'];
        } else {
            if ($reward->stock <= 0) {
                $reasons[] = ['code' => 'out_of_stock', 'message' => "El premio '{$reward->name}' está agotado."];
            }
            if (!$reward->hasGlobalStock()) {
                $reasons[] = ['code' => 'global_limit_reached', 'message' => "El premio '{$reward->name}' ya alcanzó el límite de canjes."];
            }
        }

        // Puntos suficientes
        if ($reward && $seller) {
            $effectivePrice = $reward->getPriceForSeller($seller);
            if ($seller->current_points < $effectivePrice) {
                $reasons[] = [
                    'code'    => 'insufficient_points',
                    'message' => "Necesitas {$effectivePrice} pts, tienes {$seller->current_points} pts.",
                ];
            }
        }

        $pendingClaim = RewardClaim::with(['reward'])->where('seller_id', $sellerId)
            ->where('status', RewardClaimStatus::RESERVED->value)
            ->where('reserved_until', '>', now())
            ->first();

        if ($pendingClaim) {
            $reasons[] = [
                'code'    => 'pending_reservation',
                'message' => 'Debes confirmar tu reserva actual antes de solicitar otro premio.',
                'detail'  => "Folio: {$pendingClaim->folio}",
            ];
        }

        // Ya canjeó / ya tiene reserva activa este ciclo
        // $cycle = RedemptionCycle::current()->first();

        // if ($cycle) {


        //     $existingClaim = RewardClaim::where('seller_id', $sellerId)
        //         ->where('redemption_cycle_id', $cycle->id)
        //         ->whereBlockingStatus()
        //         ->first();

        //     if ($existingClaim) {
        //         $isReserved = $existingClaim->status === RewardClaimStatus::RESERVED;
        //         $reasons[]  = [
        //             'code' => $isReserved ? 'pending_reservation' : 'already_claimed',
        //             'message' => $isReserved
        //                 ? 'Tienes una reserva pendiente de confirmar.'
        //                 : 'Ya canjeaste en esta quincena.',
        //             'claim_id' => $isReserved ? $existingClaim->id : null,
        //             'expires_at' => $isReserved ? $existingClaim->reserved_until?->toISOString() : null,
        //         ];
        //     }
        // }

        // Estado de datos de envío (no bloquea el eligibility, pero el frontend lo usa)
        $hasShippingData = $seller && !empty($seller->address_street)
            && !empty($seller->address_city)
            && !empty($seller->address_zip);

        return [
            'canClaim'       => empty($reasons),
            'hasShippingData' => $hasShippingData,
            'reasons'        => $reasons, // array { code, message, detail?, claim_id?, expires_at? }
            'reward'         => $reward ? [
                'id'             => $reward->id,
                'name'           => $reward->name,
                'pointsRequired' => $reward && $seller ? $reward->getPriceForSeller($seller) : $reward?->points_required,
                'stock'          => $reward->stock,
            ] : null,
            'pendingClaim'    => $pendingClaim
        ];
    }

    /**
     * Reserva el stock del premio para el vendedor.
     *
     * POST /reward-claims/reserve
     * Body: { rewardId: int }
     *
     * ✓ Decrementa stock de forma atómica con lockForUpdate
     * ✓ Descuenta los puntos del vendedor inmediatamente
     * ✓ Crea el claim con status=reserved y TTL de 30 min
     * ✓ La dirección se captura en la FASE 2 (confirm)
     *
     * Si el vendedor ya tiene una reserva activa para este ciclo,
     * devuelve esa misma reserva (idempotente).
     *
     * @throws Exception
     */
    public function reserve(int $sellerId, int $rewardId): RewardClaim
    {
        return DB::transaction(function () use ($sellerId, $rewardId) {

            // Ventana abierta
            $window = RedemptionWindow::open()->lockForUpdate()->first();
            if (!$window) {
                throw new Exception('La tienda de puntos no está disponible en este momento.');
            }

            // Ciclo activo
            $cycle = RedemptionCycle::current()
                ->where('id', $window->cycle_id)
                ->first();
            if (!$cycle) {
                throw new Exception('No hay un ciclo de canje activo.');
            }

            $pending = RewardClaim::where('seller_id', $sellerId)
                ->where('status', RewardClaimStatus::RESERVED->value)
                ->where('reserved_until', '>', now())
                ->first();

            if ($pending) {
                if ($pending->reward_id === $rewardId) return $pending->load(['reward', 'cycle']);
                throw new Exception("Tienes una reserva pendiente (Folio: {$pending->folio}). Confírmala antes de elegir otro premio.");
            }

            // $existing = RewardClaim::where('seller_id', $sellerId)
            //     ->where('redemption_cycle_id', $cycle->id)
            //     ->where('status', RewardClaimStatus::RESERVED->value)
            //     ->where('reserved_until', '>', now())
            //     ->first();

            // if ($existing) {
            //     if ($existing->reward_id === $rewardId) {
            //         return $existing->load(['reward', 'cycle']);
            //     }
            //     throw new Exception(
            //         'Ya tienes una reserva activa para esta quincena. ' .
            //             'Confírmala o espera a que expire para elegir otro premio.'
            //     );
            // }

            // // Límite de 1 canje por ciclo
            // $alreadyClaimed = RewardClaim::where('seller_id', $sellerId)
            //     ->where('redemption_cycle_id', $cycle->id)
            //     ->whereBlockingStatus()
            //     ->exists();

            // if ($alreadyClaimed) {
            //     throw new Exception('Ya realizaste o reservaste un canje en este ciclo.');
            // }

            // Premio con lockForUpdate
            $reward = Reward::with('tierPrices')->lockForUpdate()->find($rewardId);

            if (!$reward || !$reward->is_active) {
                throw new Exception('El premio seleccionado no está disponible.');
            }

            // Verificar visibilidad en la ventana actual
            $visibleLevels = $this->visibilityService->currentVisibilityLevels();
            if (!in_array($reward->visibility, $visibleLevels)) {
                throw new Exception('Este premio no está disponible en este momento.');
            }

            if ($reward->stock <= 0) {
                throw new Exception("El premio '{$reward->name}' está agotado.");
            }

            if (!$reward->hasGlobalStock()) {
                throw new Exception("El premio '{$reward->name}' ya alcanzó el límite global de canjes.");
            }

            // ── Seller con lockForUpdate ─────────────────────────
            $seller = Seller::lockForUpdate()->with('user')->findOrFail($sellerId);

            $pointsSpent = $reward->getPriceForSeller($seller);

            if ($seller->current_points < $pointsSpent) {
                throw new Exception(
                    "Puntos insuficientes. Tienes {$seller->current_points} pts " .
                        "y el premio requiere {$pointsSpent} pts."
                );
            }

            $newBalance  = $seller->current_points - $pointsSpent;

            // Descontar puntos
            $seller->decrement('current_points', $pointsSpent);

            // Descontar stock e incrementar total_claimed
            $reward->decrement('stock');
            $reward->increment('total_claimed');

            // Transacción de puntos
            PointTransaction::create([
                'seller_id'     => $seller->id,
                'amount'        => -$pointsSpent,
                'type'          => PointTransactionTypes::STORE_PURCHASE->value,
                'balance_after' => $newBalance,
                'sale_id'       => null,
            ]);

            // Crear claim reservado
            $claim = RewardClaim::create([
                'redemption_cycle_id' => $cycle->id,
                'seller_id'           => $seller->id,
                'reward_id'           => $reward->id,
                'folio'               => $this->generateFolio(),
                'points_spent'        => $pointsSpent,
                'status'              => RewardClaimStatus::RESERVED->value,
                'reserved_until'      => now()->addMinutes(self::RESERVATION_TTL_MINUTES),
            ]);

            return $claim->load(['reward', 'cycle']);
        });
    }

    public function confirm(RewardClaim $claim, array $shippingData, bool $saveToProfile = false): RewardClaim
    {
        // Verificar que la reserva pertenece al vendedor autenticado
        if ($claim->seller_id !== auth()->user()->seller?->id) {
            throw new Exception('No tienes permiso para confirmar este canje.', 403);
        }

        if ($claim->status !== RewardClaimStatus::RESERVED) {
            throw new Exception('Este canje ya fue confirmado o no está pendiente de confirmación.');
        }

        if ($claim->reserved_until && $claim->reserved_until->isPast()) {
            throw new Exception(
                'La reserva expiró. El stock fue liberado automáticamente. ' .
                    'Inicia un nuevo canje si aún hay disponibilidad.'
            );
        }

        $confirmedClaim = DB::transaction(function () use ($claim, $shippingData, $saveToProfile) {

            // Guardar snapshot de dirección en el canje
            $claim->update([
                'status'           => RewardClaimStatus::PENDING->value,
                'reserved_until'   => null,   // ya no necesita TTL
                'shipping_name'    => $shippingData['shipping_name'],
                'shipping_street'  => $shippingData['shipping_street'],
                'shipping_colonia' => $shippingData['shipping_colonia'],
                'shipping_city'    => $shippingData['shipping_city'],
                'shipping_state'   => $shippingData['shipping_state'],
                'shipping_zip'     => $shippingData['shipping_zip'],
            ]);

            // Opcionalmente actualizar perfil del vendedor para futuros canjes
            if ($saveToProfile) {
                $claim->seller->update([
                    'address_street'  => $shippingData['shipping_street'],
                    'address_colonia' => $shippingData['shipping_colonia'],
                    'address_city'    => $shippingData['shipping_city'],
                    'address_state'   => $shippingData['shipping_state'],
                    'address_zip'     => $shippingData['shipping_zip'],
                    'shipping_notes'  => $shippingData['shipping_notes'] ?? null,
                ]);
            }

            return $claim->fresh(['reward', 'seller.user', 'cycle']);
        });

        if (app()->environment('production')) {
            $destinatario = 'elopez@hydis.mx';
            Mail::to($destinatario)->queue(new RewardClaimConfirmedMail($confirmedClaim));

            $sellerEmail = $confirmedClaim->seller->user->email;
            if ($sellerEmail) {
                Mail::to($sellerEmail)->queue(new SellerRewardClaimMail($confirmedClaim));
            }
        }

        return $confirmedClaim;
    }

    public function cancelReservation(RewardClaim $claim): RewardClaim
    {
        if ($claim->seller_id !== auth()->user()->seller?->id) {
            throw new Exception('No tienes permiso para cancelar este canje.', 403);
        }

        // Solo se pueden cancelar las que están reservadas
        if ($claim->status !== RewardClaimStatus::RESERVED) {
            throw new Exception('Solo se pueden cancelar reservas pendientes de confirmación.');
        }

        return DB::transaction(function () use ($claim) {
            // Devolver puntos y stock reutilizando tu método privado
            $this->refundClaim($claim);

            // Actualizar el estado del claim
            $claim->update([
                'status'         => RewardClaimStatus::CANCELLED->value,
                'notes'          => 'Reserva cancelada por el usuario.',
                'reserved_until' => null,
            ]);

            return $claim->fresh(['reward', 'seller.user', 'cycle']);
        });
    }

    public function updateStatus(RewardClaim $claim, string $status, ?string $notes = null, ?string $carrier = null, ?string $trackingNumber = null): RewardClaim
    {
        return DB::transaction(function () use ($claim, $status, $notes, $carrier, $trackingNumber) {
            $oldStatus = $claim->status->value;

            if ($status === RewardClaimStatus::REJECTED->value && $oldStatus !== RewardClaimStatus::REJECTED->value) {
                $this->refundClaim($claim);
            }

            $claim->update([
                'status' => $status,
                'notes'  => $notes ?? $claim->notes,
                'carrier' => $carrier ?? $claim->carrier,
                'tracking_number' => $trackingNumber ?? $claim->tracking_number,
            ]);

            return $claim->fresh(['reward', 'seller.user']);
        });
    }

    public function releaseExpiredReservations(): int
    {
        $expired = RewardClaim::where('status', RewardClaimStatus::RESERVED->value)
            ->where('reserved_until', '<', now())
            ->with(['seller', 'reward'])
            ->get();

        foreach ($expired as $claim) {
            try {
                $this->updateStatus(
                    $claim,
                    RewardClaimStatus::REJECTED->value,
                    'Reserva expirada automáticamente por falta de confirmación.'
                );
            } catch (\Exception $e) {
                Log::error("Error al liberar canje {$claim->id}: " . $e->getMessage());
            }
        }

        return $expired->count();
    }

    private function generateFolio(): string
    {
        do {
            $folio = 'CNJ-' . strtoupper(Str::random(8));
        } while (RewardClaim::where('folio', $folio)->exists());

        return $folio;
    }

    /**
     * Lógica reutilizable para devolver puntos y stock
     */
    private function refundClaim(RewardClaim $claim): void
    {
        $claim->reward()->increment('stock');
        $claim->reward()->decrement('total_claimed');

        $claim->seller()->increment('current_points', $claim->points_spent);

        $seller = $claim->seller->fresh();

        PointTransaction::create([
            'seller_id'     => $seller->id,
            'amount'        => +$claim->points_spent,
            'type'          => PointTransactionTypes::RESERVATION_EXPIRED->value,
            'balance_after' => $seller->current_points, // Usamos el valor real de la DB
            'sale_id'       => null,
        ]);
    }
}
