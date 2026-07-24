<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\WithChunkReading;

/**
 * Importador mínimo: solo lee las filas del Excel/CSV y las expone.
 * Toda la lógica de negocio (validación, agrupación, persistencia)
 * vive en SalesFileParser y SaleService, no aquí.
 *
 * WithHeadingRow: usa la fila 1 como nombres de columna.
 * SkipsEmptyRows: ignora filas completamente vacías.
 * WithChunkReading: procesa en bloques de 500 (RAM constante para archivos grandes).
 */
class SalesSheetImport implements ToCollection, WithHeadingRow, SkipsEmptyRows, WithChunkReading
{
    private Collection $rows;

    public function __construct()
    {
        $this->rows = collect();
    }

    public function collection(Collection $rows): void
    {
        $this->rows = $this->rows->concat($rows);
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function getRows(): Collection
    {
        return $this->rows;
    }
}