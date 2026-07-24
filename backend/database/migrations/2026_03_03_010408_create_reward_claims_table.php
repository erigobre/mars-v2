<?php

use App\Enums\RewardClaimStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reward_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('redemption_cycle_id')->constrained('redemption_cycles')->onDelete('restrict');
            $table->foreignId('seller_id')->constrained()->onDelete('restrict');
            $table->foreignId('reward_id')->constrained()->onDelete('restrict');
            $table->string('folio')->unique();
            $table->unsignedInteger('points_spent');
            $table->enum('status', RewardClaimStatus::values())->default(RewardClaimStatus::PENDING->value);

            // Snapshot de dirección en el momento del canje
            $table->string('shipping_name')->nullable();
            $table->string('shipping_street')->nullable();
            $table->string('shipping_colonia')->nullable();
            $table->string('shipping_city')->nullable();
            $table->string('shipping_state')->nullable();
            $table->string('shipping_zip')->nullable();
            $table->text('shipping_notes')->nullable();

            $table->text('notes')->nullable();          // Notas internas del admin
            $table->timestamp('claimed_at')->useCurrent();
            $table->timestamp('reserved_until')->nullable();
            $table->timestamps();

            // Un vendedor solo puede canjear UNA VEZ por ciclo
            $table->unique(['redemption_cycle_id', 'seller_id'], 'one_claim_per_cycle');

            $table->index(['seller_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reward_claims');
    }
};
