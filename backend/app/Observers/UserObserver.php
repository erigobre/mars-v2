<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        //
    }

    public function creating(User $user): void
    {
        if (empty($user->login_key) && !empty($user->phone)) {
            $user->login_key = $user->phone;
        }
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        if ($user->isDirty('phone') && !$user->isSeller()) {
            $user->login_key = $user->phone;
        }
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        if($user->distributor) {
            $user->distributor()->delete();
        }
        if($user->seller) {
            $user->seller()->delete();
        }
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        if($user->distributor()->withTrashed()->exists()) {
            $user->distributor()->restore();
        }
        if($user->seller()->withTrashed()->exists()) {
            $user->seller()->restore();
        }
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
