<?php

namespace App\Http\Controllers;

use App\Models\RefDepartmentAllocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

        $allocation_type = "(SELECT allocation_type FROM ref_allocation_types rat WHERE rat.id = ref_department_allocations.allocation_type_id)";

        $date_given_formatted = "(SELECT DATE_FORMAT(created_at, '%m/%d/%Y') FROM ref_department_allocations rd WHERE rd.id = ref_department_allocations.id)";
        $date_swept_formatted = "(SELECT DATE_FORMAT(date_sweeped, '%m/%d/%Y') FROM ref_department_allocations rd WHERE rd.id = ref_department_allocations.id)";

        $data = RefDepartmentAllocation::select([
            "*",
            DB::raw("$department department"),
            DB::raw("$department_abbr department_abbr"),
            DB::raw("$department_type department_type"),
            DB::raw("$school_year school_year"),
            DB::raw("$allocation_type allocation_type"),
            DB::raw("$date_given_formatted date_given_formatted"),
            DB::raw("$date_swept_formatted date_swept_formatted"),
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
                    $allocation_type,
                    $date_given_formatted,
                    $date_swept_formatted,
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
     * Store a newly created resource in storage (create only).
     * allocation_name removed — form now uses allocation_type + amount only.
     */
    public function store(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to create department allocation.",
        ];

        $request->validate([
            "department_id"      => "required",
            "school_year_id"     => "required",
            "allocation_type_id" => "required",
            "amount"             => "required|numeric|min:0",
        ]);

        try {
            DB::transaction(function () use ($request, &$ret) {
                // On create: nothing spent yet, remaining = full base amount
                $allocation = RefDepartmentAllocation::create([
                    "department_id"      => $request->department_id,
                    "school_year_id"     => $request->school_year_id,
                    "allocation_type_id" => $request->allocation_type_id,
                    "base_amount"        => $request->amount,
                    "remaining_amount"   => $request->amount,
                    "status"             => 1,
                    "created_by"         => Auth::id(),
                ]);

                if ($allocation) {
                    $this->historical_data_bulk([
                        "model"         => RefDepartmentAllocation::class,
                        "originalValue" => null,
                        "changes"       => $allocation->getChanges(),
                        "original"      => $allocation->getOriginal(),
                        "createUpdate"  => $allocation,
                        "subject"       => "Budget Allocation",
                        "module"        => "Budget Allocation / Department",
                    ]);

                    $ret = [
                        "success" => true,
                        "message" => "Department allocation created successfully.",
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    /**
     * Update an existing department allocation.
     * Separated from store() to keep create logic clean.
     * Recalculates remaining_amount based on already-spent budget.
     */
    public function department_allocation_update(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to update department allocation.",
        ];

        $request->validate([
            "id"                 => "required",
            "allocation_type_id" => "required",
            "amount"             => "required|numeric|min:0",
        ]);

        try {
            DB::transaction(function () use ($request, &$ret) {
                $originalValue = RefDepartmentAllocation::withTrashed()->find($request->id);

                if (!$originalValue) {
                    throw new \Exception("Allocation record not found.");
                }

                // Preserve spent amount: spent = base - remaining
                // New remaining = new base - spent
                $spent = $originalValue->base_amount - $originalValue->remaining_amount;

                if ($request->amount < $spent) {
                    throw new \Exception(
                        "New amount ({$request->amount}) cannot be less than the amount already spent ({$spent})."
                    );
                }

                $remainingAmount = $request->amount - $spent;

                $allocation = $originalValue;
                $allocation->fill([
                    "allocation_type_id" => $request->allocation_type_id,
                    "base_amount"        => $request->amount,
                    "remaining_amount"   => $remainingAmount,
                    "updated_by"         => Auth::id(),
                ])->save();

                $this->historical_data_bulk([
                    "model"         => RefDepartmentAllocation::class,
                    "originalValue" => $originalValue,
                    "changes"       => $allocation->getChanges(),
                    "original"      => $allocation->getOriginal(),
                    "createUpdate"  => $allocation,
                    "subject"       => "Budget Allocation",
                    "module"        => "Budget Allocation / Department",
                ]);

                $ret = [
                    "success" => true,
                    "message" => "Department allocation updated successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
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

    // Archive or restore a single department allocation
    public function department_allocation_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " department allocation.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $allocation = RefDepartmentAllocation::withTrashed()->find($request->id);

                if ($allocation) {
                    $allocation->fill([
                        "deleted_by" => $request->isTrash ? null : Auth::id(),
                        "deleted_at" => $request->isTrash ? null : now(),
                    ])->save();

                    $this->historical_data([[
                        "historicalable_type" => RefDepartmentAllocation::class,
                        "historicalable_id"   => $allocation->id,
                        "subject"             => "Department Allocation",
                        "module"              => "Budget Allocation / Department",
                        "description"         => "Department allocation has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
                        "field_name"          => "Status",
                        "old_value"           => $request->isTrash ? "Archived" : "Active",
                        "new_value"           => $request->isTrash ? "Active" : "Archived",
                        "action"              => "Update",
                        "status"              => "Success",
                    ]]);

                    $ret = [
                        "success" => true,
                        "message" => "Department allocation " . ($request->isTrash ? "restored" : "archived") . " successfully.",
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    public function budget_sweep(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to sweep allocated department budget."
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $allocation = RefDepartmentAllocation::withTrashed()->find($request->id);

                if ($allocation) {
                    // Capture remaining_amount before fill() overwrites it
                    $previousRemainingAmount = $allocation->remaining_amount;

                    $allocation->fill([
                        "remaining_amount"  => 0,
                        "date_sweeped"      => now(),
                        "sweeped_by"        => Auth::id(),
                    ])->save();

                    $this->historical_data([[
                        "historicalable_type"   => RefDepartmentAllocation::class,
                        "historicalable_id"     => $allocation->id,
                        "subject"               => "Budget Allocation",
                        "module"                => "Budget Allocation / Department",
                        "description"           => "Allocated department budget has been swept by " . $this->authFullname(),
                        "field_name"            => "Remaining Amount",
                        "old_value"             => $previousRemainingAmount,
                        "new_value"             => 0,
                        "action"                => "Update",
                        "status"                => "Success",
                    ]]);

                    $ret = [
                        "success" => true,
                        "message" => "Allocated department budget has been swept successfully."
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
