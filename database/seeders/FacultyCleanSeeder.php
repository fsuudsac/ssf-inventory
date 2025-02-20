<?php

namespace Database\Seeders;

use App\Models\RefBuilding;
use App\Models\RefDaySchedule;
use App\Models\RefFloor;
use App\Models\RefSemester;
use App\Models\RefStatus;
use App\Models\RefStatusCategory;
use Illuminate\Database\Seeder;

class FacultyCleanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        RefBuilding::truncate();
        RefFloor::truncate();
        RefSemester::truncate();
        RefDaySchedule::truncate();
        RefStatusCategory::truncate();
        RefStatus::truncate();

        $dataRefBuilding = [
            [
                "building" => "CB",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "building" => "CBS",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "building" => "CBE",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "building" => "GYM",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ];
        RefBuilding::insert($dataRefBuilding);
        $dataRefFloor = [
            [
                "floor" => "1st Floor",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "floor" => "2nd Floor",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "floor" => "3rd Floor",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "floor" => "4th Floor",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ];
        RefFloor::insert($dataRefFloor);
        $dataRefSemester = [
            [
                "semester" => "First Semester",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "semester" => "Second Semester",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "semester" => "Summer",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ];
        RefSemester::insert($dataRefSemester);
        $dataRefDaySchedule = [
            [
                "code" => "M",
                "name" => "Monday",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "code" => "T",
                "name" => "Tuesday",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "code" => "W",
                "name" => "Wednesday",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "code" => "TH",
                "name" => "Thursday",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "code" => "F",
                "name" => "Friday",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "code" => "S",
                "name" => "Saturday",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "code" => "SUN",
                "name" => "Sunday",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ];
        RefDaySchedule::insert($dataRefDaySchedule);

        $dataRefStatusCategory = RefStatusCategory::create([
            "status_category" => "Faculty Monitoring",
            "created_by" => 1,
        ]);

        $dataRefStatus = [
            [
                "status_category_id" => $dataRefStatusCategory->id,
                "status" => "Present",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "status_category_id" => $dataRefStatusCategory->id,
                "status" => "No Instructor, No Students",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "status_category_id" => $dataRefStatusCategory->id,
                "status" => "With Instructor, No Students",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "status_category_id" => $dataRefStatusCategory->id,
                "status" => "No Instructor, With Students",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "status_category_id" => $dataRefStatusCategory->id,
                "status" => "Early Dismissal",
                "created_by" => 1,
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ];

        RefStatus::insert($dataRefStatus);
    }
}
