<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        $this->call([
            UserRoleSeeder::class,
            UserSeeder::class,
            FacultyCleanSeeder::class,
            ModuleAndRolePermissionSeeder::class,
            RefRateSeeder::class,
            RefStatusSeeder::class,
            RefCivilStatusSeeder::class,
            RefNationalitySeeder::class,
            RefLanguageSeeder::class,
            RefRegionSeeder::class,
            RefExamCategorySeeder::class,
            RefReligionSeeder::class,
            RefSchoolSeeder::class,
            // RefSchoolLevelSeeder::class,
            RefPositionSeeder::class,
            EmailTemplateSeeder::class,
            RefDepartmentSeeder::class,
            ScholarSeeder::class,
        ]);
    }
}
