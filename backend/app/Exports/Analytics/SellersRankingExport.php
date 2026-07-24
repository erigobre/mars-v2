<?php

namespace App\Exports\Analytics;

use App\Services\Analytics\SalesAnalyticsService;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SellersRankingExport implements FromArray, WithHeadings, WithStyles, ShouldAutoSize, WithTitle
{
    protected $data;

    public function __construct(?int $campaignId = null, ?int $distributorId = null)
    {
        $service = app(SalesAnalyticsService::class);
        $this->data = $service->getSellersComparison($campaignId, $distributorId, 0); // 0 means all
    }

    public function array(): array
    {
        return array_map(function ($seller) {
            $target = $seller['target_average'] ?? 0;
            $currentMonth = $seller['current_month_sales'] ?? 0;
            $percentage = $target > 0 ? round(($currentMonth / $target) * 100) : 0;

            return [
                $seller['seller_id'],
                $seller['seller_name'],
                $seller['distributor_name'] ?? 'Sin asignar',
                $seller['total_points'],
                $target,
                $seller['current_sales'],
                $currentMonth,
                $percentage . '%',
            ];
        }, $this->data);
    }

    public function headings(): array
    {
        return [
            'ID Vendedor',
            'Vendedor',
            'Distribuidor',
            'Puntos Totales',
            'Meta Calculada (Promedio + Crecimiento)',
            'Ventas Totales Campaña',
            'Ventas Mes Actual',
            'Cumplimiento Meta Mensual (%)',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType'   => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1E293B'], // Slate 800
                ]
            ],
        ];
    }

    public function title(): string
    {
        return 'Ranking de Vendedores';
    }
}
