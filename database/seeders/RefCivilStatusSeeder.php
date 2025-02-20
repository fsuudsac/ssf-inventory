<?php

namespace Database\Seeders;

use App\Models\RefCivilStatus;
use Illuminate\Database\Seeder;

class RefCivilStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        RefCivilStatus::truncate();

        $data = [
            [
                'civil_status' => 'Single',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'civil_status' => 'Married',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'civil_status' => 'Separated',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'civil_status' => 'Widowed',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        RefCivilStatus::insert($data);
    }
}
