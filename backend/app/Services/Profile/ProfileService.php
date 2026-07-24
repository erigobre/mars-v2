<?php

namespace App\Services\Profile;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ProfileService
{
    public function update(User $user, array $data, ?UploadedFile $avatar = null): User
    {
        return DB::transaction(function () use ($user, $data, $avatar) {

            $userData = array_filter([
                'username' => $data['username'] ?? null,
                'email'    => $data['email']    ?? null,
                'phone'    => $data['phone']    ?? null,
                'password' => isset($data['password']) ? Hash::make($data['password']) : null,
            ], fn($v) => $v !== null);

            $user->update($userData);

            if ($avatar) $user->uploadImage($avatar);

            if ($user->isSeller() && $user->seller) {
                $sellerFields = ['address_street','address_colonia','address_city',
                                 'address_state','address_zip','shipping_notes'];
                $sellerData   = array_filter(
                    collect($data)->only($sellerFields)->toArray(),
                    fn($v) => $v !== null
                );
                if (!empty($sellerData)) $user->seller->update($sellerData);
            }

            if ($user->isDistributor() && $user->distributor && isset($data['company_name'])) {
                $user->distributor->update(['company_name' => $data['company_name']]);
            }

            return $user->fresh();
        });
    }
}