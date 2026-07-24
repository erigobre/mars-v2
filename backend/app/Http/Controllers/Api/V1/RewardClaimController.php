<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\RewardClaim\ConfirmRewardClaimRequest;
use App\Http\Requests\Api\V1\RewardClaim\ReserveRewardClaimRequest;
use App\Http\Requests\Api\V1\RewardClaim\UpdateRewardClaimRequest;
use App\Http\Resources\V1\Reward\RewardClaimResource;
use App\Http\Resources\V1\Reward\RewardEligibilityResource;
use App\Models\RewardClaim;
use App\Services\RewardClaim\RewardClaimService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class RewardClaimController extends ApiController
{
    public function __construct(protected RewardClaimService $claimService) {}

    /**
     * GET /reward-claims/eligibility/{rewardId}
     *
     * Verifica si el vendedor autenticado puede canjear el premio indicado.
     * NO tiene efectos secundarios — no reserva nada, no consume puntos.
     */
    public function eligibility(int $rewardId)
    {
        $sellerId = auth()->user()->seller->id;

        $result = $this->claimService->checkEligibility($sellerId, $rewardId);

        return $this->successResponse(
            'Elegibilidad verificada exitosamente.',
            new RewardEligibilityResource($result)
        );
    }

    /**
     * POST /reward-claims/reserve
     *
     * FASE 1: Reserva atómica del stock.
     * Decrementa stock y puntos, crea claim con status=reserved y TTL de 30 min.
     * El vendedor tiene 30 minutos para confirmar con su dirección de envío.
     */
    public function reserve(ReserveRewardClaimRequest $request)
    {
        $seller   = auth()->user()->seller;
        $rewardId = $request->input('reward_id');

        try {
            $claim = $this->claimService->reserve($seller->id, $rewardId);

            return $this->created(
                // new RewardReservationResource($claim),
                new RewardClaimResource($claim),
                "Reserva creada. Folio: {$claim->folio}. Completa tu dirección de envío para confirmar el canje."
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function confirm(ConfirmRewardClaimRequest $request, RewardClaim $claim)
    {
        try {
            $confirmed = $this->claimService->confirm(
                claim: $claim,
                shippingData: $request->shippingData(),
                saveToProfile: $request->boolean('save_to_profile', false),
            );

            return $this->successResponse(
                "Canje confirmado. Folio: {$confirmed->folio}. Estado: PENDIENTE.",
                new RewardClaimResource($confirmed)
            );
        } catch (\Exception $e) {
            $code = $e->getCode() ?: 422;
            return $this->errorResponse($e->getMessage(), $code);
        }
    }

    public function cancel(Request $request, RewardClaim $claim)
    {
        try {
            $cancelled = $this->claimService->cancelReservation($claim);

            return $this->successResponse(
                "Reserva cancelada. El stock y tus puntos han sido restaurados.",
                new RewardClaimResource($cancelled)
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function downloadReceipt(Request $request, RewardClaim $claim)
    {
        $user = $request->user();

        // Validar permisos: Solo el dueño del canje o un admin pueden descargarlo
        if ($user->isSeller() && $claim->seller_id !== $user->seller?->id) {
            return $this->errorResponse('No tienes permiso para descargar este comprobante.', 403);
        }

        if ($user->isDistributor() && $claim->seller->distributor_id !== $user->distributor?->id) {
            return $this->errorResponse('No tienes permiso para descargar este comprobante.', 403);
        }

        // Cargar las relaciones que necesita tu vista Blade
        $claim->load(['reward', 'seller.user']);

        $imagenBase64 = null;
        if ($claim->reward && $claim->reward->image_url) {
            try {
                // Leemos el archivo directamente usando el disco de Laravel (ignora symlinks)
                $fileContent = Storage::disk('public')->get($claim->reward->image_url);

                if ($fileContent) {
                    // Usamos Intervention Image para convertir el WebP a JPEG en memoria
                    $manager = new ImageManager(new Driver());
                    $img = $manager->read($fileContent);

                    // Lo codificamos a Base64 como JPEG (Calidad 80 para no pesar mucho)
                    $base64Data = base64_encode($img->toJpeg(80)->toString());
                    $imagenBase64 = 'data:image/jpeg;base64,' . $base64Data;
                }
            } catch (\Exception $e) {
                Log::error('Error convirtiendo imagen para PDF: ' . $e->getMessage());
            }
        }

        // Generar el PDF
        $pdf = Pdf::loadView('pdfs.receipt', [
            'claim' => $claim,
            'imagenBase64' => $imagenBase64
        ]);

        // Configurar el tamaño del papel (A4, portrait)
        $pdf->setPaper('a4', 'portrait');

        $nombreUsuario = $claim->shipping_name ?? $claim->seller->user->username;

        $nombreLimpio = Str::slug($nombreUsuario);

        $fecha = now()->format('Ymd');

        $nombreArchivo = "Comprobante_{$claim->folio}_{$nombreLimpio}_{$fecha}.pdf";

        // Retornar el archivo PDF para su descarga
        return $pdf->download($nombreArchivo);
    }

    /**
     * GET /api/v1/reward-claims/export
     *
     * Exporta todos los canjes a Excel.
     * Solo Admin y Logística pueden acceder.
     */
    public function export(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isAdmin() && !$user->isLogistics()) {
            return $this->errorResponse('No tienes permiso para descargar este reporte.', 403);
        }

        $fileName = 'Reporte_Canjes_' . now()->format('Y_m_d_His') . '.xlsx';
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\RewardClaimsExport, $fileName);
    }

    /**
     * GET /api/v1/reward-claims
     *
     * - Admin: todos los canjes con filtros opcionales
     * - Distribuidor: canjes de sus vendedores
     * - Vendedor: solo sus propios canjes
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', RewardClaim::class);

        $user     = $request->user();
        $perPage  = $request->integer('per_page', 15);

        $query = RewardClaim::with(['reward', 'seller.user', 'cycle'])
            ->latest('claimed_at');

        if ($user->isDistributor()) {
            $distId = $user->distributor?->id;
            if (!$distId) return $this->notFound('Distribuidor no encontrado.');

            $query->whereHas('seller', fn($q) => $q->where('distributor_id', $distId));
        }

        if ($user->isSeller()) {
            $sellerId = $user->seller?->id;
            if (!$sellerId) return $this->notFound('Perfil de vendedor no encontrado.');

            $query->where('seller_id', $sellerId);
        }


        $claims = $query->paginate($perPage);

        return $this->successResponse(
            'Canjes obtenidos exitosamente.',
            RewardClaimResource::collection($claims)->response()->getData(true)
        );
    }

    /**
     * GET /api/v1/reward-claims/{claim}
     */
    public function show(Request $request, RewardClaim $claim)
    {
        $this->authorize('view', $claim);
        $user = $request->user();


        $claim->load(['reward', 'seller.user', 'cycle']);

        if ($user->isAdmin() || $user->isLogistics()) {
            $claim->load('seller.distributor');
        }

        return $this->successResponse(
            'Canje obtenido exitosamente.',
            new RewardClaimResource($claim)
        );
    }

    /**
     * PATCH /api/v1/reward-claims/{claim}
     * Admin y distribuidor actualizan el estado (approved, shipped, delivered, rejected).
     */
    public function update(UpdateRewardClaimRequest $request, RewardClaim $claim)
    {
        try {
            $data = $request->validated();

            $updated = $this->claimService->updateStatus(
                $claim,
                $data['status'],
                $data['notes'] ?? null,
                $data['carrier'] ?? null,
                $data['tracking_number'] ?? null,
            );

            return $this->successResponse(
                'Estado del canje actualizado exitosamente.',
                new RewardClaimResource($updated)
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}
