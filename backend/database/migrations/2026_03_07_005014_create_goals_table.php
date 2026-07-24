<?php

use App\Enums\GoalType;
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
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('cycle_id')->constrained('redemption_cycles')->cascadeOnDelete();
            
            $table->string('name');
            $table->text('description')->nullable();
            
            // Tipos de meta (ej. TOTAL_SALES_AMOUNT, SPECIFIC_PRODUCT_QTY, etc)
            $table->enum('type', GoalType::values()); 
            
            $table->decimal('target_value', 15, 4); 
            $table->integer('reward_points')->default(0);
            
            $table->boolean('is_active')->default(true);

            // Filtros polimórficos según el 'type'
            $table->unsignedBigInteger('product_id')->nullable();
            $table->unsignedBigInteger('display_id')->nullable();

            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
            $table->foreign('display_id')->references('id')->on('displays')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
