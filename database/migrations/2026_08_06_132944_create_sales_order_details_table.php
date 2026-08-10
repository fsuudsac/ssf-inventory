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
        Schema::create('sales_order_details', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('sales_order_id')->nullable()->index();
            $table->bigInteger('product_detail_id')->nullable()->index();
            $table->string('quantity')->nullable();
            $table->string('price')->nullable();
            $table->string('total_selling_price')->nullable();
            $table->string('vat')->nullable();
            $table->string('gross_amount')->nullable();
            $table->string('orig_cost')->nullable();
            $table->string('orig_dealers_price')->nullable();
            $table->string('orig_wholesale_price')->nullable();
            $table->string('orig_srp')->nullable();
            $table->string('orig_fleet_price')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_order_details');
    }
};
