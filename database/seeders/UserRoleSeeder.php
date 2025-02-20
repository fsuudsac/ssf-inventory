<?php

namespace Database\Seeders;

use App\Models\UserRole;
use Illuminate\Database\Seeder;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $data = [
            [
                'type' => 'Non-Teaching',
                'role' => 'Super Admin',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Non-Teaching',
                'role' => 'Staff',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Teaching',
                'role' => 'Faculty/Chairman',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Teaching',
                'role' => 'Faculty/Dean',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Teaching',
                'role' => 'Faculty',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Student',
                'role' => 'Student',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Student',
                'role' => 'Student Assistant',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        UserRole::truncate();
        UserRole::insert($data);
    }
}