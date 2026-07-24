<?php

namespace App\Services\Analytics;

use App\Models\Distributor;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class SellerAdoptionExportService
{
    /**
     * Construye y devuelve la hoja de cálculo de Excel (Spreadsheet) con los vendedores y su estado.
     *
     * @param iterable $data Colección o array de vendedores ya formateados.
     * @param array $filters Filtros aplicados para mostrarlos en el subtítulo.
     * @return Spreadsheet
     */
    public function buildSpreadsheet(iterable $data, array $filters): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();
        $sheet       = $spreadsheet->getActiveSheet()->setTitle('Vendedores');

        $primary    = '2563EB';
        $headerText = 'FFFFFF';
        $lightBlue  = 'EFF6FF';

        // Fila 1 — Título
        $sheet->mergeCells('A1:K1');
        $sheet->setCellValue('A1', 'REPORTE DE ADOPCIÓN DE VENDEDORES');
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 14, 'color' => ['rgb' => $headerText]],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $primary]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(36);

        // Fila 2 — Sub-título con filtros
        $desc = 'Generado el ' . now()->format('d/m/Y H:i');
        if (!empty($filters['distributor_id'])) {
            $dist  = Distributor::find($filters['distributor_id'])?->company_name ?? 'N/A';
            $desc .= " · Distribuidor: {$dist}";
        }
        if (!empty($filters['status'])) {
            $labels = ['sin_ingreso' => 'Sin Ingreso', 'acepto_tyc' => 'Aceptó TyC', 'no_acepto_tyc' => 'No Aceptó TyC'];
            $desc  .= ' · Estado: ' . ($labels[$filters['status']] ?? $filters['status']);
        }
        $sheet->mergeCells('A2:K2');
        $sheet->setCellValue('A2', $desc);
        $sheet->getStyle('A2')->applyFromArray([
            'font'      => ['italic' => true, 'size' => 9, 'color' => ['rgb' => '64748b']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $lightBlue]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        ]);

        // Fila 3 — Encabezados
        $headers = ['A' => 'Cód. Empleado', 'B' => 'Nombre', 'C' => 'Email', 'D' => 'Teléfono',
                    'E' => 'Distribuidor', 'F' => 'Estado', 'G' => 'TyC', 'H' => 'Último Acceso',
                    'I' => 'Registro', 'J' => 'Puntos', 'K' => 'ID'];

        foreach ($headers as $col => $label) {
            $sheet->setCellValue("{$col}3", $label);
        }
        $sheet->getStyle('A3:K3')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $headerText]],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1e40af']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '93c5fd']]],
        ]);
        $sheet->getRowDimension(3)->setRowHeight(28);

        // Filas de datos
        $statusColors = [
            'sin_ingreso'   => ['bg' => 'FEE2E2', 'text' => '991B1B'],
            'acepto_tyc'    => ['bg' => 'D1FAE5', 'text' => '065F46'],
            'no_acepto_tyc' => ['bg' => 'FEF3C7', 'text' => '92400E'],
        ];

        $row = 4;
        foreach ($data as $seller) {
            $colors = $statusColors[$seller['status']] ?? ['bg' => 'F8FAFC', 'text' => '334155'];
            $rowBg  = ($row % 2 === 0) ? 'F8FAFC' : 'FFFFFF';

            $sheet->setCellValue("A{$row}", $seller['employeeCode'] ?? '—');
            $sheet->setCellValue("B{$row}", $seller['name']);
            $sheet->setCellValue("C{$row}", $seller['email'] ?? '—');
            $sheet->setCellValue("D{$row}", $seller['phone'] ?? '—');
            $sheet->setCellValue("E{$row}", $seller['distributorName'] ?? '—');
            $sheet->setCellValue("F{$row}", $seller['statusLabel']);
            $sheet->setCellValue("G{$row}", $seller['termsAccepted'] ? 'Sí' : 'No');
            $sheet->setCellValue("H{$row}", $seller['lastLoginAt']
                ? \Carbon\Carbon::parse($seller['lastLoginAt'])->format('d/m/Y H:i') : 'Nunca');
            $sheet->setCellValue("I{$row}", $seller['registeredAt']
                ? \Carbon\Carbon::parse($seller['registeredAt'])->format('d/m/Y') : '—');
            $sheet->setCellValue("J{$row}", $seller['currentPoints']);
            $sheet->setCellValue("K{$row}", $seller['sellerId']);

            $sheet->getStyle("A{$row}:K{$row}")->applyFromArray([
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['rgb' => 'E2E8F0']]],
            ]);
            $sheet->getStyle("F{$row}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $colors['bg']]],
                'font' => ['bold' => true, 'color' => ['rgb' => $colors['text']]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
            $sheet->getRowDimension($row)->setRowHeight(20);
            $row++;
        }

        // Anchos, freeze y autofilter
        foreach (['A' => 16, 'B' => 28, 'C' => 32, 'D' => 16, 'E' => 28,
                  'F' => 16, 'G' => 8, 'H' => 18, 'I' => 14, 'J' => 12, 'K' => 8] as $col => $w) {
            $sheet->getColumnDimension($col)->setWidth($w);
        }
        $sheet->freezePane('A4');
        if ($row > 4) {
            $sheet->setAutoFilter("A3:K" . ($row - 1));
        }

        return $spreadsheet;
    }
}
