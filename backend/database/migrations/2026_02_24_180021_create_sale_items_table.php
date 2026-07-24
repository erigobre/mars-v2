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
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('restrict');
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 10, 2);       // Precio de referencia (custom o default)
            $table->decimal('subtotal', 12, 2);         //  Monto reportado real
            $table->decimal('points_per_unit', 10, 2)->default(0); // Snapshot de display.value_points
            $table->decimal('total_points', 10, 2)->default(0);
            $table->string('applied_rule', 100)->nullable();       // Descripción de la regla aplicada
            $table->timestamps();

            $table->index('sale_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};
