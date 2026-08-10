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
        Schema::create('sales_order_return_details', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('sales_order_return_id')->nullable()->index();
            $table->bigInteger('sales_order_detail_id')->nullable()->index();
            $table->bigInteger('product_detail_id')->nullable()->index();
            $table->string('quantity')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_order_return_details');
    }
};
