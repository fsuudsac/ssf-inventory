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

            $table->bigInteger('user_id')->nullable();
            $table->string('firstname', 100)->nullable();
            $table->string('middlename', 100)->nullable();
            $table->string('lastname', 100)->nullable();
            $table->string('name_ext', 50)->nullable();
            $table->string('gender')->nullable();
            $table->date('birthdate')->nullable();
            $table->longText('birthplace')->nullable();
            $table->integer('age')->nullable();

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
