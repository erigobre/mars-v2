<?php

namespace App\Policies;

use App\Models\Seller;
use App\Models\User;

class SellerPolicy
{

    public function before(User $user): ?bool
    {
        if ($user->role->slug === 'admin') {
            return true;
        }
        
        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->role->slug === 'distributor';
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Seller $seller): bool
    {
        if ($user->role->slug === 'distributor') {
            return $user->distributor && $seller->distributor_id === $user->distributor->id;
        }

        // Un vendedor puede ver su propio perfil
        if ($user->role->slug === 'seller') {
            return $user->seller && $user->seller->id === $seller->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role->slug === 'distributor';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Seller $seller): bool
    {
        if ($user->role->slug === 'distributor') {
            return $user->distributor && $seller->distributor_id === $user->distributor->id;
        }

        // Un vendedor puede actualizar su propio perfil
        if ($user->role->slug === 'seller') {
            return $user->seller && $user->seller->id === $seller->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Seller $seller): bool
    {
        if ($user->role->slug === 'distributor') {
            return $user->distributor && $seller->distributor_id === $user->distributor->id;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Seller $seller): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Seller $seller): bool
    {
        return false;
    }
}
