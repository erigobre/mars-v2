<?php

namespace App\Services\Analytics;

use App\Models\Campaign;
use App\Models\Distributor;
use App\Models\Seller;
use Illuminate\Support\Facades\Cache;

/**
 * SellerAdoptionService
 *
 * Responde a las preguntas de negocio:
 *   1. ¿Cuántos vendedores están registrados?
 *   2. ¿Cuántos iniciaron sesión alguna vez?
 *   3. ¿Cuántos aceptaron términos y condiciones?
 *   4. ¿Cuántos iniciaron sesión pero NO aceptaron términos?
 *   5. ¿Cuántos están activos en la campaña actual (o un rango)?
 *
 * Todo filtrable por:
 *   - distributor_id  (compañía)
 *   - campaign_id     (rango de fechas de la campaña)
 *   - date_from / date_to  (rango manual)
 *
 * IMPORTANTE: Solo aplica a vendedores (role slug = 'seller').
 */
class SellerAdoptionService
{
    private const CACHE_TTL = 300; // 5 minutos

    // ─────────────────────────────────────────────────────────────
    // PUNTO DE ENTRADA PRINCIPAL
    // ─────────────────────────────────────────────────────────────

    /**
     * Reporte completo de adopción.
     *
     * @param  int|null    $distributorId  Filtrar por empresa/distribuidor
     * @param  int|null    $campaignId     Acotar rango al de esa campaña
     * @param  string|null $dateFrom       Fecha inicio manual (Y-m-d)
     * @param  string|null $dateTo         Fecha fin manual (Y-m-d)
     */
    public function getAdoptionReport(
        ?int    $distributorId = null,
        ?int    $campaignId    = null,
        ?string $dateFrom      = null,
        ?string $dateTo        = null,
    ): array {
        $cacheKey = "adoption:report:{$distributorId}:{$campaignId}:{$dateFrom}:{$dateTo}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function ()
        use ($distributorId, $campaignId, $dateFrom, $dateTo) {

            [$rangeFrom, $rangeTo, $campaignName] =
                $this->resolveRange($campaignId, $dateFrom, $dateTo);

            return [
                'filters' => [
                    'distributor_id'   => $distributorId,
                    'distributor_name' => $distributorId
                        ? Distributor::find($distributorId)?->company_name
                        : null,
                    'campaign_id'   => $campaignId,
                    'campaign_name' => $campaignName,
                    'date_from'     => $rangeFrom,
                    'date_to'       => $rangeTo,
                ],
                'funnel'      => $this->getFunnel($distributorId, $rangeFrom, $rangeTo),
                'by_company'  => $this->getBreakdownByCompany($rangeFrom, $rangeTo),
                'detail'      => [
                    'never_logged_in'        => $this->getSellerList('never_logged_in',        $distributorId, $rangeFrom, $rangeTo),
                    'logged_no_terms'        => $this->getSellerList('logged_no_terms',         $distributorId, $rangeFrom, $rangeTo),
                    'accepted_terms'         => $this->getSellerList('accepted_terms',          $distributorId, $rangeFrom, $rangeTo),
                    'active_in_period'       => $this->getSellerList('active_in_period',        $distributorId, $rangeFrom, $rangeTo),
                    'registered_in_period'   => $this->getSellerList('registered_in_period',   $distributorId, $rangeFrom, $rangeTo),
                ],
            ];
        });
    }

    // ─────────────────────────────────────────────────────────────
    // FUNNEL DE ADOPCIÓN
    // ─────────────────────────────────────────────────────────────

    /**
     * Devuelve los conteos del funnel completo.
     *
     *  total_registered
     *      └─ logged_in_ever          (alguna vez iniciaron sesión)
     *          └─ accepted_terms      (aceptaron T&C)
     *              └─ active_period   (usaron la plataforma en el rango)
     *      └─ never_logged_in         (nunca han entrado)
     *      └─ logged_no_terms         (entraron pero NO aceptaron T&C)
     */
    public function getFunnel(
        ?int    $distributorId,
        ?string $dateFrom,
        ?string $dateTo,
    ): array {
        // Base: todos los vendedores activos
        $base = $this->sellerBaseQuery($distributorId);

        $totalRegistered = (clone $base)->count();

        // --- Iniciaron sesión alguna vez ---
        $loggedInEver = (clone $base)
            ->whereHas('user', fn($q) => $q->whereNotNull('last_login_at'))
            ->count();

        $neverLoggedIn = $totalRegistered - $loggedInEver;

        // --- Aceptaron términos ---
        $acceptedTerms = (clone $base)
            ->where('terms_accepted', true)
            ->count();

        // --- Entraron pero NO aceptaron términos ---
        $loggedNoTerms = (clone $base)
            ->whereHas('user', fn($q) => $q->whereNotNull('last_login_at'))
            ->where('terms_accepted', false)
            ->count();

        // --- Registrados dentro del rango ---
        $registeredInPeriod = $this->countRegisteredInPeriod($distributorId, $dateFrom, $dateTo);

        // --- Activos en el rango (iniciaron sesión dentro del rango) ---
        $activeInPeriod = $this->countActiveInPeriod($distributorId, $dateFrom, $dateTo);

        // --- Tasas ---
        $loginRate        = $this->pct($loggedInEver,  $totalRegistered);
        $termsAcceptRate  = $this->pct($acceptedTerms, $totalRegistered);
        $platformUsageRate = $this->pct($activeInPeriod, $totalRegistered);

        return [
            'total_registered'        => $totalRegistered,
            'never_logged_in'         => $neverLoggedIn,
            'logged_in_ever'          => $loggedInEver,
            'accepted_terms'          => $acceptedTerms,
            'logged_no_terms'         => $loggedNoTerms,
            'registered_in_period'    => $registeredInPeriod,
            'active_in_period'        => $activeInPeriod,
            'rates' => [
                'login_rate'           => $loginRate,
                'terms_acceptance_rate' => $termsAcceptRate,
                'platform_usage_rate'  => $platformUsageRate,
            ],
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // DESGLOSE POR COMPAÑÍA (DISTRIBUIDOR)
    // ─────────────────────────────────────────────────────────────

    /**
     * El mismo funnel pero agrupado por distribuidor.
     * Útil para el admin que quiere ver empresa por empresa.
     */
    public function getBreakdownByCompany(?string $dateFrom, ?string $dateTo): array
    {
        $distributors = Distributor::with('user')
            ->withCount([
                // Total de vendedores
                'sellers as total_sellers',

                // Vendedores que han iniciado sesión alguna vez
                'sellers as logged_in_ever' => fn($q) =>
                $q->whereHas('user', fn($u) => $u->whereNotNull('last_login_at')),

                // Aceptaron términos
                'sellers as accepted_terms' => fn($q) =>
                $q->where('terms_accepted', true),

                // Iniciaron sesión pero NO aceptaron términos
                'sellers as logged_no_terms' => fn($q) =>
                $q->whereHas('user', fn($u) => $u->whereNotNull('last_login_at'))
                    ->where('terms_accepted', false),
            ])
            ->get();

        return $distributors->map(function ($dist) use ($dateFrom, $dateTo) {
            $activeInPeriod = $this->countActiveInPeriod($dist->id, $dateFrom, $dateTo);

            return [
                'distributor_id'   => $dist->id,
                'distributor_name' => $dist->company_name,
                'total_sellers'    => $dist->total_sellers,
                'logged_in_ever'   => $dist->logged_in_ever,
                'never_logged_in'  => $dist->total_sellers - $dist->logged_in_ever,
                'accepted_terms'   => $dist->accepted_terms,
                'logged_no_terms'  => $dist->logged_no_terms,
                'active_in_period' => $activeInPeriod,
                'rates' => [
                    'login_rate'            => $this->pct($dist->logged_in_ever, $dist->total_sellers),
                    'terms_acceptance_rate' => $this->pct($dist->accepted_terms, $dist->total_sellers),
                    'platform_usage_rate'   => $this->pct($activeInPeriod, $dist->total_sellers),
                ],
            ];
        })->values()->toArray();
    }

    // ─────────────────────────────────────────────────────────────
    // LISTAS DETALLADAS DE VENDEDORES
    // ─────────────────────────────────────────────────────────────

    /**
     * Devuelve la lista de vendedores según el segmento solicitado.
     *
     * Segmentos:
     *  - 'never_logged_in'       nunca iniciaron sesión
     *  - 'logged_no_terms'       iniciaron sesión pero no aceptaron T&C
     *  - 'accepted_terms'        aceptaron T&C
     *  - 'active_in_period'      iniciaron sesión dentro del rango
     *  - 'registered_in_period'  se registraron dentro del rango
     */
    public function getSellerList(
        string  $segment,
        ?int    $distributorId,
        ?string $dateFrom,
        ?string $dateTo,
        int     $limit = 200,
    ): array {
        $query = $this->sellerBaseQuery($distributorId)
            ->with(['user', 'distributor']);

        match ($segment) {
            'never_logged_in' =>
            $query->whereHas('user', fn($q) => $q->whereNull('last_login_at')),

            'logged_no_terms' =>
            $query->whereHas('user', fn($q) => $q->whereNotNull('last_login_at'))
                ->where('terms_accepted', false),

            'accepted_terms' =>
            $query->where('terms_accepted', true),

            'active_in_period' =>
            $query->whereHas('user', function ($q) use ($dateFrom, $dateTo) {
                $q->whereNotNull('last_login_at');
                if ($dateFrom) $q->whereDate('last_login_at', '>=', $dateFrom);
                if ($dateTo)   $q->whereDate('last_login_at', '<=', $dateTo);
            }),

            'registered_in_period' =>
            $query->whereHas('user', function ($q) use ($dateFrom, $dateTo) {
                if ($dateFrom) $q->whereDate('created_at', '>=', $dateFrom);
                if ($dateTo)   $q->whereDate('created_at', '<=', $dateTo);
            }),

            default => null,
        };

        return $query->limit($limit)->get()->map(fn($seller) => [
            'seller_id'        => $seller->id,
            'name'             => $seller->user->username,
            'email'            => $seller->user->email,
            'phone'            => $seller->user->phone,
            'employee_code'    => $seller->employee_code,
            'distributor_name' => $seller->distributor?->company_name,
            'terms_accepted'   => $seller->terms_accepted,
            'last_login_at'    => $seller->user->last_login_at?->toISOString(),
            'registered_at'    => $seller->user->created_at?->toISOString(),
            'is_active'        => $seller->user->is_active,
        ])->toArray();
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS PRIVADOS
    // ─────────────────────────────────────────────────────────────

    /**
     * Query base: SOLO vendedores (con su usuario activo).
     */
    private function sellerBaseQuery(?int $distributorId)
    {
        $query = Seller::whereHas('user', fn($q) => $q->where('is_active', true));

        if ($distributorId) {
            $query->where('distributor_id', $distributorId);
        }

        return $query;
    }

    /**
     * Cuenta vendedores que iniciaron sesión dentro del rango dado.
     * Usa last_login_at (columna ya existente en users).
     */
    private function countActiveInPeriod(
        ?int    $distributorId,
        ?string $dateFrom,
        ?string $dateTo,
    ): int {
        // Si no hay rango definido no tiene sentido filtrar
        if (!$dateFrom && !$dateTo) return 0;

        $query = $this->sellerBaseQuery($distributorId)
            ->whereHas('user', function ($q) use ($dateFrom, $dateTo) {
                $q->whereNotNull('last_login_at');
                if ($dateFrom) $q->whereDate('last_login_at', '>=', $dateFrom);
                if ($dateTo)   $q->whereDate('last_login_at', '<=', $dateTo);
            });

        return $query->count();
    }

    /**
     * Cuenta vendedores registrados dentro del rango dado.
     */
    private function countRegisteredInPeriod(
        ?int    $distributorId,
        ?string $dateFrom,
        ?string $dateTo,
    ): int {
        if (!$dateFrom && !$dateTo) return 0;

        $query = $this->sellerBaseQuery($distributorId)
            ->whereHas('user', function ($q) use ($dateFrom, $dateTo) {
                if ($dateFrom) $q->whereDate('created_at', '>=', $dateFrom);
                if ($dateTo)   $q->whereDate('created_at', '<=', $dateTo);
            });

        return $query->count();
    }

    /**
     * Resuelve el rango de fechas a usar.
     * Prioridad: fechas manuales > fechas de campaña > sin rango.
     */
    private function resolveRange(
        ?int    $campaignId,
        ?string $dateFrom,
        ?string $dateTo,
    ): array {
        // Rango manual tiene prioridad
        if ($dateFrom || $dateTo) {
            return [$dateFrom, $dateTo, null];
        }

        // Si viene campaignId, usar sus fechas
        if ($campaignId) {
            $campaign = Campaign::find($campaignId);
            if ($campaign) {
                return [
                    $campaign->start_date->toDateString(),
                    $campaign->end_date->toDateString(),
                    $campaign->name,
                ];
            }
        }

        // Sin rango
        return [null, null, null];
    }

    private function pct(int $part, int $total): float
    {
        return $total > 0 ? round(($part / $total) * 100, 1) : 0.0;
    }

    // ─────────────────────────────────────────────────────────────
    // LISTA PAGINADA Y EXPORTACIÓN CON ESTADO
    // ─────────────────────────────────────────────────────────────

    public function buildStatusListQuery(array $filters)
    {
        $query = Seller::query()
            ->with(['user', 'distributor'])
            ->whereHas('user', fn($q) => $q->where('is_active', true));

        if (!empty($filters['distributor_id'])) {
            $query->where('distributor_id', $filters['distributor_id']);
        }

        if (!empty($filters['status'])) {
            match ($filters['status']) {
                'sin_ingreso'   => $query->whereHas('user', fn($q) => $q->whereNull('last_login_at')),
                'acepto_tyc'    => $query->where('terms_accepted', true),
                'no_acepto_tyc' => $query->where('terms_accepted', false)
                                         ->whereHas('user', fn($q) => $q->whereNotNull('last_login_at')),
                default         => null,
            };
        }

        if (!empty($filters['search'])) {
            $like = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($like) {
                $q->whereHas('user', fn($uq) =>
                    $uq->where('username', 'like', $like)
                       ->orWhere('email',    'like', $like)
                       ->orWhere('phone',    'like', $like)
                )->orWhere('employee_code', 'like', $like);
            });
        }

        // Ordenar: los que nunca han entrado primero, luego por último acceso desc
        return $query->orderByRaw(
            'CASE WHEN (SELECT last_login_at FROM users WHERE users.id = sellers.user_id) IS NULL THEN 0 ELSE 1 END ASC,
             (SELECT last_login_at FROM users WHERE users.id = sellers.user_id) DESC'
        );
    }

    public function formatSellerStatus(Seller $seller): array
    {
        $user        = $seller->user;
        $lastLoginAt = $user->last_login_at;

        $status = match (true) {
            is_null($lastLoginAt)   => 'sin_ingreso',
            $seller->terms_accepted => 'acepto_tyc',
            default                 => 'no_acepto_tyc',
        };

        $statusLabels = [
            'sin_ingreso'   => 'Sin Ingreso',
            'acepto_tyc'    => 'Aceptó TyC',
            'no_acepto_tyc' => 'No Aceptó TyC',
        ];

        return [
            'sellerId'        => $seller->id,
            'employeeCode'    => $seller->employee_code,
            'name'            => $user->username,
            'email'           => $user->email,
            'phone'           => $user->phone,
            'distributorId'   => $seller->distributor_id,
            'distributorName' => $seller->distributor?->company_name,
            'status'          => $status,
            'statusLabel'     => $statusLabels[$status],
            'termsAccepted'   => $seller->terms_accepted,
            'lastLoginAt'     => $lastLoginAt?->toIso8601String(),
            'registeredAt'    => $user->created_at?->toIso8601String(),
            'currentPoints'   => (int) $seller->current_points,
        ];
    }

    public function getStatusSummary(?int $distributorId): array
    {
        $base = Seller::query()->whereHas('user', fn($q) => $q->where('is_active', true));

        if ($distributorId) {
            $base->where('distributor_id', $distributorId);
        }

        $total = (clone $base)->count();

        return [
            'total'       => $total,
            'sinIngreso'  => (clone $base)->whereHas('user', fn($q) => $q->whereNull('last_login_at'))->count(),
            'aceptoTyc'   => (clone $base)->where('terms_accepted', true)->count(),
            'noAceptoTyc' => (clone $base)->where('terms_accepted', false)
                                           ->whereHas('user', fn($q) => $q->whereNotNull('last_login_at'))
                                           ->count(),
        ];
    }
}
