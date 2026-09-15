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
        Schema::create('purchase_request_product_details', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('pr_product_id')->nullable()->index();
            $table->bigInteger('supplier1_id')->nullable()->index();
            $table->bigInteger('supplier2_id')->nullable()->index();
            $table->bigInteger('supplier3_id')->nullable()->index();
            $table->bigInteger('selected_supplier_id')->nullable()->index();
            $table->bigInteger('alt_supplier_id')->nullable()->index();
            // $table->bigInteger('alt_product_detail_price_id')->nullable()->index();
            $table->string('status')->nullable(); // 

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
        Schema::dropIfExists('purchase_request_product_details');
    }
};
