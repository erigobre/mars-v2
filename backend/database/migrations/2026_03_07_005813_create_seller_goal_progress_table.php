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
        Schema::create('seller_goal_progress', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('goal_id')->constrained('goals')->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained('sellers')->cascadeOnDelete();
            
            // Aquí se va sumando mágicamente cada vez que procesa ventas
            $table->decimal('current_value', 15, 4)->default(0);
            
            $table->boolean('reached')->default(false);
            $table->boolean('bonus_awarded')->default(false);
            $table->timestamp('reached_at')->nullable();
            
            $table->timestamps();

            // Índices para búsquedas rápidas en el dashboard
            $table->unique(['goal_id', 'seller_id']); 
            $table->index(['seller_id', 'reached']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_goal_progress');
    }
};
