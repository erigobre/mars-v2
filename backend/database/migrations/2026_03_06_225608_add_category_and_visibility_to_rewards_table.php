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
        Schema::table('rewards', function (Blueprint $table) {
            $table->string('category')->nullable()->after('description')->index();
    
            $table->enum('visibility', ['always', 'campaign_end', 'cycle_end'])
                ->default('always')
                ->after('is_active');
            
            $table->unsignedInteger('max_global_claims')->nullable()->default(null)->after('stock');
            $table->unsignedInteger('total_claimed')->default(0)->after('max_global_claims');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rewards', function (Blueprint $table) {
            $table->dropColumn('category');
            $table->dropColumn('visibility');
            $table->dropColumn('max_global_claims');
            $table->dropColumn('total_claimed');
        });
    }
};
