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
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('warehouse_id')->nullable()->index();
            $table->bigInteger('sales_order_detail_id')->nullable()->index();
            $table->bigInteger('sales_order_return_detail_id')->nullable()->index();
            $table->bigInteger('transfer_detail_id')->nullable()->index();
            $table->bigInteger('purchase_detail_id')->nullable()->index();
            $table->bigInteger('purchase_return_detail_id')->nullable()->index();
            $table->bigInteger('product_detail_id')->nullable()->index();
            $table->string('amount')->nullable();
            $table->string('quantity')->nullable();
            $table->string('type')->nullable();
            $table->date('date_inventory')->nullable();

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
        Schema::dropIfExists('inventories');
    }
};
