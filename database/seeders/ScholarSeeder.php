<?php

namespace Database\Seeders;

use App\Models\RefScholarship;
use Illuminate\Database\Seeder;

class ScholarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        RefScholarship::truncate();

        $data = [
            [
                'name' => 'Diocese of Butuan Scholarship',
                'description' => 'Civic/Religious Funded Scholarships',
                'provider' => 'Diocese of Butuan',
                'category' => 'Civic/Religious Funded Scholarships',
                'school_level_id' => 5,
                'benefits' => 'Full tuition only per semester',
                'start_date' => '2024-07-29',
                'end_date' => '2024-07-31',
                'status' => 0,
                'slots' => 10,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'CHED-Merit Scholarship Program',
                'description' => 'CHED-Merit Scholarship Program',
                'provider' => 'CHED',
                'category' => 'Government Funded Scholarships',
                'school_level_id' => 5,
                'benefits' => 'Php 30,000 - Php 60,000 per semester',
                'start_date' => '2023-12-04',
                'end_date' => '2023-12-23',
                'status' => 0,
                'slots' => 10,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Student Assistant Grant-In Aid Program',
                'description' => 'Student Assistant Grant-In Aid Program',
                'provider' => 'FSUU',
                'category' => 'FSUU Funded Scholarships',
                'school_level_id' => 5,
                'benefits' => '15 to 24 units covered per semester',
                'start_date' => '2023-12-02',
                'end_date' => '2023-12-21',
                'status' => 0,
                'slots' => 10,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Undergraduate Scholarships',
                'description' => 'Undergraduate Scholarships',
                'provider' => 'DOST',
                'category' => 'Government Funded Scholarships',
                'school_level_id' => 5,
                'benefits' => 'Php 60,000 above per semester',
                'start_date' => '2023-12-03',
                'end_date' => '2023-12-22',
                'status' => 0,
                'slots' => 10,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ];

        RefScholarship::insert($data);
    }
}