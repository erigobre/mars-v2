<?php

use App\Enums\SaleUploadMethods;
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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->string('folio')->unique();
            $table->foreignId('seller_id')->constrained()->onDelete('restrict');
            $table->dateTime('sale_date');
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->integer('points_earned')->default(0);
            $table->string('batch_uuid')->nullable();
            $table->enum('upload_method', SaleUploadMethods::values())->default(SaleUploadMethods::MANUAL->value);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['seller_id', 'sale_date']);
            $table->index(['folio']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
