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
        Schema::table('profile_addresses', function (Blueprint $table) {
            // Add status column to track primary address per type (1 = primary, 0 = not primary)
            $table->tinyInteger('status')->default(0)->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profile_addresses', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
