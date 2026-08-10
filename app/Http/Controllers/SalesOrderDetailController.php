<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\SalesOrderDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SalesOrderDetailController extends Controller
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
    public function show(SalesOrderDetail $salesOrderDetail)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SalesOrderDetail $salesOrderDetail)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SalesOrderDetail $salesOrderDetail)
    {
        //
    }

    public function sales_order_detail_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " sales order detail.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $salesOrderDetail = SalesOrderDetail::withTrashed()->updateOrCreate(
                    ["id" => $request->id ?? null],
                    [
                        "deleted_by" => $request->isTrash ? null : Auth::id(),
                        "deleted_at" => $request->isTrash ? null : now(),
                    ]
                );

                if ($salesOrderDetail) {
                    $historical_data = [
                        [
                            "historicalable_type" => SalesOrderDetail::class,
                            "historicalable_id"   => $salesOrderDetail->id,
                            "subject"             => "Sales Order Detail",
                            "module"              => "Sales Order Detail",
                            "description"         => "Sales Order Detail has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                        "message" => "Sales order detail " . ($request->isTrash ? "restored" : "archived") . " successfully.",
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    public function sales_order_detail_delete(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to delete sales order detail.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $salesOrderDetail = SalesOrderDetail::find($request->id);

                if ($salesOrderDetail) {
                    $historical_data = [
                        [
                            "historicalable_type" => SalesOrderDetail::class,
                            "historicalable_id"   => $salesOrderDetail->id,
                            "subject"             => "Sales Order Detail",
                            "module"              => "Sales Order Detail",
                            "description"         => "Sales Order Detail has been deleted by " . $this->authFullname(),
                            "field_name"          => "Status",
                            "old_value"           => "Active",
                            "new_value"           => "Deleted",
                            "action"              => "Delete",
                            "status"              => "Success",
                        ]
                    ];

                    $this->historical_data($historical_data);

                    // Delete associated inventory entry before removing the detail
                    Inventory::where('sales_order_detail_id', $salesOrderDetail->id)->first()?->delete();

                    $salesOrderDetail->delete();

                    $ret = [
                        "success" => true,
                        "message" => "Sales order detail deleted successfully.",
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
