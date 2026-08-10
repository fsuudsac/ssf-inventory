<?php

namespace Database\Seeders;

use App\Models\CreditTerm;
use Illuminate\Database\Seeder;

class CreditTermSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CreditTerm::truncate();

        $data = [
            [
                'credit_term' => "15",
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'credit_term' => "30",
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'credit_term' => "45",
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'credit_term' => "60",
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'credit_term' => "90",
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'credit_term' => "120",
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // usort($data, function ($a, $b) {
        //     return $a['credit_term'] <=> $b['credit_term'];
        // });

        CreditTerm::insert($data);
    }
}
