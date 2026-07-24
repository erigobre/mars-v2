<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\File;

class GenerateEquivalencesSeeder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:equivalences-seeder {--path= : Carpeta donde están los Excels}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Lee los Excels y genera un seeder de equivalencias (basado en el employee_code para poder ejecutarse en producción sin problemas de IDs).';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dir = $this->option('path') ?: storage_path('app/excels_equivalencias');

        if (!is_dir($dir)) {
            $this->error("El directorio no existe: $dir");
            $this->info("Por favor, pon tus Excels en esa carpeta o usa --path=/ruta/a/excels");
            return 1;
        }

        $files = glob($dir . '/*.xlsx');
        if (empty($files)) {
            $this->error("No se encontraron archivos .xlsx en $dir");
            return 1;
        }

        $equivalences = []; // [ 'codigo_equivocado' => 'codigo_real' ]

        foreach ($files as $file) {
            $this->info("Procesando: " . basename($file));
            $spreadsheet = IOFactory::load($file);
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            if (empty($rows)) continue;

            $this->info("=== DEBUG CABECERAS ===");
            $this->info("Fila 1: " . json_encode($rows[0]));
            if (isset($rows[1])) $this->info("Fila 2: " . json_encode($rows[1]));
            $this->info("========================");

            $headers = array_map(fn($h) => strtolower(trim((string)$h)), $rows[0]);
            
            // Buscar índices de las columnas
            $idxCodigo = -1;
            $idxRutaEq = -1;

            foreach ($headers as $index => $header) {
                if (str_contains($header, 'codigo') || str_contains($header, 'código') || $header === 'employee_code') {
                    $idxCodigo = $index;
                }
                if (str_contains($header, 'ruta equivalente')) {
                    $idxRutaEq = $index;
                }
            }

            if ($idxCodigo === -1 || $idxRutaEq === -1) {
                $this->warn("No se encontraron las columnas 'codigo' o 'ruta equivalente' en " . basename($file));
                continue;
            }

            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];
                $codigoEquivocado = trim((string)($row[$idxCodigo] ?? ''));
                $codigoReal = trim((string)($row[$idxRutaEq] ?? ''));

                if ($codigoEquivocado !== '' && $codigoReal !== '' && $codigoEquivocado !== $codigoReal) {
                    $equivalences[$codigoEquivocado] = $codigoReal;
                }
            }
        }

        $this->info("Total de equivalencias únicas encontradas: " . count($equivalences));

        if (empty($equivalences)) {
            $this->warn("No hay datos para generar el seeder.");
            return 0;
        }

        $seederData = [];
        foreach ($equivalences as $badCode => $goodCode) {
            $seederData[] = [
                'employee_code' => $goodCode,
                'equivalent_code' => $badCode
            ];
        }

        // Generar el archivo Seeder
        $this->generateSeederFile($seederData);
        
        return 0;
    }

    private function generateSeederFile(array $data)
    {
        $seederContent = "<?php\n\nnamespace Database\Seeders;\n\nuse Illuminate\Database\Seeder;\nuse App\Models\SellerEquivalence;\nuse App\Models\Seller;\n\nclass SellerEquivalencesSeeder extends Seeder\n{\n    public function run()\n    {\n";
        
        $seederContent .= "        \$equivalences = [\n";
        foreach ($data as $item) {
            $seederContent .= "            ['employee_code' => '{$item['employee_code']}', 'equivalent_code' => '{$item['equivalent_code']}'],\n";
        }
        $seederContent .= "        ];\n\n";

        $seederContent .= "        foreach (\$equivalences as \$eq) {\n";
        $seederContent .= "            \$seller = Seller::where('employee_code', \$eq['employee_code'])->first();\n";
        $seederContent .= "            if (\$seller) {\n";
        $seederContent .= "                SellerEquivalence::updateOrCreate(\n";
        $seederContent .= "                    ['seller_id' => \$seller->id, 'equivalent_code' => \$eq['equivalent_code']]\n";
        $seederContent .= "                );\n";
        $seederContent .= "            }\n";
        $seederContent .= "        }\n    }\n}\n";

        $path = database_path('seeders/SellerEquivalencesSeeder.php');
        File::put($path, $seederContent);

        $this->info("¡Seeder generado exitosamente en: $path !");
        $this->info("Puedes ejecutarlo corriendo: php artisan db:seed --class=SellerEquivalencesSeeder");
    }
}
