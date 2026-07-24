<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('theme_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value');
            $table->enum('type', ['color', 'url', 'text', 'boolean'])->default('text');
            $table->string('label', 255)->nullable();
            $table->timestamps();
        });

        DB::table('theme_settings')->insert([
            ['key' => 'primary_color',        'value' => '#6366f1', 'type' => 'color',   'label' => 'Color primario',          'created_at' => now(), 'updated_at' => now()],
            ['key' => 'secondary_color',       'value' => '#f59e0b', 'type' => 'color',   'label' => 'Color secundario',        'created_at' => now(), 'updated_at' => now()],
            ['key' => 'accent_color',          'value' => '#10b981', 'type' => 'color',   'label' => 'Color acento',            'created_at' => now(), 'updated_at' => now()],
            ['key' => 'app_name',              'value' => 'Gana con Mars', 'type' => 'text', 'label' => 'Nombre del sistema',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'logo_url',              'value' => '',        'type' => 'url',    'label' => 'URL del logo',            'created_at' => now(), 'updated_at' => now()],
            ['key' => 'background_image_url',  'value' => '',        'type' => 'url',    'label' => 'Imagen de fondo (login)', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'favicon_url',           'value' => '',        'type' => 'url',    'label' => 'Favicon URL',             'created_at' => now(), 'updated_at' => now()],
            ['key' => 'seller_card_bg',        'value' => '#1e1b4b', 'type' => 'color',   'label' => 'Fondo tarjeta vendedor',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'button_radius',         'value' => '0.5rem',  'type' => 'text',   'label' => 'Radio de botones (CSS)',  'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('theme_settings');
    }
};
