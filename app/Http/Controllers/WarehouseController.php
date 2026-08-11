<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class WarehouseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $date_formatted = "DATE_FORMAT(warehouses.created_at, '%m/%d/%Y')";

        $data = Warehouse::select([
            "*",
            DB::raw("$date_formatted date_formatted")
        ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "warehouse_name",
                    "description",
                    "address",
                ],
                "rawFields" => []
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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " warehouse.",
        ];

        $dataValidate = $request->validate([
            "warehouse_name" => [
                "required",
                Rule::unique("warehouses")->ignore($request->id),
            ],
        ]);

        $dataValidate += [
            "description" => $request->description,
            "address"     => $request->address,
            "status"      => $request->status,
        ];

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                // Unset all other warehouses as main if this one is being set as main
                if ($request->status == 1) {
                    Warehouse::where("status", 1)->update(["status" => 0]);
                }

                // withTrashed() so editing an archived record updates instead of duplicate-inserting
                $originalValue = Warehouse::withTrashed()->find($request->id);
                $warehouse = Warehouse::withTrashed()->updateOrCreate(
                    ["id" => $request->id ?? null],
                    $dataValidate
                );

                if ($warehouse) {
                    $changes = $warehouse->getChanges();
                    $original = $warehouse->getOriginal();

                    $this->historical_data_bulk([
                        "model"         => Warehouse::class,
                        "originalValue" => $originalValue,
                        "changes"       => $changes,
                        "original"      => $original,
                        "createUpdate"  => $warehouse,
                        "subject"       => "Warehouse",
                        "module"        => "Warehouse",
                    ]);

                    $ret = [
                        "success" => true,
                        "message" => "Warehouse " . ($request->id ? "updated" : "created") . " successfully.",
                        "data"    => $warehouse,
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
    public function show(Warehouse $warehouse)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Warehouse $warehouse)
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
            "message" => "Failed to delete warehouse.",
        ];

        try {
            DB::transaction(function () use ($id, &$ret) {
                $warehouse = Warehouse::find($id);

                if ($warehouse) {
                    $historical_data = [
                        [
                            "historicalable_type" => Warehouse::class,
                            "historicalable_id"   => $warehouse->id,
                            "subject"             => "Warehouse",
                            "module"              => "Warehouse",
                            "description"         => "Warehouse has been deleted by " . $this->authFullname(),
                            "field_name"          => "Status",
                            "old_value"           => "Active",
                            "new_value"           => "Deleted",
                            "action"              => "Delete",
                            "status"              => "Success",
                        ]
                    ];

                    $this->historical_data($historical_data);

                    $warehouse->delete();

                    $ret = [
                        "success" => true,
                        "message" => "Warehouse deleted successfully.",
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    public function multiple_archived_warehouse(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " warehouses.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $warehouses = Warehouse::withTrashed()->whereIn("id", $request->ids)->get();

                foreach ($warehouses as $warehouse) {
                    $warehouse->fill([
                        "deleted_by" => $request->isTrash ? null : Auth::id(),
                        "deleted_at" => $request->isTrash ? null : now(),
                        "updated_by" => $request->isTrash ? Auth::id() : null,
                    ])->save();

                    $historical_data = [
                        [
                            "historicalable_type" => Warehouse::class,
                            "historicalable_id"   => $warehouse->id,
                            "subject"             => "Warehouse",
                            "module"              => "Warehouse",
                            "description"         => "Warehouse has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                    "message" => "Warehouses " . ($request->isTrash ? "restored" : "archived") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    public function warehouse_change_status(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to update warehouse status.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $warehouse = Warehouse::find($request->id);

                if ($warehouse) {
                    // Unset all warehouses as main before setting the new one
                    Warehouse::query()->update(["status" => 0]);

                    $warehouse->update([
                        "status"     => $request->status,
                        "updated_by" => Auth::id(),
                    ]);

                    $historical_data = [
                        [
                            "historicalable_type" => Warehouse::class,
                            "historicalable_id"   => $warehouse->id,
                            "subject"             => "Warehouse",
                            "module"              => "Warehouse",
                            "description"         => "Warehouse status changed to {$request->status} by " . $this->authFullname(),
                            "field_name"          => "status",
                            "old_value"           => $warehouse->getOriginal("status"),
                            "new_value"           => $request->status,
                            "action"              => "Update",
                            "status"              => "Success",
                        ]
                    ];

                    $this->historical_data($historical_data);

                    $ret = [
                        "success" => true,
                        "message" => "Warehouse status updated successfully.",
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
