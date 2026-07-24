<?php

namespace App\Services\Sale;

use App\Models\Distributor;
use App\Models\DistributorProduct;
use App\Models\PointTransaction;
use App\Models\Product;
use App\Models\Role;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Seller;
use App\Models\User;
use App\Services\Goal\GoalProgressService;
use App\Services\Points\PointsStrategyFactory;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SaleService
{

    public function __construct(
        protected GoalProgressService $goalProgressService,
        protected PointsStrategyFactory $strategyFactory
    ) {}

    private function getAmountTolerancePct(): float
    {
        return (float) config('app.sale_amount_tolerance_pct', 50);
    }

    public function createManualSale(array $data, array $items, User $createdBy): Sale
    {
        $distributor = $this->resolveDistributor($createdBy, $data['distributor_id'] ?? null);

        $seller = $this->resolveSellerForDistributor($data['seller_id'], $distributor->id);

        return DB::transaction(function () use ($data, $items, $seller, $distributor, $createdBy) {
            return $this->persistOneSale(
                sellerId: $seller->id,
                saleDate: $data['sale_date'],
                items: $items,
                distributor: $distributor,
                createdBy: $createdBy,
                notes: $data['notes'] ?? null,
                batchUuid: null,
                uploadMethod: 'manual',
            );
        });
    }

    public function createBulkSales(array $salesData, User $createdBy): array
    {
        $distributor = $this->resolveDistributor($createdBy, $salesData[0]['distributor_id'] ?? null);

        return DB::transaction(function () use ($salesData, $distributor, $createdBy) {
            $created = [];

            foreach ($salesData as $saleData) {
                $effectiveDistributor = isset($saleData['distributor_id'])
                    ? $this->resolveDistributor($createdBy, $saleData['distributor_id'])
                    : $distributor;

                $seller = $this->resolveSellerForDistributor(
                    $saleData['seller_id'],
                    $effectiveDistributor->id
                );

                $created[] = $this->persistOneSale(
                    sellerId: $seller->id,
                    saleDate: $saleData['sale_date'],
                    items: $saleData['items'],
                    distributor: $effectiveDistributor,
                    createdBy: $createdBy,
                    notes: $saleData['notes'] ?? null,
                    batchUuid: null,
                    uploadMethod: 'manual',
                );
            }

            return $created;
        });
    }

    // Necesita estar en un transaction para evitar commits parciales si se llama desde el Job de carga masiva
    public function persistOneSale(
        int $sellerId,
        string $saleDate,
        array $items,
        Distributor $distributor,
        User $createdBy,
        ?string $notes     = null,
        ?string $batchUuid = null,
        string $uploadMethod = 'csv',
    ): Sale {
        $resolvedItems = $this->resolveItems($items, $distributor);

        // total_amount = suma de los montos REPORTADOS por el vendedor/distribuidor
        $totalAmount = collect($resolvedItems)->sum('reported_amount');
        // $totalPoints = (int) collect($resolvedItems)->sum(fn($i) => round($i['total_points']));

        $sale = Sale::create([
            'batch_uuid'    => $batchUuid,
            'created_by'    => $createdBy->id,
            'folio'         => $this->generateFolio(),
            'seller_id'     => $sellerId,
            'sale_date'     => $saleDate,
            'total_amount'  => $totalAmount,
            'points_earned' => 0,
            'upload_method' => $uploadMethod,
            'notes'         => $notes,
        ]);


        $createdItems = [];
        foreach ($resolvedItems as $item) {
            $createdItem = SaleItem::create([
                'sale_id'         => $sale->id,
                'product_id'      => $item['product_id'] ?? null,
                'unrecognized_sku'=> $item['unrecognized_sku'] ?? null,
                'quantity'        => $item['quantity'],
                'unit_price'      => $item['unit_price'],      // precio de referencia del catálogo (solo auditoría)
                'subtotal'        => $item['reported_amount'], // monto real reportado = base del cálculo
                'points_per_unit' => $item['points_per_unit'],
                'total_points'    => $item['total_points'],
                'earned_points'   => 0,
                'applied_rule'    => $item['applied_rule'],
            ]);

            $createdItems[$item['product_id']] = $createdItem;
        }

        $seller = Seller::lockForUpdate()->findOrFail($sellerId);
        $strategy = $this->strategyFactory->getStrategy($distributor);

        $totalPoints = $strategy->calculatePoints($sale, $seller, $distributor, $resolvedItems);

        $sale->update(['points_earned' => $totalPoints]);

        $calculationDetails = $strategy->getCalculationDetails();

        if (isset($calculationDetails['desglose']) && is_array($calculationDetails['desglose'])) {
            foreach ($calculationDetails['desglose'] as $detalle) {
                $productId = $detalle['product_id'];
                if (isset($createdItems[$productId])) {
                    $createdItems[$productId]->update([
                        'earned_points' => $detalle['puntos_ganados']
                    ]);
                }
            }
        }

        if ($totalPoints > 0) {
            // lockForUpdate previene race conditions en carga masiva paralela
            $newBalance = $seller->current_points + $totalPoints;

            PointTransaction::create([
                'seller_id'     => $seller->id,
                'amount'        => $totalPoints,
                'type'          => 'sale_earned',
                'balance_after' => $newBalance,
                'sale_id'       => $sale->id,
                'metadata'      => json_encode([ // Guardamos el debug del cálculo
                    'strategy' => $strategy->getName(),
                    'details'  => $calculationDetails,
                ]),
            ]);

            $seller->increment('current_points', $totalPoints);
        }

        $this->goalProgressService->evaluateForSale($sale);

        return $sale;
    }

    public function resolveItems(array $items, Distributor $distributor, bool $throwOnError = true): array
    {
        $errors = [];
        if (empty($items)) {
            $errors[] = 'La venta debe contener al menos un producto.';
            if ($throwOnError) throw new Exception(implode("\n", $errors));
            return ['resolved' => [], 'errors' => $errors];
        }

        // Batch load para evitar N+1
        $productIds = array_unique(array_column($items, 'product_id'));

        $products = Product::with('display')
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        $customizations = DistributorProduct::where('distributor_id', $distributor->id)
            ->whereIn('product_id', $productIds)
            ->get()
            ->keyBy('product_id');

        $tolerancePct = $this->getAmountTolerancePct();
        $resolved     = [];

        foreach ($items as $i => $item) {
            $line           = $item['excel_line'] ?? ($i + 1);
            $productId      = $item['product_id'] ?? null;
            $quantity       = $item['quantity']    ?? null;
            $reportedAmount = $item['amount']      ?? null;

            // Validaciones básicas de presencia y formato
            if (!$productId) {
                if (isset($item['raw_sku'])) {
                    $resolved[] = [
                        'product_id'       => null,
                        'unrecognized_sku' => $item['raw_sku'],
                        'quantity'         => (float) $quantity,
                        'unit_price'       => 0,
                        'reported_amount'  => (float) $reportedAmount,
                        'subtotal'         => (float) $reportedAmount,
                        'points_per_unit'  => 0,
                        'total_points'     => 0,
                        'applied_rule'     => "Producto no reconocido: {$item['raw_sku']}",
                    ];
                    continue;
                }
                $errors[] = "Línea {$line}: falta product_id.";
                continue;
            }
            if (!is_numeric($quantity) || (float) $quantity <= 0) {
                $errors[] = "Línea {$line}: la cantidad debe ser mayor a 0.";
                continue;
            }
            if ($reportedAmount === null || !is_numeric($reportedAmount) || (float) $reportedAmount < 0) {
                $errors[] = "Línea {$line}: el monto de venta (amount) es obligatorio y debe ser un valor ≥ 0.";
                continue;
            }

            $product = $products->get($productId);

            if (!$product) {
                $errors[] = "Línea {$line}: producto ID {$productId} no encontrado.";
                continue;
            }
            if (!$product->is_active || !$product->display || !$product->display->is_active) {
                $resolved[] = [
                    'product_id'       => null,
                    'unrecognized_sku' => $product->sku,
                    'quantity'         => (float) $quantity,
                    'unit_price'       => 0,
                    'reported_amount'  => (float) $reportedAmount,
                    'subtotal'         => (float) $reportedAmount,
                    'points_per_unit'  => 0,
                    'total_points'     => 0,
                    'applied_rule'     => "Producto o display inactivo: {$product->sku}",
                ];
                continue;
            }

            $custom   = $customizations->get($productId);
            $quantity = (float) $quantity;
            $amount   = (float) $reportedAmount;

            // Obtenemos el precio de referencia para validación (puede ser custom o el default del producto)
            $refUnitPrice = $custom?->custom_price
                ? (float) $custom->custom_price
                : (float) $product->default_price;

            $expectedAmount = round($quantity * $refUnitPrice, 2);
            $wasAutoCorrected = false;

            // Auto-corrección si el monto reportado es humanamente imposible (ej. difiere > 50%)
            if ($refUnitPrice > 0 && $expectedAmount > 0) {
                $diffPct = abs($amount - $expectedAmount) / $expectedAmount * 100;

                if ($diffPct > 50) {
                    $amount = $expectedAmount;
                    $wasAutoCorrected = true;
                }
            }

            $pointsPerUnit = (float) $product->display->value_points;
            $totalPoints   = round($pointsPerUnit * $quantity, 4);

            $resolved[] = [
                'product_id'      => (int) $productId,
                'quantity'        => $quantity,
                'unit_price'      => $refUnitPrice,
                'reported_amount' => $amount,
                'subtotal'        => $amount,
                'points_per_unit' => $pointsPerUnit,
                'total_points'    => $totalPoints,
                'applied_rule'    => "display:{$product->display->name}({$pointsPerUnit}pts/u)"
                    . ($custom?->custom_price ? '+precio_custom' : '')
                    . ($wasAutoCorrected ? ' (Monto auto-corregido)' : ''),
            ];
        }

        if ($throwOnError && !empty($errors)) {
            throw new Exception(implode("\n", $errors));
        }

        if (!$throwOnError) {
            return ['resolved' => $resolved, 'errors' => $errors];
        }

        return $resolved;
    }


    public function autoCreateSeller(string $employeeCode, Distributor $distributor): Seller
    {
        $sellerRole = Role::where('slug', 'seller')->firstOrFail();

        // Email generado automáticamente, único en el sistema
        $baseEmail = strtolower(Str::slug($employeeCode) . '@' . Str::slug($distributor->company_name) . '.auto');
        $email     = $baseEmail;
        $n         = 1;

        while (User::where('email', $email)->exists()) {
            $email = Str::beforeLast($baseEmail, '.auto') . ".{$n}.auto";
            $n++;
        }

        $user = User::create([
            'username'  => "Vendedor {$employeeCode}",
            'email'     => $email,
            'password'  => Hash::make(Str::random(20)), // El vendedor deberá cambiarla
            'role_id'   => $sellerRole->id,
            'is_active' => true,
        ]);

        $seller = Seller::create([
            'user_id'        => $user->id,
            'distributor_id' => $distributor->id,
            'employee_code'  => $employeeCode,
            'current_points' => 0,
        ]);

        log_action(
            'SELLER_AUTO_CREATED',
            $seller,
            "Creado automáticamente desde carga masiva. Código: {$employeeCode} | Distribuidor: {$distributor->company_name}"
        );

        return $seller;
    }

    // -----------------  Helpers ------------------------------------------

    public function resolveDistributor(User $user, ?int $distributorId): Distributor
    {
        if ($user->role->slug === 'distributor') {
            if (!$user->distributor) throw new Exception('Distribuidor no encontrado para tu cuenta.');

            return $user->distributor;
        }

        if ($user->role->slug === 'admin') {
            if (!$distributorId) throw new Exception('El admin debe especificar distributor_id.');

            $d = Distributor::find($distributorId);

            if (!$d) throw new Exception("Distribuidor ID {$distributorId} no encontrado.");

            return $d;
        }

        throw new Exception('Tu rol no puede registrar ventas.');
    }

    public function resolveSellerForDistributor(int $sellerId, int $distributorId): Seller
    {
        $seller = Seller::with('user')
            ->where('id', $sellerId)
            ->where('distributor_id', $distributorId)
            ->first();

        if (!$seller) throw new Exception("El vendedor ID {$sellerId} no pertenece a esta distribuidora.");
        if (!$seller->user->is_active) throw new Exception("El vendedor '{$seller->user->username}' está inactivo.");

        return $seller;
    }

    private function generateFolio(): string
    {
        return 'VTA-' . strtoupper(substr(str_replace('-', '', (string) Str::uuid()), 0, 12));
    }
}
