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
        Schema::table('users', function (Blueprint $table) {
            $table->string('login_key')->unique()->nullable()->after('phone')
                  ->comment('Clave de acceso unificada: {dist_id}/{id_value} para sellers, phone para el resto');
 
            $table->string('phone', 20)->nullable()->change();
            $table->string('email')->nullable()->change();
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['login_key']);
            $table->dropColumn('login_key');
 
            $table->string('phone', 20)->nullable(false)->change();
            $table->string('email')->nullable(false)->change();
        });
    }
};
