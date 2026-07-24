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
        Schema::create('seller_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('Ej: Cospor Bajo, Cospor Regular, Cospor VIP');
            $table->string('slug')->unique()->comment('bajo, regular, vip');
            $table->decimal('min_average_sales', 10, 2)->comment('Promedio mínimo de ventas');
            $table->decimal('max_average_sales', 10, 2)->nullable()->comment('Promedio máximo (null = sin límite)');
            $table->integer('order')->default(0)->comment('Orden de visualización');
            $table->string('color', 7)->nullable()->comment('Color hex para UI (#FF5733)');
            $table->string('icon')->nullable()->comment('Icono o emoji');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['min_average_sales', 'max_average_sales']);
        });

        Schema::table('sellers', function (Blueprint $table) {
            $table->foreignId('seller_tier_id')->nullable()->constrained()->nullOnDelete();
            $table->index('seller_tier_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sellers', function (Blueprint $table) {
            $table->dropForeign(['seller_tier_id']);
            $table->dropColumn('seller_tier_id');
        });
        
        Schema::dropIfExists('seller_tiers');
    }
};
