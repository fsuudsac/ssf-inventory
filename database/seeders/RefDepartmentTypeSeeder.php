<?php

namespace Database\Seeders;

use App\Models\RefDepartmentType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RefDepartmentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        RefDepartmentType::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $departmentTypes = [
            "Administration",
            "Auxiliary Services",
            "Academic Support",
            "College",
            "Graduate Studies",
            "Law",
            "Basic Education",
        ];

        foreach ($departmentTypes as $departmentType) {
            RefDepartmentType::create([
                "department_type" => $departmentType,
                "created_by" => 1,
            ]);
        }
    }
}
