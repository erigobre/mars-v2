<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Facades\File;

class ConcentrateExcelsCommand extends Command
{
    protected $signature = 'excel:concentrate {--path= : Carpeta donde están los Excels}';
    protected $description = 'Lee todos los Excels y genera un único Excel concentrado con las posibles equivalencias.';

    public function handle()
    {
        $dir = $this->option('path') ?: storage_path('app/excels_equivalencias');

        if (!is_dir($dir)) {
            $this->error("El directorio no existe: $dir");
            return 1;
        }

        $files = glob($dir . '/*.xlsx');
        if (empty($files)) {
            $this->error("No se encontraron archivos .xlsx");
            return 1;
        }

        $concentratedData = [];
        $concentratedData[] = ['Archivo de Origen', 'Vendedor (Nombre)', 'Código de Empleado', 'Ruta Equivalente', 'Distribuidor'];

        foreach ($files as $file) {
            $this->info("Leyendo: " . basename($file));
            $spreadsheet = IOFactory::load($file);
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            if (empty($rows)) continue;

            $headers = array_map(fn($h) => strtolower(trim((string)$h)), $rows[0]);
            
            // Si las cabeceras están en la fila 2 (índice 1)
            if (isset($rows[1])) {
                $headersRow2 = array_map(fn($h) => strtolower(trim((string)$h)), $rows[1]);
                // Combinar para buscar
                $headers = array_merge($headers, $headersRow2);
            }

            foreach ($rows as $index => $row) {
                if ($index === 0) continue; // Saltar posible cabecera 1

                $nombre = '';
                $codigo = '';
                $ruta = '';
                $distribuidor = '';

                // Búsqueda heurística por columna
                foreach ($row as $colIndex => $value) {
                    $val = trim((string)$value);
                    if ($val === '') continue;

                    $h1 = strtolower(trim((string)($rows[0][$colIndex] ?? '')));
                    $h2 = strtolower(trim((string)($rows[1][$colIndex] ?? '')));

                    if (str_contains($h1, 'nombre') || str_contains($h2, 'nombre') || str_contains($h1, 'vendedor') || str_contains($h2, 'vendedor')) {
                        if ($nombre === '' && !is_numeric($val) && strlen($val) > 3) $nombre = $val;
                    }
                    if (str_contains($h1, 'código') || str_contains($h1, 'codigo') || str_contains($h2, 'código') || str_contains($h2, 'codigo')) {
                        if ($codigo === '') $codigo = $val;
                    }
                    if (str_contains($h1, 'ruta') || str_contains($h2, 'ruta')) {
                        if ($ruta === '') $ruta = $val;
                    }
                    if (str_contains($h1, 'distribuidor') || str_contains($h2, 'distribuidor')) {
                        if ($distribuidor === '') $distribuidor = $val;
                    }
                }

                // Si al menos hay un código o nombre
                if ($nombre !== '' || $codigo !== '' || $ruta !== '') {
                    $concentratedData[] = [
                        basename($file),
                        $nombre,
                        $codigo,
                        $ruta,
                        $distribuidor
                    ];
                }
            }
        }

        $newSpreadsheet = new Spreadsheet();
        $sheet = $newSpreadsheet->getActiveSheet();
        $sheet->fromArray($concentratedData, null, 'A1');

        $outputPath = storage_path('app/Concentrado_Vendedores.xlsx');
        $writer = new Xlsx($newSpreadsheet);
        $writer->save($outputPath);

        $this->info("¡Listo! Se ha creado el archivo concentrado en: " . $outputPath);
        return 0;
    }
}
