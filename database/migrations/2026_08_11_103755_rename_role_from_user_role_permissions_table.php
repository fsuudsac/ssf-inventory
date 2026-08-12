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
        Schema::table('user_role_permissions', function (Blueprint $table) {
            $table->renameColumn('role', 'user_role_id');
        });

        Schema::table('user_role_permissions', function (Blueprint $table) {
            $table->integer('user_role_id')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_role_permissions', function (Blueprint $table) {
            $table->string('user_role_id')->change();
        });

        Schema::table('user_role_permissions', function (Blueprint $table) {
            $table->renameColumn('user_role_id', 'role');
        });
    }
};
