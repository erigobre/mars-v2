<?php

namespace App\Exports\Sellers;

use App\Models\Campaign;
use App\Models\Seller;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GlobalSellersExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize, WithTitle
{
    public function collection()
    {
        $campaign = Campaign::current()->first();

        $query = Seller::with(['user', 'distributor'])->select('sellers.*');

        if ($campaign) {
            $currentSalesSubquery = DB::table('sale_items')
                ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
                ->selectRaw('COALESCE(SUM(sale_items.quantity), 0)')
                ->whereColumn('sales.seller_id', 'sellers.id')
                ->whereBetween('sales.sale_date', [
                    $campaign->start_date,
                    $campaign->end_date
                ]);
            $query->selectSub($currentSalesSubquery, 'campaign_sales');
        }

        $sellers = $query->get();

        return $sellers->map(function ($seller) use ($campaign) {
            $promedio = (float) ($seller->average_monthly_sales ?? 0);
            $crecimiento = (float) ($seller->distributor->growth_percentage ?? 0);
            $meta = round($promedio * (1 + ($crecimiento / 100)), 2);

            return [
                'ID Vendedor' => $seller->id,
                'Código de Empleado' => $seller->employee_code ?? 'N/A',
                'Vendedor' => $seller->user->username ?? 'Desconocido',
                'Estado' => ($seller->user->is_active ?? false) ? 'Activo' : 'Inactivo',
                'Distribuidor' => $seller->distributor->company_name ?? 'Sin asignar',
                'Crecimiento (%)' => $crecimiento . '%',
                'Promedio de Ventas Base (Cajas)' => $promedio,
                'Meta del Periodo (Promedio + Crecimiento)' => $meta,
                'Ventas Campaña Actual (Cajas)' => $campaign ? (float) ($seller->campaign_sales ?? 0) : 0,
                'Puntos Disponibles' => $seller->current_points ?? 0,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'ID Vendedor',
            'Código de Empleado',
            'Vendedor',
            'Estado',
            'Distribuidor',
            'Crecimiento (%)',
            'Promedio de Ventas Base (Cajas)',
            'Meta del Periodo (Promedio + Crecimiento)',
            'Ventas Campaña Actual (Cajas)',
            'Puntos Disponibles',
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
        return 'Reporte Global de Vendedores';
    }
}
