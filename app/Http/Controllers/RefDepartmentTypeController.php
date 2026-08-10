<?php

namespace App\Http\Controllers;

use App\Models\RefDepartmentType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RefDepartmentTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $data = RefDepartmentType::select([
            "*"
        ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "department_type",
                ],
                "rawFields" => []
            ])
            ->trashState($request->isTrash)
            ->filter($request)
            ->sortable($request)
            ->pagination($request);

        return response()->json([
            "success"   => true,
            "data"      => $data
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->id ? "update" : "create") . " department type."
        ];

        $dataValidate = $request->validate([
            "department_type" => [
                "required",
                Rule::unique("ref_department_types", "department_type")->ignore($request->id),
            ]
        ]);

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                $isUpdate = !empty($request->id);

                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                // Capture original values before the update for history comparison
                $originalValues = [];
                if ($isUpdate) {
                    $existing = RefDepartmentType::find($request->id);
                    $originalValues = $existing ? $existing->toArray() : [];
                }

                $departmentType = RefDepartmentType::updateOrCreate(
                    ["id" => !empty($request->id) ? $request->id : null],
                    $dataValidate
                );

                if ($departmentType) {
                    // Log historical data after save
                    if ($isUpdate) {
                        // Update: record each changed field with before/after values
                        $this->historical_data_bulk([
                            'model'         => RefDepartmentType::class,
                            'originalValue' => $originalValues,
                            'changes'       => $departmentType->getChanges(),
                            'original'      => $departmentType->getOriginal(),
                            'createUpdate'  => $departmentType,
                            'subject'       => 'Department Type',
                            'action'        => 'Update',
                            'module'        => 'Department Type',
                        ]);
                    } else {
                        // Create: record each field with null as the old value
                        $trackedFields = ['department_type'];
                        $historyData   = [];
                        foreach ($trackedFields as $field) {
                            $historyData[] = [
                                'historicalable_type' => RefDepartmentType::class,
                                'historicalable_id'   => $departmentType->id,
                                'subject'             => 'Department Type',
                                'description'         => 'Department type created',
                                'field_name'          => $field,
                                'old_value'           => null,
                                'new_value'           => $departmentType->$field,
                                'action'              => 'Create',
                                'module'              => 'Department Type',
                                'status'              => 'Success',
                            ];
                        }
                        $this->historical_data($historyData);
                    }

                    $ret = [
                        "success" => true,
                        "message" => "Data " . ($request->id ? "updated" : "saved") . " successfully",
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret['message'] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(RefDepartmentType $refDepartmentType)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RefDepartmentType $refDepartmentType)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RefDepartmentType $refDepartmentType)
    {
        //
    }

    public function department_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " department type."
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $departmentTypes = RefDepartmentType::withTrashed()->whereIn("id", $request->ids)->get();

                foreach ($departmentTypes as $departmentType) {
                    $departmentType->fill([
                        "deleted_by" => $request->isTrash ? null : Auth::id(),
                        "deleted_at" => $request->isTrash ? null : now(),
                    ])->save();

                    $historical_data = [
                        [
                            "historicalable_type" => RefDepartmentType::class,
                            "historicalable_id" => $departmentType->id,
                            "subject" => "Department Type",
                            "module" => "Department Type",
                            "description" => "Department type has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                    "message" => "Department types " . ($request->isTrash ? "restored" : "archived") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
