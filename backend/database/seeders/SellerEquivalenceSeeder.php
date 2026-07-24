<?php

namespace Database\Seeders;

use App\Models\Seller;
use App\Models\SellerEquivalence;
use Illuminate\Database\Seeder;

/**
 * Seeder para cargar las equivalencias de códigos de empleado.
 *
 * Basado en el archivo:
 *   storage/app/excels_equivalencias/Vendedores Sin Rangos filtrado.2.0 150626.xlsx
 *
 * LÓGICA CORREGIDA:
 *   - El employee_code REAL del vendedor es el de la columna "Rutas equivalentes" (P3 del Excel).
 *     Ej: 'AA', 'AG', 'BX', etc.
 *   - El código ERRÓNEO (con prefijo P- o V-) fue introducido por error en las cargas de ventas,
 *     lo que causó la creación automática de vendedores duplicados.
 *   - Este seeder registra los códigos erróneos (P-AA, V-AD, etc.) como equivalencias
 *     del vendedor real, para que futuras cargas con esos códigos no creen nuevos vendedores.
 *
 * Este seeder es idempotente: si la equivalencia ya existe, no la duplica.
 * Se puede ejecutar con: php artisan db:seed --class=SellerEquivalenceSeeder
 */
class SellerEquivalenceSeeder extends Seeder
{
    public function run(): void
    {
        /**
         * Cada entrada representa una equivalencia:
         *   'employee_code'   => Código REAL del vendedor en la tabla sellers
         *   'equivalent_code' => Código ERRÓNEO que llegó en reportes de ventas (el que va al diccionario)
         *   'nombre'          => Nombre del vendedor (solo referencia, no se usa en la lógica)
         */
        $equivalencias = [
            // ─── GRUPO DE CASA: Error con prefijo P- ─────────────────────────
            // El código real es sin prefijo, el error fue agregarle "P-"
            ['employee_code' => 'AA',    'equivalent_code' => 'P-AA',  'nombre' => 'MARTINEZ MALDONADO JORGE BALDEMAR'],
            ['employee_code' => 'AG',    'equivalent_code' => 'P-AG',  'nombre' => 'CRUZ ROCHA NESTOR'],
            // NOTA: 'AI' (P-AI, id 447) no tiene vendedor real en producción — excluido.
            ['employee_code' => 'AM',    'equivalent_code' => 'P-AM',  'nombre' => 'JIMENEZ GONZALEZ SERGIO'],
            ['employee_code' => 'AP',    'equivalent_code' => 'P-AP',  'nombre' => 'CAMPO ALVARADO EDWIN FERNANDO'],
            ['employee_code' => 'AQ',    'equivalent_code' => 'P-AQ',  'nombre' => 'HERNANDEZ DIAZ RAUL YORDI'],
            ['employee_code' => 'AS',    'equivalent_code' => 'P-AS',  'nombre' => 'RANGEL CARREON JUAN ANTONIO'],
            ['employee_code' => 'BD',    'equivalent_code' => 'P-BD',  'nombre' => 'CID MARTINEZ JORGE ALBERTO'],
            ['employee_code' => 'BJ',    'equivalent_code' => 'P-BJ',  'nombre' => 'CASTILLO RODRIGUEZ ADRIAN'],
            ['employee_code' => 'BK',    'equivalent_code' => 'P-BK',  'nombre' => 'CASTELAN BENAVIDEZ JULIO CESAR'],
            ['employee_code' => 'BP',    'equivalent_code' => 'P-BP',  'nombre' => 'MORALES NOYA ISAAC YEREVAN'],
            ['employee_code' => 'BQ',    'equivalent_code' => 'P-BQ',  'nombre' => 'OLVERA GUTIERREZ ANTONIO'],
            ['employee_code' => 'BX',    'equivalent_code' => 'P-BX',  'nombre' => 'HERNANDEZ CERVANTES GUSTAVO'],
            ['employee_code' => 'BY',    'equivalent_code' => 'P-BY',  'nombre' => 'RAMIREZ SUMANO DAVID'],
            ['employee_code' => 'CK',    'equivalent_code' => 'P-CK',  'nombre' => 'MARTINEZ RAMIREZ CESAR ULISES'],
            ['employee_code' => 'R',     'equivalent_code' => 'P-R',   'nombre' => 'FONSECA MUÑOZ KARLA'],

            // ─── GRUPO DE CASA: Cambio de prefijo ────────────────────────────
            // El código real tiene un prefijo diferente al erróneo
            // NOTA: 'A-AB' (P-AB, id 446) no tiene vendedor real en producción — excluido.
            ['employee_code' => 'C-CF',  'equivalent_code' => 'P-CF',  'nombre' => 'OLIVARES PITA ESPERANZA'],

            // ─── GRUPO DE CASA: Error con prefijo V- ─────────────────────────
            // El código real es sin prefijo, el error fue agregarle "V-"
            ['employee_code' => 'AD',    'equivalent_code' => 'V-AD',  'nombre' => 'CRUZ FLORES MARIA GUADALUPE'],
            ['employee_code' => 'BR',    'equivalent_code' => 'V-BR',  'nombre' => 'RIVERA OLVERA JOAQUIN'],
            ['employee_code' => 'BY',    'equivalent_code' => 'V-BY',  'nombre' => 'RAMIREZ SUMANO DAVID'],

            // ─── DULCES DEL NORTE ────────────────────────────────────────────
            // Variaciones en formato del nombre del vendedor
            ['employee_code' => 'Vendedor 1 F',  'equivalent_code' => 'VENDEDOR 1F',          'nombre' => 'Vendedor 1 F'],
            ['employee_code' => 'Vendedor 1 F',  'equivalent_code' => 'Vendedor VENDEDOR 1F', 'nombre' => 'Vendedor 1 F'],
            ['employee_code' => 'Vendedor 2 G',  'equivalent_code' => 'VENDEDOR 2G',          'nombre' => 'Vendedor 2 G'],
            ['employee_code' => 'Vendedor 2 G',  'equivalent_code' => 'Vendedor VENDEDOR 2G', 'nombre' => 'Vendedor 2 G'],
            ['employee_code' => 'Vendedor 3O',   'equivalent_code' => 'VENDEDOR 3O',          'nombre' => 'Vendedor 3O'],
            ['employee_code' => 'Vendedor 3O',   'equivalent_code' => 'Vendedor VENDEDOR 3O', 'nombre' => 'Vendedor 3O'],
            ['employee_code' => 'Vendedor 4 P',  'equivalent_code' => 'VENDEDOR 4P',          'nombre' => 'Vendedor 4 P'],
            ['employee_code' => 'Vendedor 4 P',  'equivalent_code' => 'Vendedor VENDEDOR 4P', 'nombre' => 'Vendedor 4 P'],
            ['employee_code' => 'Vendedor 5 R',  'equivalent_code' => 'VENDEDOR 5R',          'nombre' => 'Vendedor 5 R'],
            ['employee_code' => 'Vendedor 5 R',  'equivalent_code' => 'Vendedor VENDEDOR 5R', 'nombre' => 'Vendedor 5 R'],
            ['employee_code' => 'Vendedor 6 T',  'equivalent_code' => 'VENDEDOR 6T',          'nombre' => 'Vendedor 6 T'],
            ['employee_code' => 'Vendedor 6 T',  'equivalent_code' => 'Vendedor VENDEDOR 6T', 'nombre' => 'Vendedor 6 T'],
            ['employee_code' => 'Vendedor 7C',   'equivalent_code' => 'VENDEDOR 7C',          'nombre' => 'Vendedor 7C'],
            ['employee_code' => 'Vendedor 7C',   'equivalent_code' => 'Vendedor VENDEDOR 7C', 'nombre' => 'Vendedor 7C'],
        ];

        $created  = 0;
        $skipped  = 0;
        $notFound = 0;

        foreach ($equivalencias as $eq) {
            // Buscar al vendedor REAL por su código principal (employee_code)
            $seller = Seller::where('employee_code', $eq['employee_code'])->first();

            if (!$seller) {
                $this->command->warn(
                    "⚠ Vendedor REAL no encontrado con employee_code '{$eq['employee_code']}' "
                    . "(nombre: {$eq['nombre']}). "
                    . "Saltando equivalencia '{$eq['equivalent_code']}'."
                );
                $notFound++;
                continue;
            }

            // Verificar si ya existe esta equivalencia (idempotente)
            $exists = SellerEquivalence::where('seller_id', $seller->id)
                ->where('equivalent_code', $eq['equivalent_code'])
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            SellerEquivalence::create([
                'seller_id'       => $seller->id,
                'equivalent_code' => $eq['equivalent_code'],
            ]);

            $created++;

            $this->command->line(
                "  ✓ Equivalencia: vendedor [{$eq['employee_code']}] (id:{$seller->id}) "
                . "← código erróneo '{$eq['equivalent_code']}'"
            );
        }

        $this->command->info("SellerEquivalenceSeeder finalizado:");
        $this->command->info("  • Creadas: {$created}");
        $this->command->info("  • Ya existían (omitidas): {$skipped}");

        if ($notFound > 0) {
            $this->command->warn("  • Vendedores no encontrados: {$notFound}");
        }
    }
}
