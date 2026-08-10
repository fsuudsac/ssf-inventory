<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\PurchaseDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PurchaseDetailController extends Controller
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
    public function show(PurchaseDetail $purchaseDetail)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PurchaseDetail $purchaseDetail)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PurchaseDetail $purchaseDetail)
    {
        //
    }

    public function purchase_detail_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " purchase detail.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $purchaseDetail = PurchaseDetail::withTrashed()->updateOrCreate([
                    "id" => $request->id ?? null,
                ], [
                    "deleted_by" => $request->isTrash ? null : Auth::id(),
                    "deleted_at" => $request->isTrash ? null : now(),
                ]);

                if ($purchaseDetail) {
                    $historical_data = [
                        [
                            "historicalable_type" => PurchaseDetail::class,
                            "historicalable_id" => $purchaseDetail->id,
                            "subject" => "Purchase Detail",
                            "module" => "Purchase Detail",
                            "description" => "Purchase Detail has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
                            "field_name" => "Status",
                            "old_value" => $request->isTrash ? "Active" : "Archived",
                            "new_value" => !$request->isTrash ? "Active" : "Archived",
                            "action" => "Update",
                            "status" => "Success",
                        ]
                    ];

                    $this->historical_data($historical_data);

                    $ret = [
                        "success" => true,
                        "message" => "Purchase Detail " . ($request->isTrash ? "restored" : "archived") . " successfully."
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    public function purchase_detail_delete(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to delete purchase detail.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $purchaseDetail = PurchaseDetail::find($request->id);

                if ($purchaseDetail) {
                    $historical_data = [
                        [
                            "historicalable_type" => PurchaseDetail::class,
                            "historicalable_id"   => $purchaseDetail->id,
                            "subject"             => "Purchase Detail",
                            "module"              => "Purchase Detail",
                            "description"         => "Purchase Detail has been deleted by " . $this->authFullname(),
                            "field_name"          => "Status",
                            "old_value"           => "Active",
                            "new_value"           => "Deleted",
                            "action"              => "Delete",
                            "status"              => "Success",
                        ]
                    ];

                    $this->historical_data($historical_data);

                    // Delete associated inventory entry before removing the detail
                    Inventory::where('purchase_detail_id', $purchaseDetail->id)->first()?->delete();

                    $purchaseDetail->delete();

                    $ret = [
                        "success" => true,
                        "message" => "Purchase detail deleted successfully.",
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
