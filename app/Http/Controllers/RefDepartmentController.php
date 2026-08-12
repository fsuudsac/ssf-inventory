<?php

namespace App\Http\Controllers;

use App\Models\RefDepartment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RefDepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $departmentType = "(SELECT department_type FROM ref_department_types WHERE ref_department_types.id = ref_departments.department_type_id LIMIT 1)";
        $total_profiles_count = "(SELECT COUNT(DISTINCT profile_departments.profile_id)
            FROM profile_departments
            JOIN profiles ON profiles.id = profile_departments.profile_id
            JOIN users ON users.id = profiles.user_id
            JOIN user_roles ON user_roles.id = users.user_role_id
            WHERE profile_departments.department_id = ref_departments.id
              AND profile_departments.status = 1
              AND user_roles.role IN ('Admin','Staff','Faculty/Dean','Faculty/Chairman','Faculty','Faculty/Staff','Student Assistant'))";

        $data = RefDepartment::select([
            "*",
            DB::raw("$departmentType department_type"),
            DB::raw("$total_profiles_count total_profiles_count"),
        ])
            ->with([
                'profile_departments:id,profile_id,department_id',
                'profile_departments.profile:id,user_id',
                'profile_departments.profile.user:id,email',
            ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "abbr",
                    "department_name",
                ],
                "rawFields" => [
                    $departmentType,
                ]
            ])
            ->trashState($request->isTrash)
            ->filter($request)
            ->sortable($request)
            ->pagination($request);

        return response()->json([
            "success" => true,
            "data" => $data
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->id ? "update" : "create") . " department.",
        ];

        $dataValidate = $request->validate([
            "department_name" => [
                "required",
                Rule::unique("ref_departments", "department_name")->ignore($request->id),
            ],
            "abbr" => [
                "required",
                Rule::unique("ref_departments", "abbr")->ignore($request->id),
            ],
            "department_type_id" => "nullable|exists:ref_department_types,id",
        ]);

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                $originalValue = RefDepartment::find($request->id);
                $department = RefDepartment::updateOrCreate(
                    ["id" => $request->id ?? null],
                    $dataValidate
                );

                if ($department) {
                    $changes = $department->getChanges();
                    $original = $department->getOriginal();

                    $this->historical_data_bulk([
                        "model"         => RefDepartment::class,
                        "originalValue" => $originalValue,
                        "changes"       => $changes,
                        "original"      => $original,
                        "createUpdate"  => $department,
                        "subject"       => "Department",
                        "module"        => "Department",
                    ]);

                    $ret = [
                        "success" => true,
                        "message" => "Department " . ($request->id ? "updated" : "created") . " successfully.",
                        "data"    => $department,
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
    public function show($id)
    {
        $departmentType = "(SELECT department_type FROM ref_department_types WHERE ref_department_types.id = ref_departments.department_type_id LIMIT 1)";

        $data = RefDepartment::select([
            "*",
            DB::raw("$departmentType AS department_type")
        ])
            ->withTrashed()
            ->findOrFail($id);

        return response()->json([
            "success" => true,
            "data"    => $data,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RefDepartment $refDepartment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to delete department.",
        ];

        try {
            DB::transaction(function () use ($id, &$ret) {
                $department = RefDepartment::find($id);

                if ($department) {
                    $historical_data = [
                        [
                            "historicalable_type" => RefDepartment::class,
                            "historicalable_id"   => $department->id,
                            "subject"             => "Department",
                            "module"              => "Department",
                            "description"         => "Department has been deleted by " . $this->authFullname(),
                            "field_name"          => "Status",
                            "old_value"           => "Active",
                            "new_value"           => "Deleted",
                            "action"              => "Delete",
                            "status"              => "Success",
                        ]
                    ];

                    $this->historical_data($historical_data);

                    $department->delete();

                    $ret = [
                        "success" => true,
                        "message" => "Department deleted successfully.",
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    // Bulk archive / restore departments
    public function department_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " departments.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                // Loop over ids to support bulk archive/restore
                $departments = RefDepartment::withTrashed()->whereIn("id", $request->ids)->get();

                foreach ($departments as $department) {
                    $department->fill([
                        "deleted_by" => $request->isTrash ? null : Auth::id(),
                        "deleted_at" => $request->isTrash ? null : now(),
                    ])->save();

                    $historical_data = [
                        [
                            "historicalable_type" => RefDepartment::class,
                            "historicalable_id"   => $department->id,
                            "subject"             => "Department",
                            "module"              => "Department",
                            "description"         => "Department has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
                            "field_name"          => "Status",
                            "old_value"           => $request->isTrash ? "Archived" : "Active",
                            "new_value"           => $request->isTrash ? "Active" : "Archived",
                            "action"              => "Update",
                            "status"              => "Success",
                        ]
                    ];

                    $this->historical_data($historical_data);
                }

                $ret = [
                    "success" => true,
                    "message" => "Departments " . ($request->isTrash ? "restored" : "archived") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    // Get department dropdown list with optional filters
    public function department_dropdown(Request $request)
    {
        $data = RefDepartment::select([
            "id",
            "department_name",
        ]);

        if ($request->profileIds) {
            $profileIds = explode(",", $request->profileIds);
            $data = $data->whereHas("profile_departments", function ($query) use ($profileIds) {
                $query->whereIn("profile_id", $profileIds);
            });
        }

        if ($request->filled("department_type_id_filter")) {
            $data->whereIn("department_type_id", explode(",", $request->department_type_id_filter));
        }

        if ($request->from == "grade_file") {
            if (Auth::user()->profile && in_array(Auth::user()->user_role->role, ["Faculty/Dean", "Faculty/Chairman"])) {
                $data = $data->whereHas("profile_departments", function ($query) {
                    $query->where("profile_id", Auth::user()->profile->id);
                });
            }
        }

        $data = $data->sortable($request)->get();

        return response()->json([
            "success" => true,
            "data"    => $data,
            "auth"    => Auth::user()->profile->profile_departments,
        ], 200);
    }

    // Get departments with their department type for dropdowns
    public function get_department_dropdown(Request $request)
    {
        $departments = RefDepartment::with(["ref_department_type:id,department_type"])
            ->select("id", "department_name", "department_type_id")
            ->get();

        return response()->json([
            "success" => true,
            "data"    => $departments,
        ], 200);
    }
}
