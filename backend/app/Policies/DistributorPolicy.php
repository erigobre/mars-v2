<?php

namespace App\Policies;

use App\Models\Distributor;
use App\Models\User;

class DistributorPolicy
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
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Distributor $distributor): bool
    {
        if ($user->role->slug === 'distributor') {
            return $user->distributor && $user->distributor->id === $distributor->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Distributor $distributor): bool
    {
        if ($user->role->slug === 'distributor') {
            return $user->distributor && $user->distributor->id === $distributor->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Distributor $distributor): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Distributor $distributor): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Distributor $distributor): bool
    {
        return false;
    }
}
