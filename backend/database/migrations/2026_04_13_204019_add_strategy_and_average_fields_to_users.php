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
        Schema::table('distributors', function (Blueprint $table) {
            $table->string('points_calculation_strategy', 50)
                  ->nullable()
                  ->after('company_name')
                  ->comment('Estrategia a usar: display_based, average_based, etc.');
                  
            $table->decimal('growth_percentage', 5, 2)
                  ->default(0)
                  ->comment('Porcentaje de crecimiento del distribuidor (ej. 15.00 para 15%)');

            $table->enum('average_evaluation_scope', ['cycle', 'campaign'])
                  ->default('cycle')
                  ->after('points_calculation_strategy')
                  ->comment('Define si el promedio del vendedor se evalúa por ciclo (cycle) o por campaña entera (campaign)');
        });

        Schema::table('sellers', function (Blueprint $table) {
            $table->decimal('average_monthly_sales', 10, 2)
                  ->default(0)
                  ->comment('Promedio histórico de ventas (Meta a superar)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('distributors', function (Blueprint $table) {
            $table->dropColumn(['points_calculation_strategy', 'growth_percentage']);
        });

        Schema::table('sellers', function (Blueprint $table) {
            $table->dropColumn('average_monthly_sales');
        });
    }
};
