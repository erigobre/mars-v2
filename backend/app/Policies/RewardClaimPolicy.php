<?php

namespace App\Policies;

use App\Models\RewardClaim;
use App\Models\User;

class RewardClaimPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, RewardClaim $rewardClaim): bool
    {
        if ($user->isAdmin() || $user->isLogistics()) {
            return true;
        }
    
        if ($user->isSeller()) {
            return (int)$rewardClaim->seller_id === (int)$user->seller->id;
        }
    
        if ($user->isDistributor()) {
            return $rewardClaim->seller->distributor_id === $user->distributor?->id;
        }
    
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Solo vendedores pueden iniciar un canje, pero esta lógica se maneja en el controlador.
        return $user->role->slug === 'seller' && $user->seller !== null;
    }

    public function reserve(User $user): bool
    {
        // Solo vendedores pueden reservar un canje, pero esta lógica se maneja en el controlador.
        return $user->role->slug === 'seller' && $user->seller !== null;
    }

    public function completeClaim(User $user, RewardClaim $rewardClaim): bool
    {
        // Solo aDMINS Y DiSTRIBUIDORES pueden completar un canje, pero esta lógica se maneja en el controlador.
        if($user->role->slug === 'admin') {
            return true;
        }
        if($user->role->slug === 'distributor' && $user->distributor !== null && $rewardClaim->seller->distributor_id === $user->distributor->id) {
            return true;
        }
        
        return $user->role->slug === 'seller' && $user->seller !== null && $user->seller->id === $rewardClaim->seller_id;
    }



    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, RewardClaim $rewardClaim): bool
    {
        if ($user->isAdmin() || $user->isLogistics()) return true;
    
        if ($user->isDistributor()) {
            return $rewardClaim->seller->distributor_id === $user->distributor?->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, RewardClaim $rewardClaim): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, RewardClaim $rewardClaim): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, RewardClaim $rewardClaim): bool
    {
        return false;
    }
}
