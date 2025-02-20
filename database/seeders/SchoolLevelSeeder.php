<?php

namespace Database\Seeders;

use App\Models\RefSchoolLevel;
use Illuminate\Database\Seeder;

class SchoolLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        RefSchoolLevel::truncate();

        $data = [
            [
                'school_level' => 'Elementary',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Jr Highschool',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Sr Highschool',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'College',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        RefSchoolLevel::insert($data);
    }
}
