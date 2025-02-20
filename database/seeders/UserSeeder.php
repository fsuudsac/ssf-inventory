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
     *
     * @return void
     */
    public function run()
    {
        User::truncate();
        Profile::truncate();

        $data = [
            [
                'username' => 'superadmin',
                'email' => 'superadmin@test.com',
                'email_verified_at' => now(),
                'password' => Hash::make('Admin123!'),
                'user_role_id' => 1,
                'status' => 'Active',
                'remember_token' => Str::random(10),
                'created_by' => 1,
                'created_at' => now(),
                'profile' => [
                    'firstname' => 'Super',
                    'lastname' => 'Admin',
                    'created_by' => 1,
                    'created_at' => now(),
                ]
            ],
        ];

        foreach ($data as $key => $value) {
            $user = User::create(Arr::except($value, ['profile']));
            if ($user) {
                $user->profile()->create($value["profile"]);
            }
        }
    }
}
