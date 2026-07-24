<?php

use App\Enums\PointTransactionTypes;
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
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained()->onDelete('restrict');
            $table->integer('amount');
            $table->enum('type', PointTransactionTypes::values())->index();
            $table->integer('balance_after')->default(0);
            $table->foreignId('sale_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('point_transactions');
    }
};
