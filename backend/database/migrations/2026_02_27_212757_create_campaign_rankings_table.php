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
        Schema::create('campaign_rankings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained()->cascadeOnDelete();
            $table->decimal('points_earned')->default(0);
            $table->integer('rank_position');
            $table->integer('final_rank')->nullable();   // Se asigna al COMPLETED de campaña
            $table->timestamps();
            $table->softDeletes();


            $table->unique(['campaign_id', 'seller_id']);
            $table->index(['campaign_id', 'rank_position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_rankings');
    }
};
