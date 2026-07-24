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
        Schema::create('seller_sales_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained()->cascadeOnDelete();
            
            // Relaciones a la campaña y al ciclo
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('redemption_cycle_id')->nullable()->constrained()->cascadeOnDelete(); 
            
            // Los datos del progreso
            $table->decimal('total_units_sold', 12, 2)->default(0)->comment('Acumulado de unidades vendidas');

            $table->timestamps();

            $table->index(['seller_id', 'redemption_cycle_id'], 'seller_cycle_idx');
            $table->index(['seller_id', 'campaign_id'], 'seller_campaign_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_sales_snapshots');
    }
};
