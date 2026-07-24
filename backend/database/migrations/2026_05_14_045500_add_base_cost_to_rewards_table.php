<?php

use App\Enums\BaseCost;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rewards', function (Blueprint $table) {
            $table->unsignedInteger('base_cost')
                ->nullable()
                ->after('points_required')
                ->comment('Categoría de costo base: 1500, 3000, 6000');
        });

        // Poblar base_cost a partir del catálogo existente
        $catalog = [
            'Gorra Adidas de béisbol México 26 con 3 STRIPES KD4392- KD4391 - KD4390' => 1500,
            'JBL Grip' => 3000,
            'JBL Flip 7' => 3000,
            'Bocina inalámbrica portátil XE300 de la serie X' => 3000,
            '895098-0100BOSE' => 3000,
            'HUAWEI Band 10' => 1500,
            'Xiaomi Smart Band 10' => 1500,
            'HUAWEI WATCH FIT 4' => 3000,
            'PANTALLA INTELIGENTE AMAZON ECHO SHOW 5 NEGRA CON ALEXA' => 3000,
            'Galaxy Fit3' => 1500,
            '06941812791585 XIAOMI' => 1500,
            'Jersey Local Selección Nacional de México 26' => 3000,
            'TELEVISION PANTALLA 32 PULGADAS LG SMART TV HD 32LR600BPSC' => 6000,
            'UN32H5000FFSAMSUNG' => 6000,
            'Hisense Refrigerador Compacto RR16D6ABX1 1.6 pies' => 6000,
            'Hisense Refrigerador Compacto RR33D6ABX1 3.3 pies' => 6000,
            'Refrigerador Compacto RR33D6AGX1' => 6000,
            'Frigobar Manual 45 L Inoxidable Mabe - RMF0260XMXX3 SKU RMF0260XMXX3' => 3000,
        ];

        foreach ($catalog as $name => $baseCost) {
            DB::table('rewards')
                ->where('name', $name)
                ->update(['base_cost' => $baseCost]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rewards', function (Blueprint $table) {
            $table->dropColumn('base_cost');
        });
    }
};
