<?php

namespace App\Services\Distributor;

use App\Enums\CredentialType;
use App\Enums\IdentifierType;
use App\Models\Distributor;
use App\Models\Role;
use App\Models\User;
use App\Services\Auth\SellerAuthKeyService;
use App\Services\Phone\PhoneNormalizerService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use InvalidArgumentException;

class DistributorService
{
    public function __construct(
        protected PhoneNormalizerService $phoneNormalizer,
        protected SellerAuthKeyService $authKeyService
    ) {}

    public function create(array $data, ?UploadedFile $avatar = null)
    {
        return DB::transaction(function () use ($data, $avatar) {
            $distributorRole = Role::where('slug', 'distributor')->firstOrFail();

            $phone = $this->normalizePhone($data['phone'] ?? null);

            $user = User::create([
                'username' => $data['username'],
                'email' => $data['email'],
                'birthdate' => $data['birthdate'],
                'phone' => $phone,
                'avatar' => $data['avatar'] ?? null,
                'is_active' => $data['is_active'] ?? true,
                'role_id' => $distributorRole->id,
            ]);

            if ($avatar) $user->uploadImage($avatar);

            $distributor = Distributor::create([
                'user_id' => $user->id,
                'company_name' => $data['company_name'],
                'points_calculation_strategy' => $data['points_calculation_strategy'] ?? null,
                'growth_percentage'           => $data['growth_percentage'] ?? 0,
                'average_evaluation_scope'    => $data['average_evaluation_scope'] ?? 'cycle',
                'identifier_type' => $data['identifier_type'] ?? null,
                'credential_type' => $data['credential_type'] ?? null,
            ]);

            return $distributor->load('user');
        });
    }

    public function update(Distributor $distributor, array $data, ?UploadedFile $avatar = null)
    {
        $newIdentifierValue = $data['identifier_type'] ?? $distributor->identifier_type->value;
        $newCredentialValue = $data['credential_type'] ?? $distributor->credential_type->value;

        $authConfigChanged = ($newIdentifierValue !== $distributor->identifier_type->value) ||
                             ($newCredentialValue !== $distributor->credential_type->value);

        if ($authConfigChanged) {
            $this->verifySellersMissingData(
                $distributor, 
                IdentifierType::from($newIdentifierValue), 
                CredentialType::from($newCredentialValue)
            );
        }

        return DB::transaction(function () use ($distributor, $data, $avatar, $authConfigChanged) {
            $user = $distributor->user;

            $userData = array_filter([
                'username'  => $data['username'] ?? null,
                'email'     => $data['email'] ?? null,
                'birthdate' => $data['birthdate'] ?? null,
                'phone'     => isset($data['phone']) ? $this->phoneNormalizer->normalize($data['phone']) : null,
                'password'  => isset($data['password']) ? Hash::make($data['password']) : null,
                'is_active' => $data['is_active'] ?? null,
            ], fn($v) => $v !== null);

            $user->update($userData);

            if ($avatar) $this->uploadImage($avatar);

            $distributorData = array_filter([
                'company_name' => $data['company_name'] ?? null,
                // 'points_calculation_strategy' => $data['points_calculation_strategy'] ?? $distributor->points_calculation_strategy,
                'growth_percentage'           => $data['growth_percentage'] ?? $distributor->growth_percentage,
                'average_evaluation_scope'    => $data['average_evaluation_scope'] ?? $distributor->average_evaluation_scope,
                'identifier_type' => $data['identifier_type'] ?? $distributor->identifier_type,
                'credential_type' => $data['credential_type'] ?? $distributor->credential_type,
            ], fn($v) => $v !== null);

            // Forzar a points_calculation_strategy a ser null si no viene en el request, para permitir resetearlo a la configuración por defecto
            $distributorData['points_calculation_strategy'] = $data['points_calculation_strategy'] ?? null;

            $distributor->update($distributorData);

            if ($distributor->wasChanged(['growth_percentage', 'average_evaluation_scope'])) {
                app(\App\Services\Points\SnapshotUpdateService::class)->updateActiveSnapshotsForDistributor($distributor);
            }

            if ($authConfigChanged) {
                $distributor->sellers()->with('user')->chunkById(100, function ($sellers) use ($distributor) {
                    foreach ($sellers as $seller) {
                        $this->authKeyService->applyAuth($seller, $distributor);
                    }
                });
            }

            return $distributor->fresh()->load('user');
        });
    }

    public function delete(Distributor $distributor): void
    {
        DB::transaction(function () use ($distributor) {
            // $companyName = $distributor->company_name;
            $distributor->user->deleteImage();
            $distributor->user->delete();
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

    private function verifySellersMissingData(Distributor $distributor, IdentifierType $identifier, CredentialType $credential): void
    {
        $missingIdentifierCount = $distributor->sellers()
            ->whereHas('user', function ($query) use ($identifier) {
                if (!$identifier->isSeller()) {
                    $query->whereNull($identifier->userField());
                }
            })
            ->when($identifier->isSeller(), function ($query) {
                $query->whereNull('employee_code');
            })
            ->count();

        if ($missingIdentifierCount > 0) {
            throw new InvalidArgumentException("No se puede actualizar. Hay {$missingIdentifierCount} vendedores sin el campo '{$identifier->label()}' registrado.");
        }

        // Revisar si faltan credenciales (contraseñas base)
        $missingCredentialCount = $distributor->sellers()
            ->whereHas('user', function ($query) use ($credential) {
                if ($credential->value !== 'employee_code') {
                    $query->whereNull($credential->value);
                }
            })
            ->when($credential->value === 'employee_code', function ($query) {
                $query->whereNull('employee_code');
            })
            ->count();

        if ($missingCredentialCount > 0) {
            throw new InvalidArgumentException("No se puede actualizar. Hay {$missingCredentialCount} vendedores sin el campo '{$credential->label()}' registrado.");
        }
    }
}
