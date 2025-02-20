<?php

namespace Database\Seeders;

use App\Models\RefExamCategory;
use Illuminate\Database\Seeder;

class RefExamCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        RefExamCategory::truncate();

        $data = [
            [
                'category' => 'College',
                'exam_fee' => '400',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'Graduate Studies',
                'exam_fee' => '310',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'College of Law',
                'exam_fee' => '750',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        RefExamCategory::insert($data);
    }
}