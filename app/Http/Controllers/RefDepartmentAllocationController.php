<?php

namespace App\Http\Controllers;

use App\Models\RefDepartmentAllocation;
use Illuminate\Http\Request;

class RefDepartmentAllocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $department = "(SELECT department_name FROM ref_departments rd WHERE rd.id = ref_department_allocations.department_id)";
        $department_abbr = "(SELECT abbr FROM ref_departments rd WHERE rd.id = ref_department_allocations.department_id)";
        $department_type = "(SELECT (SELECT department_type FROM ref_department_types rdt WHERE rdt.id = rd.department_type_id) FROM ref_departments rd WHERE rd.id = ref_department_allocations.department_id)";
        $school_year = "(SELECT (SELECT CONCAT(sy_from, ' - ', sy_to) FROM ref_school_years rs WHERE rs.id = ref_department_allocations.school_year_id) FROM ref_school_years rs WHERE rs.id = ref_department_allocations.school_year_id)";

        $data = RefDepartmentAllocation::select([
            "*",
        ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "base_amount",
                    "remaining_amount",
                ],
                "rawFields" => [
                    $department,
                    $department_abbr,
                    $department_type,
                    $school_year,
                ]
            ])
            ->trashState($request->isTrash)
            ->filter($request)
            ->sortable($request)
            ->pagination($request);

        return response()->json([
            "success" => true,
            "data" => $data,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(RefDepartmentAllocation $refDepartmentAllocation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RefDepartmentAllocation $refDepartmentAllocation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RefDepartmentAllocation $refDepartmentAllocation)
    {
        //
    }
}
