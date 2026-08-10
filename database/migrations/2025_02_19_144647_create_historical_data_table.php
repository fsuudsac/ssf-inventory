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
        Schema::create('historical_data', function (Blueprint $table) {
            $table->id();

            $table->morphs('historicalable');
            $table->string('subject')->nullable();
            $table->longText('description')->nullable();
            $table->string('field_name')->nullable();
            $table->longText('old_value')->nullable();
            $table->longText('new_value')->nullable();
            $table->string('action')->nullable()->comment('created, updated, deleted, restored');
            $table->string('module')->nullable()->comment('module name');
            $table->string('status')->nullable()->comment('Success, Failed');

            $table->ipAddress('ip_address')->nullable();
            $table->longText('browser')->nullable();

            $table->bigInteger('created_by')->nullable();
            $table->bigInteger('updated_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historical_data');
    }
};
