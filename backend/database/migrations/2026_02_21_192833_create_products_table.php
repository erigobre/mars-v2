<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\UnitType;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('display_id')->constrained('displays')->onDelete('restrict');
            $table->string('sku')->unique();
            $table->string('upc')->unique()->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->decimal('default_price', 10, 2);
            $table->enum('unit_type', UnitType::values())->default(UnitType::PIECE->value);
            $table->string('custom_unit_type')->nullable();
            $table->string('category')->nullable();
            // $table->integer('stock')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
