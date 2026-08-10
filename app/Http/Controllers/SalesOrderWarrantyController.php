<?php

namespace App\Http\Controllers;

use App\Models\SalesOrderWarranty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SalesOrderWarrantyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function show(SalesOrderWarranty $salesOrderWarranty)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SalesOrderWarranty $salesOrderWarranty)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SalesOrderWarranty $salesOrderWarranty)
    {
        //
    }

    public function sales_order_warranty_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " sales order warranty.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $salesOrderWarranty = SalesOrderWarranty::withTrashed()->updateOrCreate(
                    ["id" => $request->id ?? null],
                    [
                        "deleted_by" => $request->isTrash ? null : Auth::id(),
                        "deleted_at" => $request->isTrash ? null : now(),
                    ]
                );

                if ($salesOrderWarranty) {
                    $historical_data = [
                        [
                            "historicalable_type" => SalesOrderWarranty::class,
                            "historicalable_id"   => $salesOrderWarranty->id,
                            "subject"             => "Sales Order Warranty",
                            "module"              => "Sales Order Warranty",
                            "description"         => "Sales Order Warranty has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
                            "field_name"          => "Status",
                            "old_value"           => $request->isTrash ? "Archived" : "Active",
                            "new_value"           => $request->isTrash ? "Active" : "Archived",
                            "action"              => "Update",
                            "status"              => "Success",
                        ]
                    ];

                    $this->historical_data($historical_data);

                    $ret = [
                        "success" => true,
                        "message" => "Sales order warranty " . ($request->isTrash ? "restored" : "archived") . " successfully.",
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    public function sales_order_warranty_delete(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to delete sales order warranty.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $salesOrderWarranty = SalesOrderWarranty::find($request->id);

                if ($salesOrderWarranty) {
                    $historical_data = [
                        [
                            "historicalable_type" => SalesOrderWarranty::class,
                            "historicalable_id"   => $salesOrderWarranty->id,
                            "subject"             => "Sales Order Warranty",
                            "module"              => "Sales Order Warranty",
                            "description"         => "Sales Order Warranty has been deleted by " . $this->authFullname(),
                            "field_name"          => "Status",
                            "old_value"           => "Active",
                            "new_value"           => "Deleted",
                            "action"              => "Delete",
                            "status"              => "Success",
                        ]
                    ];

                    $this->historical_data($historical_data);

                    $salesOrderWarranty->delete();

                    $ret = [
                        "success" => true,
                        "message" => "Sales order warranty deleted successfully.",
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
