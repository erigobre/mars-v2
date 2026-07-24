<?php

namespace App\Exports\Analytics;

use App\Models\Campaign;
use App\Models\RedemptionCycle;
use App\Models\Seller;
use App\Models\SellerSalesSnapshot;
use App\Models\Sale;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ValidationReportExport implements FromArray, WithHeadings, WithStyles, ShouldAutoSize, WithTitle
{
    protected $campaignId;
    protected $distributorId;
    protected $cycles;

    public function __construct(?int $campaignId = null, ?int $distributorId = null)
    {
        $this->campaignId = $campaignId ?: Campaign::current()->first()?->id;
        $this->distributorId = $distributorId;
        $this->cycles = $this->campaignId 
            ? RedemptionCycle::where('campaign_id', $this->campaignId)->orderBy('start_date', 'asc')->get()
            : collect();
    }

    public function array(): array
    {
        $query = Seller::with(['user', 'distributor']);
        
        if ($this->distributorId) {
            $query->where('distributor_id', $this->distributorId);
        }

        $sellers = $query->get();
        $data = [];

        foreach ($sellers as $seller) {
            if (!$seller->user || !$seller->distributor) {
                continue;
            }

            $row = [
                $seller->id,
                $seller->user->username,
                $seller->employee_code,
                $seller->distributor->company_name,
                $seller->average_monthly_sales,
                $seller->distributor->growth_percentage,
            ];

            foreach ($this->cycles as $cycle) {
                $snapshot = SellerSalesSnapshot::where('seller_id', $seller->id)
                    ->where('redemption_cycle_id', $cycle->id)
                    ->first();

                $points = Sale::where('seller_id', $seller->id)
                    ->whereBetween('sale_date', [
                        Carbon::parse($cycle->start_date)->startOfDay(),
                        Carbon::parse($cycle->end_date)->endOfDay()
                    ])
                    ->sum('points_earned');

                $row[] = $snapshot ? $snapshot->target_average : 0;
                $row[] = $snapshot ? $snapshot->total_units_sold : 0;
                $row[] = $points > 0 ? 'Sí' : 'No';
                $row[] = $points;
            }

            $data[] = $row;
        }

        return $data;
    }

    public function headings(): array
    {
        $headers = [
            'ID Vendedor',
            'Nombre Vendedor',
            'Cod Empleado',
            'Distribuidor',
            'Ventas Promedio Mensual',
            '% Crecimiento Dist',
        ];

        foreach ($this->cycles as $cycle) {
            $headers[] = 'Meta ' . $cycle->name;
            $headers[] = 'Unidades ' . $cycle->name;
            $headers[] = 'Ganó pts ' . $cycle->name;
            $headers[] = 'Pts Ganados ' . $cycle->name;
        }

        return $headers;
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
        return 'Validación de Ventas';
    }
}
