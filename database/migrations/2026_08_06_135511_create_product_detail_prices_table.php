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
        Schema::create('product_detail_prices', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('product_id')->nullable()->index();
            $table->bigInteger('product_detail_id')->nullable()->index();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('cost')->nullable();
            $table->string('dealers_price')->nullable();
            $table->string('wholesale_price')->nullable();
            $table->string('srp')->nullable();
            $table->string('fleet_price')->nullable();

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
        Schema::dropIfExists('product_detail_prices');
    }
};
