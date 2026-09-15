<?php

namespace App\Http\Controllers;

use App\Models\RefAllocationType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RefAllocationTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $date_formatted = "DATE_FORMAT(ref_allocation_types.created_at, '%Y-%m-%d %H:%i %p')";

        $data = RefAllocationType::select([
            "*",
            DB::raw("$date_formatted date_formatted"),
        ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "allocation_type",
                ],
                "rawFields" => [
                    $date_formatted,
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
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->id ? "update" : "create") . " allocation type.",
        ];

        $dataValidate = $request->validate([
            "allocation_type" => [
                "required",
                Rule::unique("ref_allocation_types", "allocation_type")->ignore($request->id),
            ],
        ]);

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                $originalValue = RefAllocationType::withTrashed()->find($request->id);
                $allocationType = RefAllocationType::withTrashed()->updateOrCreate([
                    "id" => $request->id ?? null,
                ], $dataValidate);

                if ($allocationType) {
                    $changes = $allocationType->getChanges();
                    $original = $allocationType->getOriginal();

                    $this->historical_data_bulk([
                        "model" => RefAllocationType::class,
                        "originalValue" => $originalValue,
                        "changes" => $changes,
                        "original" => $original,
                        "createUpdate" => $allocationType,
                        "subject" => "Allocation Type",
                        "module" => "Allocation Type",
                    ]);

                    $ret = [
                        "success" => true,
                        "message" => "Allocation Type " . ($request->id ? "updated" : "created") . " successfully.",
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(RefAllocationType $refAllocationType)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RefAllocationType $refAllocationType)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RefAllocationType $refAllocationType)
    {
        //
    }

    public function allocation_type_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " allocation types.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $allocationTypes = RefAllocationType::withTrashed()->whereIn("id", $request->ids)->get();

                foreach ($allocationTypes as $allocationType) {
                    $allocationType->fill([
                        "deleted_by" => $request->isTrash ? null : Auth::id(),
                        "deleted_at" => $request->isTrash ? null : now(),
                    ])->save();

                    $historical_data = [
                        [
                            "historicalable_type" => RefAllocationType::class,
                            "historicalable_id" => $allocationType->id,
                            "subject" => "Allocation Type",
                            "module" => "Allocation Type",
                            "description" => "Allocation Type has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
                            "field_name" => "Status",
                            "old_value" => $request->isTrash ? "Archived" : "Active",
                            "new_value" => $request->isTrash ? "Active" : "Archived",
                            "action" => "Update",
                            "status" => "Success",
                        ]
                    ];

                    $this->historical_data($historical_data);
                }

                $ret = [
                    "success" => true,
                    "message" => "Allocation Types " . ($request->isTrash ? "restored" : "archived") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
