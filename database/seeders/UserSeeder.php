<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'username' => 'superadmin',
                'email' => 'superadmin@test.com',
                'email_verified_at' => now(),
                'password' => Hash::make('Admin123!'),
                'role' => "Super Admin",
                'status' => 'Active',
                'remember_token' => Str::random(10),
                'created_by' => 1,
                'profile' => [
                    'firstname' => 'Super',
                    'lastname' => 'Admin',
                ]
            ],
        ];

        User::truncate();
        Profile::truncate();
        foreach ($data as $key => $value) {
            $user = User::create(Arr::except($value, ['profile']));
            if ($user) {
                $user->profile()->create($value["profile"]);
            }
        }
    }
}
