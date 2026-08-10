<?php

namespace Database\Seeders;

use App\Models\RefDepartment;
use Illuminate\Database\Seeder;

class RefDepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $departments = [
            [
                "department_type_id" => 4,
                "abbr" => "AP",
                "department_name" => "Accountancy Program",
            ],
            [
                "department_type_id" => 1,
                "abbr" => "OAS",
                "department_name" => "Admissions and Scholarships Office"
            ],
            [
                "department_type_id" => 4,
                "abbr" => "ASP",
                "department_name" => "Arts and Sciences Program",
            ],
            [
                "department_type_id" => 2,
                "abbr" => "ARS",
                "department_name" => "Auxiliary Resource Services",
            ],
            [
                "department_type_id" =>  7,
                "abbr" => "",
                "department_name" => "Basic Education Department"
            ],
            [
                "department_type_id" =>  3,
                "abbr" => "",
                "department_name" => "Biodiversity Informatics and Research Center"
            ],
            [
                "department_type_id" => 4,
                "abbr" => "BAP",
                "department_name" => "Business Administration Program",
            ],
            [
                "department_type_id" => 4,
                "abbr" => "CSP",
                "department_name" => "Computer Studies Program",
            ],
            [
                "department_type_id" => 4,
                "abbr" => "CJEP",
                "department_name" => "Criminal Justice Education Program",
            ],
            [
                "department_type_id" => 4,
                "abbr" => "ETP",
                "department_name" => "Engineering and Technology Program",
            ],
            [
                "department_type_id" => 4,
                "abbr" => "NP",
                "department_name" => "Nursing Program",
            ],
            [
                "department_type_id" => 4,
                "abbr" => "TEP",
                "department_name" => "Teacher Education Program",
            ],
            [
                "department_type_id" => 6,
                "abbr" => "COL",
                "department_name" => "College of Law",
            ],
            [
                "department_type_id" => 5,
                "abbr" => "GSR",
                "department_name" => "Graduate Studies and Research",
            ],
        ];

        RefDepartment::truncate();

        foreach ($departments as $department) {
            RefDepartment::create([
                "department_type_id" => $department["department_type_id"],
                "abbr" => $department["abbr"],
                "department_name" => $department["department_name"],
                "created_by" => 1,
            ]);
        }
    }
}
