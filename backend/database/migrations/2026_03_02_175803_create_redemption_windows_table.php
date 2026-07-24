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
        Schema::create('redemption_windows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->constrained('redemption_cycles')->onDelete('cascade');
            $table->dateTime('opens_at');       // Viernes 00:00
            $table->dateTime('closes_at');      // Domingo 23:59
            $table->timestamps();

            $table->index(['opens_at', 'closes_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('redemption_windows');
    }
};
