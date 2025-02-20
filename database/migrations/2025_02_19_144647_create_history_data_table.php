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
        Schema::create('history_data', function (Blueprint $table) {
            $table->id();

            $table->morphs('historyable');
            $table->string('module_name')->nullable();
            $table->string('field_name')->nullable();
            $table->string('from_value')->nullable();
            $table->string('to_value')->nullable();
            $table->string('action')->nullable();
            $table->ipAddress('ip_address')->nullable();

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
        Schema::dropIfExists('history_data');
    }
};