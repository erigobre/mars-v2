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
        Schema::create('reward_tier_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reward_id')->constrained()->cascadeOnDelete();
            $table->foreignId('seller_tier_id')->constrained()->cascadeOnDelete();
            $table->integer('price_in_points')->comment('Costo en puntos para este rango');
            $table->timestamps();

            $table->unique(['reward_id', 'seller_tier_id'], 'reward_tier_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reward_tier_prices');
    }
};
