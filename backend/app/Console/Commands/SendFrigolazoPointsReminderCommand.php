<?php

namespace App\Console\Commands;

use App\Mail\FrigolazoPointsReminderMail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendFrigolazoPointsReminderCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'frigolazo:send-points-reminder {--limit=100} {--test= : Correos separados por coma para enviar una prueba}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send Frigolazo points reminder emails to sellers who have at least one point.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $limit = $this->option('limit');
        $testEmails = $this->option('test');

        if ($testEmails) {
            $limit = 1; // Solo necesitamos un usuario para generar la prueba
        }

        // Find users who are active, belong to a seller with at least 1 point
        $users = User::where('is_active', true)
            ->whereHas('role', function ($query) {
                $query->where('slug', 'seller');
            })
            ->whereHas('seller', function ($query) {
                $query->where('current_points', '>=', 1);
            })
            ->with(['seller.distributor'])
            ->limit($limit)
            ->get();

        if ($users->isEmpty()) {
            $this->info('No users found with points to send reminders.');
            return 0;
        }

        $this->info("Found {$users->count()} sellers with points. Sending reminders...");

        $sentCount = 0;
        $authKeyService = app(\App\Services\Auth\SellerAuthKeyService::class);

        foreach ($users as $user) {
            $seller = $user->seller;
            $distributor = $seller->distributor;

            if (!$distributor || (!$user->email && !$testEmails)) {
                continue;
            }

            try {
                $authKeyService->applyAuth($seller, $distributor);
                
                $identifier = $authKeyService->resolveIdentifier($distributor->identifier_type, $user, $seller);
                $credential = $authKeyService->resolveCredential($distributor->credential_type, $user, $seller);
                
                $identifierLabel = $distributor->identifier_type->label();
                $credentialLabel = $distributor->credential_type->label();
                
                if ($testEmails) {
                    $emails = explode(',', $testEmails);
                    foreach ($emails as $email) {
                        $mail = new FrigolazoPointsReminderMail(
                            $user,
                            $identifier,
                            $identifierLabel,
                            $credential,
                            $credentialLabel,
                            $distributor,
                            $seller->current_points,
                            true // isTest: remove BCCs for the test
                        );
                        Mail::to(trim($email))->send($mail);
                        $this->info("Sent test reminder to " . trim($email));
                    }
                    $this->info("Prueba enviada. El comando se detendrá aquí para no enviar a usuarios reales.");
                    return 0; // Detener después de mandar la prueba
                }

                $mail = new FrigolazoPointsReminderMail(
                    $user,
                    $identifier,
                    $identifierLabel,
                    $credential,
                    $credentialLabel,
                    $distributor,
                    $seller->current_points
                );

                Mail::to($user->email)->send($mail);
                
                $sentCount++;
                $this->info("Sent reminder to {$user->email}");
            } catch (\Exception $e) {
                Log::error("Failed to send Frigolazo points reminder to {$user->email}: " . $e->getMessage());
                $this->error("Failed to send reminder to {$user->email}");
            }
        }

        $this->info("Successfully sent {$sentCount} reminders.");
        return 0;
    }
}
