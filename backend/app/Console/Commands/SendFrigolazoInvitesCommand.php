<?php

namespace App\Console\Commands;

use App\Mail\FrigolazoInviteMail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendFrigolazoInvitesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'frigolazo:send-invites {--limit=100}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send Frigolazo invite emails to sellers who have not logged in yet.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $limit = $this->option('limit');

        // Find users who are active, belong to a seller, and have not logged in
        $users = User::where('is_active', true)
            ->whereNull('last_login_at')
            ->whereHas('role', function ($query) {
                $query->where('slug', 'seller');
            })
            ->whereHas('seller')
            ->with(['seller.distributor'])
            ->limit($limit)
            ->get();

        if ($users->isEmpty()) {
            $this->info('No pending users found to send invites.');
            return 0;
        }

        $this->info("Found {$users->count()} sellers who haven't logged in. Sending invites...");

        $sentCount = 0;
        $authKeyService = app(\App\Services\Auth\SellerAuthKeyService::class);

        foreach ($users as $user) {
            $seller = $user->seller;
            $distributor = $seller->distributor;

            if (!$distributor || !$user->email) {
                continue;
            }

            try {
                $authKeyService->applyAuth($seller, $distributor);
                
                $identifier = $authKeyService->resolveIdentifier($distributor->identifier_type, $user, $seller);
                $credential = $authKeyService->resolveCredential($distributor->credential_type, $user, $seller);
                
                $identifierLabel = $distributor->identifier_type->label();
                $credentialLabel = $distributor->credential_type->label();
                
                Mail::to($user->email)->send(new FrigolazoInviteMail(
                    $user,
                    $identifier,
                    $identifierLabel,
                    $credential,
                    $credentialLabel,
                    $distributor
                ));
                
                $sentCount++;
                $this->info("Sent invite to {$user->email}");
            } catch (\Exception $e) {
                Log::error("Failed to send Frigolazo invite to {$user->email}: " . $e->getMessage());
                $this->error("Failed to send invite to {$user->email}");
            }
        }

        $this->info("Successfully sent {$sentCount} invites.");
        return 0;
    }
}
