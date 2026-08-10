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
        Schema::create('purchase_details', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('purchase_id')->nullable()->index();
            $table->bigInteger('product_detail_id')->nullable()->index();
            $table->string('quantity')->nullable();
            $table->string('cost')->nullable();
            $table->string('total_cost')->nullable();
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
        Schema::dropIfExists('purchase_details');
    }
};
