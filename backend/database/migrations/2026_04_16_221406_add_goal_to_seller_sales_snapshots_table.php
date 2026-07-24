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
        Schema::table('seller_sales_snapshots', function (Blueprint $table) {
            $table->decimal('target_average', 10, 2)->comment('La meta que se congeló para este periodo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_sales_snapshots', function (Blueprint $table) {
            $table->dropColumn('target_average');
        });
    }
};
