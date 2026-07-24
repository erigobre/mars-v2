<?php

use App\Enums\CredentialType;
use App\Enums\IdentifierType;
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
            $table->string('identifier_type')
                  ->default(IdentifierType::PHONE->value)
                  ->after('company_name')
                  ->comment('Determina el campo de login: phone, email, employee_code');

            $table->string('credential_type')
                  ->default(CredentialType::BIRTHDATE->value)
                  ->after('identifier_type')
                  ->comment('Determina la contraseña: phone, email, birthdate, employee_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('distributors', function (Blueprint $table) {
            $table->dropColumn(['identifier_type', 'credential_type']);
        });
    }
};
