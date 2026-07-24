<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Services\Analytics\SellerAdoptionService;
use Illuminate\Http\Request;

class SellerAdoptionController extends ApiController
{
    public function __construct(
        protected SellerAdoptionService $adoptionService
    ) {}

    /**
     * GET /api/v1/admin/sellers/adoption
     *
     * Reporte completo de adopción de vendedores.
     *
     * Query params opcionales:
     *   distributor_id  int     Filtrar por empresa
     *   campaign_id     int     Usar el rango de fechas de esa campaña
     *   date_from       Y-m-d   Fecha inicio manual (se ignora si viene campaign_id)
     *   date_to         Y-m-d   Fecha fin manual
     */
    public function report(Request $request)
    {
        $validated = $request->validate([
            'distributor_id' => ['nullable', 'integer', 'exists:distributors,id'],
            'campaign_id'    => ['nullable', 'integer', 'exists:campaigns,id'],
            'date_from'      => ['nullable', 'date_format:Y-m-d'],
            'date_to'        => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
        ]);

        $report = $this->adoptionService->getAdoptionReport(
            distributorId: $validated['distributor_id'] ?? null,
            campaignId: $validated['campaign_id']    ?? null,
            dateFrom: $validated['date_from']      ?? null,
            dateTo: $validated['date_to']        ?? null,
        );

        return $this->successResponse(
            'Reporte de adopción de vendedores obtenido exitosamente.',
            $this->camel($report)
        );
    }

    /**
     * GET /api/v1/admin/sellers/adoption/funnel
     *
     * Solo el funnel (conteos) — respuesta más ligera para dashboards.
     */
    public function funnel(Request $request)
    {
        $validated = $request->validate([
            'distributor_id' => ['nullable', 'integer', 'exists:distributors,id'],
            'campaign_id'    => ['nullable', 'integer', 'exists:campaigns,id'],
            'date_from'      => ['nullable', 'date_format:Y-m-d'],
            'date_to'        => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
        ]);

        [$dateFrom, $dateTo] = $this->resolveRange(
            $validated['campaign_id'] ?? null,
            $validated['date_from']   ?? null,
            $validated['date_to']     ?? null,
        );

        $funnel = $this->adoptionService->getFunnel(
            distributorId: $validated['distributor_id'] ?? null,
            dateFrom: $dateFrom,
            dateTo: $dateTo,
        );

        return $this->successResponse(
            'Funnel de adopción obtenido exitosamente.',
            $this->camel($funnel)
        );
    }

    /**
     * GET /api/v1/admin/sellers/adoption/by-company
     *
     * Desglose por distribuidor/empresa.
     */
    public function byCompany(Request $request)
    {
        $validated = $request->validate([
            'campaign_id' => ['nullable', 'integer', 'exists:campaigns,id'],
            'date_from'   => ['nullable', 'date_format:Y-m-d'],
            'date_to'     => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
        ]);

        [$dateFrom, $dateTo] = $this->resolveRange(
            $validated['campaign_id'] ?? null,
            $validated['date_from']   ?? null,
            $validated['date_to']     ?? null,
        );

        $data = $this->adoptionService->getBreakdownByCompany($dateFrom, $dateTo);

        return $this->successResponse(
            'Desglose de adopción por compañía obtenido exitosamente.',
            array_map(fn($row) => $this->camel($row), $data)
        );
    }

    /**
     * GET /api/v1/admin/sellers/adoption/list
     *
     * Lista detallada de vendedores por segmento.
     *
     * Query params:
     *   segment         string  required — ver opciones abajo
     *   distributor_id  int     opcional
     *   campaign_id     int     opcional
     *   date_from       Y-m-d   opcional
     *   date_to         Y-m-d   opcional
     *
     * Segmentos disponibles:
     *   never_logged_in       Nunca han iniciado sesión
     *   logged_no_terms       Iniciaron sesión pero NO aceptaron T&C
     *   accepted_terms        Aceptaron T&C
     *   active_in_period      Activos dentro del rango de fechas
     *   registered_in_period  Registrados dentro del rango de fechas
     */
    public function list(Request $request)
    {
        $validated = $request->validate([
            'segment' => [
                'required',
                'string',
                'in:never_logged_in,logged_no_terms,accepted_terms,active_in_period,registered_in_period',
            ],
            'distributor_id' => ['nullable', 'integer', 'exists:distributors,id'],
            'campaign_id'    => ['nullable', 'integer', 'exists:campaigns,id'],
            'date_from'      => ['nullable', 'date_format:Y-m-d'],
            'date_to'        => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
        ]);

        [$dateFrom, $dateTo] = $this->resolveRange(
            $validated['campaign_id'] ?? null,
            $validated['date_from']   ?? null,
            $validated['date_to']     ?? null,
        );

        $sellers = $this->adoptionService->getSellerList(
            segment: $validated['segment'],
            distributorId: $validated['distributor_id'] ?? null,
            dateFrom: $dateFrom,
            dateTo: $dateTo,
        );

        return $this->successResponse(
            "Lista de vendedores ({$validated['segment']}) obtenida exitosamente.",
            [
                'segment' => $validated['segment'],
                'count'   => count($sellers),
                'sellers' => array_map(fn($row) => $this->camel($row), $sellers),
            ]
        );
    }

    // ─────────────────────────────────────────────────────────────
    // NUEVOS: Lista de estado + Exportación Excel
    // ─────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/dashboard/sellers/adoption/status-list
     *
     * Lista paginada de TODOS los vendedores con su estado de adopción.
     */
    public function statusList(Request $request)
    {
        $validated = $request->validate([
            'distributor_id' => ['nullable', 'integer', 'exists:distributors,id'],
            'status'         => ['nullable', 'string', 'in:sin_ingreso,acepto_tyc,no_acepto_tyc'],
            'search'         => ['nullable', 'string', 'max:100'],
            'per_page'       => ['nullable', 'integer', 'min:1', 'max:200'],
        ]);

        $perPage   = $validated['per_page'] ?? 50;
        $query     = $this->adoptionService->buildStatusListQuery($validated);
        $paginated = $query->paginate($perPage);

        $items = $paginated->getCollection()->map(fn($seller) => $this->adoptionService->formatSellerStatus($seller));

        return $this->successResponse(
            'Lista de vendedores obtenida exitosamente.',
            [
                'items'   => $items,
                'meta'    => [
                    'current_page' => $paginated->currentPage(),
                    'last_page'    => $paginated->lastPage(),
                    'per_page'     => $paginated->perPage(),
                    'total'        => $paginated->total(),
                    'from'         => $paginated->firstItem(),
                    'to'           => $paginated->lastItem(),
                ],
                'summary' => $this->adoptionService->getStatusSummary($validated['distributor_id'] ?? null),
            ]
        );
    }

    /**
     * GET /api/v1/dashboard/sellers/adoption/status-list/export
     *
     * Descarga el listado completo en Excel (.xlsx), mismos filtros.
     */
    public function statusListExport(Request $request, \App\Services\Analytics\SellerAdoptionExportService $exportService)
    {
        $validated = $request->validate([
            'distributor_id' => ['nullable', 'integer', 'exists:distributors,id'],
            'status'         => ['nullable', 'string', 'in:sin_ingreso,acepto_tyc,no_acepto_tyc'],
            'search'         => ['nullable', 'string', 'max:100'],
        ]);

        $sellers = $this->adoptionService->buildStatusListQuery($validated)->get();
        $data    = $sellers->map(fn($seller) => $this->adoptionService->formatSellerStatus($seller));

        $spreadsheet = $exportService->buildSpreadsheet($data, $validated);
        $writer      = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $filename    = 'vendedores_estado_' . now()->format('Y-m-d_H-i-s') . '.xlsx';

        return response()->stream(
            fn() => $writer->save('php://output'),
            200,
            [
                'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
                'Cache-Control'       => 'max-age=0',
            ]
        );
    }

    // ─────────────────────────────────────────────────────────────
    // HELPER
    // ─────────────────────────────────────────────────────────────

    private function resolveRange(?int $campaignId, ?string $dateFrom, ?string $dateTo): array
    {
        if ($dateFrom || $dateTo) {
            return [$dateFrom, $dateTo];
        }

        if ($campaignId) {
            $campaign = \App\Models\Campaign::find($campaignId);
            if ($campaign) {
                return [
                    $campaign->start_date->toDateString(),
                    $campaign->end_date->toDateString(),
                ];
            }
        }

        return [null, null];
    }
}
