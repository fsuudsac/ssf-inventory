<?php

namespace Database\Seeders;

use App\Models\RefAllocationType;
use Illuminate\Database\Seeder;

class RefAllocationTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        RefAllocationType::truncate();

        // Allocation types: determines if a department budget is for a project, event, or general operations
        $allocationTypes = [
            "Project",
            "Event",
            "Operational",
        ];

        foreach ($allocationTypes as $type) {
            RefAllocationType::create([
                "allocation_type"       => $type,
                "created_by" => 1,
            ]);
        }
    }
}
