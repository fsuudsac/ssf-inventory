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
        Schema::table('ref_department_allocations', function (Blueprint $table) {
            $table->bigInteger('allocation_type_id')->after('school_year_id')->nullable()->index();
            $table->string('allocation_name')->after('allocation_type_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ref_department_allocations', function (Blueprint $table) {
            $table->dropColumn('allocation_type_id');
            $table->dropColumn('allocation_name');
        });
    }
};
