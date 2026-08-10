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
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('warehouse_id')->nullable()->index()->comment('User ID');
            $table->bigInteger('supplier_id')->nullable()->index()->comment('User ID');
            $table->string('invoice_no')->nullable();
            $table->string('type')->nullable();
            $table->date('date_purchased')->nullable();
            $table->date('date_due')->nullable();
            $table->date('date_returned')->nullable();
            $table->string('vat_type')->nullable();
            $table->integer('ewt_type_id')->nullable()->index();
            $table->string('terms')->nullable();
            $table->integer('credit_term_id')->nullable()->index();
            $table->string('discount')->nullable();
            $table->string('total_gross_amount')->nullable();
            $table->string('value_added_tax')->nullable();
            $table->string('total_amount_payable')->nullable();
            $table->string('withholding_tax')->nullable();
            $table->string('amount_due')->nullable();
            $table->string('net_amount_due')->nullable();
            $table->string('taxpayer_identification')->nullable();
            $table->bigInteger('profile_address_id')->nullable()->index();
            $table->string('paid_status')->nullable();

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
        Schema::dropIfExists('purchases');
    }
};
