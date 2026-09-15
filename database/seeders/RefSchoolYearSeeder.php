<?php

namespace Database\Seeders;

use App\Models\RefSchoolYear;
use Illuminate\Database\Seeder;

class RefSchoolYearSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $startYear = 1901;
        $endYear = 2027;

        RefSchoolYear::truncate();

        $data = [];

        for ($year = $startYear; $year < $endYear; $year++) {
            $data[] = [
                'sy_from' => $year,
                'sy_to' => $year + 1,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        RefSchoolYear::insert($data);

        RefSchoolYear::orderByDesc('sy_from')->first()->update(['status' => 1]);
    }
}
