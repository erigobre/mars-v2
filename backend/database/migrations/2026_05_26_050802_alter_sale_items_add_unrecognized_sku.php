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
        Schema::table('sale_items', function (Blueprint $table) {
            // Drop foreign key first before changing the column
            $table->dropForeign(['product_id']);
            $table->foreignId('product_id')->nullable()->change();
            // Re-add the foreign key constraint
            $table->foreign('product_id')->references('id')->on('products')->onDelete('restrict');
            
            // Add the new column
            $table->string('unrecognized_sku', 100)->nullable()->after('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropColumn('unrecognized_sku');
            
            $table->dropForeign(['product_id']);
            $table->foreignId('product_id')->nullable(false)->change();
            $table->foreign('product_id')->references('id')->on('products')->onDelete('restrict');
        });
    }
};
