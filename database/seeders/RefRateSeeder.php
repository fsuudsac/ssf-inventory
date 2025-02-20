<?php

namespace Database\Seeders;

use App\Models\RefRate;
use Illuminate\Database\Seeder;

class RefRateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        RefRate::truncate();

        $dataRate = [
            [
                "name" => "Doctor",
                "rate" => "150",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "name" => "Masters",
                "rate" => "125",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "name" => "No Masters",
                "rate" => "100",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ];
        RefRate::insert($dataRate);
    }
}
