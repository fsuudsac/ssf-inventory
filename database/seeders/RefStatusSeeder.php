<?php

namespace Database\Seeders;

use App\Models\RefStatus;
use App\Models\RefStatusCategory;
use Illuminate\Database\Seeder;

class RefStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        RefStatusCategory::truncate();
        RefStatus::truncate();

        $dataCategory = [
            [
                "status_category" => "Faculty Monitoring",
                "code" => "SC-01",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "status_category" => "Faculty Monitoring Justification",
                "code" => "SC-02",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ];

        RefStatusCategory::insert($dataCategory);


        $dataStatus1 = [
            [
                "status" => "Present",
                "status_category_id" => 1,
                "code" => "S-01",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "status" => "With Instructor, No Students",
                "status_category_id" => 1,
                "code" => "S-03",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "status" => "No Instructor, With Students",
                "status_category_id" => 1,
                "code" => "S-04",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "status" => "No Instructor, No Students",
                "status_category_id" => 1,
                "code" => "S-05",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "status" => "Early Dismissal",
                "status_category_id" => 1,
                "code" => "S-06",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "status" => "Absent",
                "status_category_id" => 1,
                "code" => "S-10",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ];
        RefStatus::insert($dataStatus1);

        $dataStatus2 = [
            [
                "status" => "Declined",
                "status_category_id" => 2,
                "code" => "S-07",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "status" => "Approved with deduction",
                "status_category_id" => 2,
                "code" => "S-08",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "status" => "Approved without deduction",
                "status_category_id" => 2,
                "code" => "S-09",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ];
        RefStatus::insert($dataStatus2);
    }
}