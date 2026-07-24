<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sellers', function (Blueprint $table) {
            if (!$this->hasIndex('sellers', 'idx_distributor_id')) {
                $table->index('distributor_id', 'idx_distributor_id');
            }
        });

        Schema::table('point_transactions', function (Blueprint $table) {
            if (!$this->hasIndex('point_transactions', 'idx_seller_type')) {
                $table->index(['seller_id', 'type'], 'idx_seller_type');
            }
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            if (!$this->hasIndex('activity_logs', 'idx_user_created')) {
                $table->index(['user_id', 'created_at'], 'idx_user_created');
            }
            if (!$this->hasIndex('activity_logs', 'idx_loggable')) {
                $table->index(['loggable_type', 'loggable_id'], 'idx_loggable');
            }
        });

        Schema::table('sales', function (Blueprint $table) {
            if (!$this->hasIndex('sales', 'idx_seller_date')) {
                $table->index(['seller_id', 'sale_date'], 'idx_seller_date');
            }
        });

        Schema::table('sale_items', function (Blueprint $table) {
            if (!$this->hasIndex('sale_items', 'idx_product_sale')) {
                $table->index(['product_id', 'sale_id'], 'idx_product_sale');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sellers', fn (Blueprint $t) => $t->dropIndex('idx_distributor_id'));
        Schema::table('point_transactions', fn (Blueprint $t) => $t->dropIndex('idx_seller_type'));
        Schema::table('activity_logs', function (Blueprint $t) {
            $t->dropIndex('idx_user_created');
            $t->dropIndex('idx_loggable');
        });
        Schema::table('sales', fn (Blueprint $t) => $t->dropIndex('idx_seller_date'));
        Schema::table('sale_items', fn (Blueprint $t) => $t->dropIndex('idx_product_sale'));
    }

    private function hasIndex(string $table, string $index): bool
    {
        return collect(\DB::select("SHOW INDEX FROM `{$table}` WHERE Key_name = ?", [$index]))->isNotEmpty();
    }
};
