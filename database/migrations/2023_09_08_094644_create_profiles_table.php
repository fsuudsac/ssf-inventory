<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProfilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('user_id')->nullable()->index();
            $table->string('firstname')->nullable();
            $table->string('middlename')->nullable();
            $table->string('lastname')->nullable();
            $table->string('name_ext')->nullable();
            $table->string('salutation')->nullable();
            $table->string('gender')->nullable();
            $table->string('contact_no')->nullable();
            $table->string('personal_email')->nullable();
            $table->string('taxpayer_identification')->nullable();
            $table->string('supplier_ledger')->nullable();
            $table->integer('company_id')->nullable()->index();
            $table->longText('address')->nullable();
            $table->string('customer_type')->nullable();

            $table->bigInteger('created_by')->nullable();
            $table->bigInteger('updated_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('profiles');
    }
}
