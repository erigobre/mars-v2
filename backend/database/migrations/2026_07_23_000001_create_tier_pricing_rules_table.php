<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tier_pricing_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_tier_id')->constrained()->cascadeOnDelete();
            $table->smallInteger('base_cost')->comment('Valor del enum BaseCost: 1500, 3000, 6000');
            $table->unsignedInteger('price_in_points');
            $table->timestamps();

            $table->unique(['seller_tier_id', 'base_cost'], 'uq_tier_base_cost');
            $table->index('base_cost');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tier_pricing_rules');
    }
};
