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
            $table->datetime('date_sweeped')->after('remaining_amount')->nullable();
            $table->bigInteger('sweeped_by')->after('date_sweeped')->nullable()->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ref_department_allocations', function (Blueprint $table) {
            $table->dropColumn('date_sweeped');
            $table->dropColumn('sweeped_by');
        });
    }
};
