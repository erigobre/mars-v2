<?php

namespace App\Services\Sale;

use App\Imports\SalesSheetImport;
use App\Models\Distributor;
use App\Models\DistributorProduct;
use App\Models\Product;
use App\Models\Seller;
use App\Services\Sale\SaleService;
use App\Services\Product\DistributorProductService;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Facades\Excel;

class SalesFileParser
{
    // Lookups cargados en memoria para evitar N+1
    private array $sellerMap  = [];  // employee_code → Seller
    private array $equivalencesMap = []; // equivalent_code → Seller
    private array $productMap = [];  // sku → product_id
    private array $masterSkus = [];  // sku_mars -> product_id
    private array $customSkusByProductId = []; // product_id -> custom_sku
    public  int   $autoCreatedCount = 0;
    public  array $errors = [];

    public function __construct(
        private readonly Distributor  $distributor,
        private readonly SaleService  $saleService,
        private readonly DistributorProductService $distributorProductService,
    ) {
        $this->loadLookups();
    }

    public function parse(UploadedFile|string $file): array
    {
        // Laravel Excel lee el archivo y nos devuelve las filas como Collection
        $import = new SalesSheetImport();
        Excel::import($import, $file);

        $rows = $import->getRows();

        if ($rows->isEmpty()) {
            $this->errors[] = 'El archivo no contiene filas de datos. Los datos deben iniciar en la fila 2 (fila 1 = encabezados).';
            return ['groups' => collect(), 'auto_created' => 0, 'errors' => $this->errors];
        }

        $groups = $this->groupRows($rows);

        return [
            'groups'       => $groups,
            'auto_created' => $this->autoCreatedCount,
            'errors'       => $this->errors,
        ];
    }

    private function getFieldValue(array $row, array $possibleKeys)
    {
        foreach ($possibleKeys as $key) {
            if (isset($row[$key])) {
                return $row[$key];
            }
        }
        return null;
    }

    private function groupRows(Collection $rows): Collection
    {
        $groups = collect();
        $today  = now()->format('Y-m-d');

        // Definición de posibles cabeceras para cada campo (siempre en minúsculas por WithHeadingRow)
        $headersMap = [
            'employee_code'      => ['employee_code', 'codigo_empleado'],
            'product_sku_mars'   => ['sku_producto_mars'],
            'product_sku_custom' => ['clave_producto_cliente', 'product_sku'],
            'quantity'           => ['quantity', 'cantidad'],
            'amount'             => ['amount', 'monto'],
            'sale_date'          => ['sale_date', 'fecha_venta'],
            'notes'              => ['notes', 'notas', 'descripcion'],
        ];

        foreach ($rows as $rowNum => $row) {
            // El row es un array cuando se usa WithHeadingRow en ToCollection
            $rowData = is_array($row) ? $row : (method_exists($row, 'toArray') ? $row->toArray() : (array) $row);

            $employeeCode = trim((string) $this->getFieldValue($rowData, $headersMap['employee_code']));
            $productSkuMars = trim((string) $this->getFieldValue($rowData, $headersMap['product_sku_mars']));
            $productSkuCustom = trim((string) $this->getFieldValue($rowData, $headersMap['product_sku_custom']));
            $quantity = $this->getFieldValue($rowData, $headersMap['quantity']);
            $amount = $this->getFieldValue($rowData, $headersMap['amount']);
            $saleDateRaw = $this->getFieldValue($rowData, $headersMap['sale_date']);
            $notes = trim((string) $this->getFieldValue($rowData, $headersMap['notes']));

            if ($employeeCode === '' && $productSkuMars === '' && $productSkuCustom === '' && $quantity === null && $amount === null) {
                continue;
            }

            $line = $rowNum + 2; // +2: fila 1 es header
            $hasError = false;

            if ($employeeCode === '') {
                $this->errors[] = "Fila {$line}: código de empleado está vacío.";
                $hasError = true;
            }
            if ($productSkuMars === '' && $productSkuCustom === '') {
                $this->errors[] = "Fila {$line}: SKU está vacío (se requiere Sku_producto_Mars o Clave_producto_cliente/product_sku).";
                $hasError = true;
            }
            if (!is_numeric($quantity) || (float) $quantity <= 0) {
                $this->errors[] = "Fila {$line}: cantidad '{$quantity}' inválida (debe ser número > 0).";
                $hasError = true;
            }
            if ($amount === null || !is_numeric($amount) || (float) $amount < 0) {
                $this->errors[] = "Fila {$line}: monto de venta '{$amount}' inválido. Es obligatorio e indica cuánto generó realmente la venta. Debe ser ≥ 0.";
                $hasError = true;
            }

            if ($hasError) continue;

            // --- Lógica de Vendedor ---
            $searchCode = strtolower(preg_replace('/\s+/', '', $employeeCode));
            if (!array_key_exists($searchCode, $this->sellerMap)) {
                // Si no está en el mapa principal, buscar en el diccionario de equivalencias
                if (array_key_exists($searchCode, $this->equivalencesMap)) {
                    $seller = $this->equivalencesMap[$searchCode];
                } else {
                    // Si tampoco está en el diccionario, crear uno nuevo
                    $seller = $this->saleService->autoCreateSeller($employeeCode, $this->distributor);
                    $this->sellerMap[$searchCode] = $seller;
                    $this->autoCreatedCount++;
                }
            } else {
                $seller = $this->sellerMap[$searchCode];
            }

            // --- Lógica de SKU ---
            $productId = null;
            $rawSku = null;

            if ($productSkuMars !== '') {
                // Se proporcionó el SKU de Mars
                if (!array_key_exists($productSkuMars, $this->masterSkus)) {
                    // En lugar de error, guardamos el raw_sku para registrarlo como no reconocido
                    $rawSku = $productSkuMars;
                } else {
                    $productId = $this->masterSkus[$productSkuMars];

                    if ($productSkuCustom !== '') {
                        // Verificar si el distribuidor no tiene este SKU personalizado asignado
                        if (!isset($this->customSkusByProductId[$productId])) {
                            // Crearlo dinámicamente
                            $this->distributorProductService->customize($this->distributor, [
                                'product_id' => $productId,
                                'custom_sku' => $productSkuCustom,
                            ]);
                            
                            // Actualizar la caché local
                            $this->customSkusByProductId[$productId] = $productSkuCustom;
                            $this->productMap[$productSkuCustom] = $productId;
                        }
                    }
                }
            } else {
                // Solo se proporcionó el custom SKU (o product_sku antiguo)
                if (!array_key_exists($productSkuCustom, $this->productMap)) {
                    // En lugar de error, guardamos el raw_sku para registrarlo como no reconocido
                    $rawSku = $productSkuCustom;
                } else {
                    $productId = $this->productMap[$productSkuCustom];
                }
            }

            // Si la fecha de venta no es válida o está vacía, se asigna la fecha actual
            try {
                $saleDate = $this->parseDate($saleDateRaw, $today, $line);
            } catch (\Exception $e) {
                $this->errors[] = $e->getMessage();
                continue;
            }

            // Agrupar por vendedor (una venta por vendedor por archivo) 
            $groupKey = $searchCode;

            if (!$groups->has($groupKey)) {
                $groups->put($groupKey, [
                    'seller_id' => $seller->id,
                    'sale_date' => $saleDate,
                    'notes'     => $notes ?: null,
                    'items'     => [],
                ]);
            }

            $group = $groups->get($groupKey);
            $group['items'][] = [
                'product_id' => $productId,
                'raw_sku'    => $rawSku,
                'quantity'   => (float) $quantity,
                'amount'     => (float) $amount,
                'excel_line' => $line,
            ];
            $groups->put($groupKey, $group);
        }

        return $groups;
    }


    private function loadLookups(): void
    {
        $this->sellerMap = Seller::with('user')
            ->where('distributor_id', $this->distributor->id)
            ->whereNotNull('employee_code')
            ->whereHas('user', fn($q) => $q->where('is_active', true))
            ->get()
            ->keyBy(fn($seller) => strtolower(preg_replace('/\s+/', '', $seller->employee_code)))
            ->all(); // Esto nos da un array de la forma [employee_code => Seller]

        $this->equivalencesMap = \App\Models\SellerEquivalence::with('seller')
            ->whereHas('seller', fn($q) => $q->where('distributor_id', $this->distributor->id))
            ->get()
            ->keyBy(fn($eq) => strtolower(preg_replace('/\s+/', '', $eq->equivalent_code)))
            ->map(fn($eq) => $eq->seller)
            ->all();

        $this->masterSkus = Product::where('is_active', true)->pluck('id', 'sku')->all();

        // SKU custom del distribuidor (tienen precedencia sobre el maestro)
        $customSkusList = DistributorProduct::where('distributor_id', $this->distributor->id)
            ->whereNotNull('custom_sku')
            ->join('products', 'products.id', '=', 'distributor_products.product_id') // Aseguramos que tenga un producto activo asociado
            ->where('products.is_active', true)
            ->get(['distributor_products.product_id', 'distributor_products.custom_sku']);
            
        $customSkusMap = [];
        $this->customSkusByProductId = [];
        
        foreach ($customSkusList as $item) {
            $customSkusMap[$item->custom_sku] = $item->product_id;
            $this->customSkusByProductId[$item->product_id] = $item->custom_sku;
        }

        $this->productMap = array_replace($this->masterSkus, $customSkusMap);
    }

    private function parseDate(mixed $raw, string $fallback, int $line): string
    {
        if ($raw === null || trim((string) $raw) === '') return $fallback;

        if (is_numeric($raw)) {
            try {
                return \PhpOffice\PhpSpreadsheet\Shared\Date
                    ::excelToDateTimeObject((float) $raw)
                    ->format('Y-m-d');
            } catch (\Throwable) {}
        }

        if ($raw instanceof \DateTimeInterface) {
            return $raw->format('Y-m-d');
        }

        foreach (['Y-m-d', 'd/m/Y', 'm/d/Y', 'd-m-Y', 'Y/m/d'] as $fmt) {
            $d = \DateTime::createFromFormat($fmt, (string) $raw);
            if ($d) return $d->format('Y-m-d');
        }

        $ts = strtotime((string) $raw);
        if ($ts !== false) return date('Y-m-d', $ts);

        throw new \Exception("Fila {$line}: fecha '{$raw}' inválida. Usa YYYY-MM-DD.");
    }
}
