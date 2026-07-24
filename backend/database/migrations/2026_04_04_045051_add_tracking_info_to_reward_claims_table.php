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
        Schema::table('reward_claims', function (Blueprint $table) {
            $table->string('carrier')->nullable()->after('status')->comment('Nombre de la paquetería');
            $table->string('tracking_number')->nullable()->after('carrier')->comment('Guía de rastreo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reward_claims', function (Blueprint $table) {
            $table->dropColumn('carrier');
            $table->dropColumn('tracking_number');
        });
    }
};
