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
                'role' => 'Admin',
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
            [
                'type' => 'Student',
                'role' => 'Student Temporary',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Teaching',
                'role' => 'Faculty/Staff',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Non-Teaching',
                'role' => 'Cashier',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Non-Teaching',
                'role' => 'Academic Staff',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Non-Teaching',
                'role' => 'Accounting',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'External Customer',
                'role' => 'Customer',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Supplier',
                'role' => 'Supplier',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ];
        UserRole::truncate();
        UserRole::insert($data);
    }
}
