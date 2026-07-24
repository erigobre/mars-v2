<?php

namespace App\Exports;

use App\Models\RewardClaim;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RewardClaimsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return RewardClaim::with(['reward', 'seller.user', 'seller.distributor', 'cycle'])
            ->latest('claimed_at')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Folio',
            'Fecha de Canje',
            'Estado',
            'Premio',
            'Puntos Costados',
            'Nombre Vendedor',
            'Código Empleado',
            'Email',
            'Teléfono',
            'Distribuidor',
            'Puntos Actuales (Vendedor)',
        ];
    }

    /**
    * @param RewardClaim $claim
    */
    public function map($claim): array
    {
        return [
            $claim->folio,
            $claim->claimed_at ? $claim->claimed_at->format('Y-m-d H:i') : ($claim->created_at ? $claim->created_at->format('Y-m-d H:i') : ''),
            $claim->status->label(),
            $claim->reward ? $claim->reward->name : 'N/A',
            $claim->points_spent,
            $claim->seller && $claim->seller->user ? $claim->seller->user->name : 'N/A',
            $claim->seller ? $claim->seller->employee_code : 'N/A',
            $claim->seller && $claim->seller->user ? $claim->seller->user->email : 'N/A',
            $claim->seller && $claim->seller->user ? $claim->seller->user->phone : 'N/A',
            $claim->seller && $claim->seller->distributor ? $claim->seller->distributor->company_name : 'N/A',
            $claim->seller ? $claim->seller->current_points : 0,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
