<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\PurchaseDetail;
use App\Models\PurchaseReturn;
use App\Models\PurchaseReturnDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PurchaseReturnController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $invoice_no = "(SELECT invoice_no FROM purchases WHERE purchases.id = purchase_returns.purchase_id)";
        $supplier_name = "(SELECT (SELECT (SELECT CONCAT_WS(' ',firstname, lastname) FROM profiles WHERE profiles.user_id = users.id) FROM users WHERE users.id = purchases.supplier_id) FROM purchases WHERE purchases.id = purchase_returns.purchase_id)";
        $date_returned_format = "DATE_FORMAT(purchase_returns.date_return, '%m/%d/%Y')";

        $data = PurchaseReturn::select([
            'purchase_returns.*',
            DB::raw("$supplier_name supplier_name"),
            DB::raw("$invoice_no invoice_no"),
            DB::raw("$date_returned_format date_returned_format"),
        ])
            ->with([
                'purchase_return_details' => function ($query) {
                    $query->with(['product_detail', 'purchase_detail']);
                },
            ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "status",
                ],
                "rawFields" => [
                    $supplier_name,
                    $invoice_no,
                    $date_returned_format,
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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " purchase return.",
        ];

        $request->validate([
            "purchase_id" => "required",
            "date_return" => "required",
            "status"      => "required",
        ]);

        // Block new return if a non-deleted Pending return already exists for this purchase
        // Soft-deleted (archived) pending returns do not block
        $has_pending = PurchaseReturn::where('purchase_id', $request->purchase_id)
            ->where('status', 'Pending')
            ->whereNull('deleted_at')
            ->when($request->id, fn($q) => $q->where('id', '!=', $request->id))
            ->exists();

        if ($has_pending) {
            return response()->json([
                "success" => false,
                "message" => "Cannot submit a new return while a Pending return exists for this invoice. Please resolve the pending return first.",
            ], 200);
        }

        // Validate each product's return quantity against available quantity
        // Available = original qty - SUM(Completed + Pending returns), excluding current record on edit
        // Soft-deleted purchase_returns are excluded — their quantities bounce back
        foreach ($request->purchase_return_details as $detail) {
            $purchase_detail_id = $detail['purchase_detail_id'] ?? null;
            $return_quantity    = (int) ($detail['return_quantity'] ?? 0);

            if (!$purchase_detail_id || !$return_quantity) {
                continue;
            }

            $purchase_detail = PurchaseDetail::find($purchase_detail_id);

            if (!$purchase_detail) {
                continue;
            }

            $original_qty = (int) $purchase_detail->quantity;

            $already_returned = PurchaseReturnDetail::where('purchase_detail_id', $purchase_detail_id)
                ->whereHas('purchase_return', function ($q) use ($request) {
                    $q->whereIn('status', ['Completed', 'Pending'])
                        ->whereNull('deleted_at')
                        ->when($request->id, fn($q2) => $q2->where('id', '!=', $request->id));
                })
                ->sum('quantity');

            $available = $original_qty - (int) $already_returned;

            if ($return_quantity > $available) {
                return response()->json([
                    "success" => false,
                    "message" => "Return quantity ({$return_quantity}) exceeds the available quantity ({$available}) for one or more products.",
                ], 200);
            }
        }

        try {
            DB::transaction(function () use ($request, &$ret) {
                $dataValidate = [
                    "purchase_id" => $request->purchase_id,
                    "date_return" => $request->date_return,
                    "status"      => $request->status,
                    "remarks"     => $request->remarks,
                ];

                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                $originalValue = PurchaseReturn::find($request->id);
                $purchaseReturn = PurchaseReturn::updateOrCreate(
                    ["id" => $request->id ?? null],
                    $dataValidate
                );

                if ($purchaseReturn) {
                    $changes = $purchaseReturn->getChanges();
                    $original = $purchaseReturn->getOriginal();

                    $this->historical_data_bulk([
                        "model"         => PurchaseReturn::class,
                        "originalValue" => $originalValue,
                        "changes"       => $changes,
                        "original"      => $original,
                        "createUpdate"  => $purchaseReturn,
                        "subject"       => "Purchase Return",
                        "module"        => "Purchase Return",
                    ]);

                    // Save return details and update inventory
                    foreach ($request->purchase_return_details as $detail) {
                        $originalDetailValue = PurchaseReturnDetail::find($detail['id'] ?? null);
                        $purchaseReturnDetail = PurchaseReturnDetail::updateOrCreate(
                            ["id" => !empty($detail['id']) ? $detail['id'] : null],
                            [
                                "purchase_return_id" => $purchaseReturn->id,
                                "purchase_detail_id" => $detail['purchase_detail_id'],
                                "product_detail_id"  => $detail['product_detail_id'],
                                "quantity"           => $detail['return_quantity'],
                            ]
                        );

                        if ($purchaseReturnDetail) {
                            $detailChanges = $purchaseReturnDetail->getChanges();
                            $detailOriginal = $purchaseReturnDetail->getOriginal();

                            $this->historical_data_bulk([
                                "model"         => PurchaseReturnDetail::class,
                                "originalValue" => $originalDetailValue,
                                "changes"       => $detailChanges,
                                "original"      => $detailOriginal,
                                "createUpdate"  => $purchaseReturnDetail,
                                "subject"       => "Purchase Return Detail",
                                "module"        => "Purchase Return",
                            ]);

                            // Upsert inventory entry for this return detail
                            Inventory::updateOrCreate(
                                [
                                    "purchase_return_detail_id" => $purchaseReturnDetail->id,
                                    "type"                      => "Purchase Return",
                                ],
                                [
                                    "warehouse_id"              => $request->warehouse_id,
                                    "purchase_return_detail_id" => $purchaseReturnDetail->id,
                                    "product_detail_id"         => $detail['product_detail_id'],
                                    "quantity"                  => $detail['return_quantity'],
                                    "type"                      => "Purchase Return",
                                    "created_by"                => Auth::id(),
                                ]
                            );
                        }
                    }

                    $ret = [
                        "success" => true,
                        "message" => "Purchase return " . ($request->id ? "updated" : "created") . " successfully.",
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
        $data = PurchaseReturn::withTrashed()
            ->with([
                'purchase' => function ($query) {
                    $query->with(['supplier.profile']);
                    $query->withTrashed();
                },
                'purchase_return_details' => function ($query) {
                    $query->with([
                        'product_detail' => function ($query) {
                            $query->with([
                                'product' => function ($query) {
                                    $query->withTrashed();
                                },
                                'product_size' => function ($query) {
                                    $query->withTrashed();
                                },
                                'product_type' => function ($query) {
                                    $query->withTrashed();
                                }
                            ]);
                            $query->withTrashed();
                        },
                        'purchase_detail'
                    ]);
                },
            ])->find($id);

        // Added: build return history per product line, excluding THIS return's own entries
        // so the edit form shows the same history view as create mode
        foreach ($data->purchase_return_details as $detail) {
            $original_qty = (int) $detail->purchase_detail->quantity;
            $running_qty  = $original_qty;
            $history      = [];

            $other_return_details = PurchaseReturnDetail::where('purchase_detail_id', $detail->purchase_detail_id)
                ->where('purchase_return_id', '!=', $id)
                ->with(['purchase_return' => function ($q) {
                    $q->withTrashed();
                }])
                ->orderBy('id', 'asc')
                ->get();

            foreach ($other_return_details as $prd) {
                $purchase_return = $prd->purchase_return;
                $is_deleted      = $purchase_return && $purchase_return->deleted_at !== null;
                $status          = $is_deleted ? 'Archived' : ($purchase_return->status ?? null);
                $ret_qty         = (int) $prd->quantity;

                // Skip archived entries from the visible list (same rule as purchase_info)
                if (!$is_deleted) {
                    $history[] = [
                        'id'                      => $prd->id,
                        'purchase_return_id'      => $prd->purchase_return_id,
                        'return_quantity'         => $ret_qty,
                        'date_return'             => $purchase_return->date_return ?? null,
                        'status'                  => $status,
                        'purchase_order_quantity' => $running_qty,
                    ];
                }

                // Archived quantities bounce back; only Completed/Pending reduce the pool
                if (in_array($status, ['Completed', 'Pending'])) {
                    $running_qty -= $ret_qty;
                }
            }

            $detail->return_history     = $history;
            // available_quantity here means: what's left EXCLUDING this return,
            // so the edit form can validate changes to the current return_quantity
            $detail->available_quantity = $running_qty;
        }

        return response()->json([
            'success' => true,
            'data'    => $data,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PurchaseReturn $purchaseReturn)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PurchaseReturn $purchaseReturn)
    {
        //
    }

    public function purchase_return_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " purchase return.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $purchaseReturn = PurchaseReturn::withTrashed()->updateOrCreate([
                    "id" => $request->id ?? null,
                ], [
                    "deleted_by" => $request->isTrash ? null : Auth::id(),
                    "deleted_at" => $request->isTrash ? null : now(),
                ]);

                if ($purchaseReturn) {
                    $historical_data = [
                        [
                            "historicalable_type" => PurchaseReturn::class,
                            "historicalable_id" => $purchaseReturn->id,
                            "subject" => "Purchase Return",
                            "module" => "Purchase Return",
                            "description" => "Purchase Return has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                        "message" => "Purchase Return " . ($request->isTrash ? "restored" : "archived") . " successfully."
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
