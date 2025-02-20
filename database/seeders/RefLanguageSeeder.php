<?php

namespace Database\Seeders;

use App\Models\RefLanguage;
use Illuminate\Database\Seeder;

class RefLanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        RefLanguage::truncate();

        $data = [
            ["language" => "Aklanon", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Bikol", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Cebuano", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Chavacano", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "English", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Hiligaynon", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Ibanag", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Ilocano", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Ivatan", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Kapampangan", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Kinaray", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Maguinadanao", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Maranao", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Pangasinan", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Sambal", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Surigaonon", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Tagalog", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Tausug", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Waray", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Yakan", "created_by" => 1, "created_at" => now(), "updated_at" => now()],
            ["language" => "Others", "created_by" => 1, "created_at" => now(), "updated_at" => now()],

        ];

        RefLanguage::insert($data);
    }
}
