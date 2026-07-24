<?php

namespace App\Services\Seller;

use App\Models\Role;
use App\Models\Seller;
use App\Models\User;
use App\Services\Auth\SellerAuthKeyService;
use App\Services\Phone\PhoneNormalizerService;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SellerService
{
    public function __construct(
        protected PhoneNormalizerService $phoneNormalizer,
        private SellerAuthKeyService $authKeyService
    ) {}

    public function create(array $data, ?UploadedFile $avatar = null): Seller
    {
        return DB::transaction(function () use ($data, $avatar) {
            // Obtener el rol de vendedor
            $sellerRole = Role::where('slug', 'seller')->firstOrFail();

            $phone = !empty($data['phone']) ? $this->normalizePhone($data['phone']) : null;

            // Crear el usuario
            $user = User::create([
                'username' => $data['username'],
                'email' => $data['email'] ?? null ,
                'phone' => $phone,
                'birthdate' => $data['birthdate'] ?? null,
                'is_active' => $data['is_active'] ?? true,
                'role_id' => $sellerRole->id,
            ]);

            if ($avatar) $user->uploadImage($avatar);

            // Crear el vendedor
            $seller = Seller::create([
                'user_id' => $user->id,
                'distributor_id' => $data['distributor_id'],
                'employee_code' => $data['employee_code'] ?? null,
                'address_street' => $data['address_street'] ?? null,
                'address_colonia' => $data['address_colonia'] ?? null,
                'address_city' => $data['address_city'] ?? null,
                'address_state' => $data['address_state'] ?? null,
                'address_zip' => $data['address_zip'] ?? null,
                'shipping_notes' => $data['shipping_notes'] ?? null,
                'average_monthly_sales' => $data['average_monthly_sales'] ?? null,
            ]);

            $this->authKeyService->applyAuth($seller, $seller->distributor);

            return $seller->load(['user']);
        });
    }

    public function update(Seller $seller, array $data, ?UploadedFile $avatar = null): Seller
    {
        return DB::transaction(function () use ($seller, $data, $avatar) {
            $user = $seller->user;

            // Actualizar Usuario (Filtrado dinámico)
            $userData = array_filter([
                'username'  => $data['username'] ?? null,
                'email'     => $data['email'] ?? null,
                'phone'     => isset($data['phone']) ? $this->normalizePhone($data['phone']) : null,
                'birthdate' => $data['birthdate'] ?? null,
                'password'  => isset($data['password']) ? Hash::make($data['password']) : null,
                'is_active' => $data['is_active'] ?? null,
            ], fn($v) => $v !== null);

            $user->update($userData);

            // Gestionar Avatar con el Trait HasImage
            if ($avatar) $user->uploadImage($avatar);


            // Actualizar Vendedor
            // Usamos 'collect' y 'only' para extraer solo lo que necesitamos del request
            $sellerFields = [
                'distributor_id',
                'employee_code',
                'address_street',
                'address_colonia',
                'address_city',
                'address_state',
                'address_zip',
                'shipping_notes',
                'average_monthly_sales',
                'seller_tier_id',
                'current_points'
            ];

            $sellerData = array_filter(
                collect($data)->only($sellerFields)->toArray(),
                fn($v) => $v !== null
            );

            // Handle points adjustment logic if current_points is sent
            if (isset($sellerData['current_points']) && $seller->current_points != $sellerData['current_points']) {
                $difference = $sellerData['current_points'] - $seller->current_points;
                \App\Models\PointTransaction::create([
                    'seller_id' => $seller->id,
                    'type' => \App\Enums\PointTransactionTypes::MANUAL_ADJUSTMENT->value,
                    'amount' => $difference,
                    'balance_after' => $sellerData['current_points'],
                ]);
            }

            $seller->update($sellerData);

            if ($seller->wasChanged('average_monthly_sales')) {
                app(\App\Services\Points\SnapshotUpdateService::class)->updateActiveSnapshotsForSeller($seller);
            }

            $this->authKeyService->applyAuth($seller, $seller->distributor);

            return $seller->fresh('user');
        });
    }

    public function delete(Seller $seller): void
    {
        DB::transaction(function () use ($seller) {
            $seller->user->deleteImage();
            $seller->delete();
            $seller->user->delete();
        });
    }

    protected function normalizePhone(string $raw): string
    {
        $normalized = $this->phoneNormalizer->normalize($raw);

        if (!$normalized) {
            throw new \InvalidArgumentException("El número de teléfono '{$raw}' no es válido.");
        }

        return $normalized;
    }
}
