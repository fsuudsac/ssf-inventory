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
        Schema::create('ref_department_allocations', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('department_id')->nullable()->index();
            $table->bigInteger('school_year_id')->nullable()->index();
            $table->string('base_amount')->nullable()->index();
            $table->string('remaining_amount')->nullable()->index();
            $table->boolean('status')->default(0)->nullable();

            $table->bigInteger('created_by')->nullable();
            $table->bigInteger('updated_by')->nullable();
            $table->bigInteger('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ref_department_allocations');
    }
};
