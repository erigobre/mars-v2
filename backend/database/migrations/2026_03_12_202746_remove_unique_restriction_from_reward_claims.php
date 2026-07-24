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
            $table->dropForeign(['redemption_cycle_id']);
            $table->dropForeign(['seller_id']);

            $table->dropUnique('one_claim_per_cycle');

            $table->foreign('redemption_cycle_id')->references('id')->on('redemption_cycles')->onDelete('restrict');
            $table->foreign('seller_id')->references('id')->on('sellers')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reward_claims', function (Blueprint $table) {
            $table->dropForeign(['redemption_cycle_id']);
            $table->dropForeign(['seller_id']);

            $table->unique(['redemption_cycle_id', 'seller_id'], 'one_claim_per_cycle');

            $table->foreign('redemption_cycle_id')->references('id')->on('redemption_cycles')->onDelete('restrict');
            $table->foreign('seller_id')->references('id')->on('sellers')->onDelete('restrict');
        });
    }
};
