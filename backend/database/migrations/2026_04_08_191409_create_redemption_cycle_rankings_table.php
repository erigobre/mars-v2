<?php

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
        Schema::create('redemption_cycle_rankings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('redemption_cycle_id')->constrained('redemption_cycles')->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained()->cascadeOnDelete();
            $table->decimal('points_earned')->default(0);
            $table->integer('rank_position');
            $table->timestamps();

            // Evita que un vendedor tenga dos lugares en el mismo ciclo
            $table->unique(['redemption_cycle_id', 'seller_id']);
            $table->index(['redemption_cycle_id', 'rank_position'], 'rc_rankings_rc_id_rank_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('redemption_cycle_rankings');
    }
};
