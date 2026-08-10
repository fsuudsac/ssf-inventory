<?php

namespace Database\Seeders;

use App\Models\EwtType;
use Illuminate\Database\Seeder;

class EWTTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        EwtType::truncate();

        $data = [
            [
                'ewt_type' => 1,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ewt_type' => 2,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ewt_type' => 3,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ewt_type' => 4,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // usort($data, function ($a, $b) {
        //     return $b['ewt_type'] <=> $a['ewt_type'];
        // });

        EwtType::insert($data);
    }
}
