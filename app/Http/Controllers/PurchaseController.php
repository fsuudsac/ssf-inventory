<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $warehouse_name = "(SELECT warehouse_name FROM warehouses WHERE warehouses.id = purchases.warehouse_id)";
        $supplier_name = "(SELECT (SELECT CONCAT(CASE WHEN lastname IS NOT NULL AND lastname != '' THEN CONCAT(lastname, ', ') ELSE '' END, firstname, CASE WHEN middlename IS NOT NULL THEN CONCAT(LEFT(middlename, 1), '.') ELSE '' END) FROM `profiles` WHERE `profiles`.user_id=users.id) FROM users WHERE users.id=purchases.supplier_id)";
        $date_purchased_format = "DATE_FORMAT(purchases.date_purchased, '%m/%d/%Y')";
        $date_due_format = "DATE_FORMAT(purchases.date_due, '%m/%d/%Y')";
        $date_returned_format = "DATE_FORMAT(purchases.date_returned, '%m/%d/%Y')";
        $ewt_type = "(SELECT ewt_type FROM ewt_types WHERE ewt_types.id = purchases.ewt_type_id)";
        $created_at_format = "DATE_FORMAT(purchases.created_at, '%m/%d/%Y')";

        $data = Purchase::select([
            "purchases.*",
            DB::raw("$warehouse_name warehouse_name"),
            DB::raw("$supplier_name supplier_name"),
            DB::raw("$date_purchased_format date_purchased_format"),
            DB::raw("$date_due_format date_due_format"),
            DB::raw("$date_returned_format date_returned_format"),
            DB::raw("$ewt_type ewt_type"),
            DB::raw("$created_at_format created_at_format")
        ])
            ->with(['purchase_payments'])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "type",
                    "invoice_no",
                    "vat_type",
                ],
                "rawFields" => [
                    $warehouse_name,
                    $supplier_name,
                    $date_due_format,
                    $date_purchased_format,
                    $date_returned_format,
                    $ewt_type,
                    $created_at_format,
                ]
            ])
            ->trashState($request->isTrash)
            ->filter($request)
            ->sortable($request);

        // Apply a hard limit for dashboard widgets before paginating
        if ($request->from == 'DashboardPaymentDueList' && $request->limit) {
            $data = $data->limit($request->limit);
        }

        if (!empty($request->page_size)) {
            $data = $data->paginate($request->page_size, ['*'], 'page', $request->page ?? 1)->toArray();
        } else {
            $data = $data->get();
        }

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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " purchase.",
        ];

        $dataValidate = $request->validate([
            "warehouse_id"   => "required",
            "supplier_id"    => "required",
            "date_purchased" => "required",
            "invoice_no"     => "required",
            "type"           => "required",
        ]);

        // Merge remaining purchase fields
        $dataValidate += [
            "terms"                  => $request->terms,
            "credit_term_id"         => $request->credit_term_id,
            "date_due"               => $request->date_due,
            "vat_type"               => $request->vat_type,
            "ewt_type_id"            => $request->ewt_type_id,
            "total_gross_amount"     => $request->total_gross_amount,
            "value_added_tax"        => $request->total_value_added_tax,
            "total_amount_payable"   => $request->total_amount_payable,
            "withholding_tax"        => $request->total_withholding_tax,
            "amount_due"             => $request->total_amount_due,
            "discount"               => $request->total_discount,
            "net_amount_due"         => $request->total_net_amount_due,
            "profile_address_id"     => $request->profile_address_id,
            "taxpayer_identification" => $request->taxpayer_identification,
            "paid_status"            => $request->terms == "Cash" ? "Paid" : "Not Paid",
        ];

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                $originalValue = Purchase::find($request->id);
                $purchase = Purchase::updateOrCreate(
                    ["id" => $request->id ?? null],
                    $dataValidate
                );

                if ($purchase) {
                    $changes = $purchase->getChanges();
                    $original = $purchase->getOriginal();

                    $this->historical_data_bulk([
                        "model"         => Purchase::class,
                        "originalValue" => $originalValue,
                        "changes"       => $changes,
                        "original"      => $original,
                        "createUpdate"  => $purchase,
                        "subject"       => "Purchase",
                        "module"        => "Purchase",
                    ]);

                    // Save purchase details and create inventory entries
                    foreach ($request->purchase_details as $value) {
                        $originalDetailValue = PurchaseDetail::find($value['id'] ?? null);
                        $purchaseDetail = PurchaseDetail::updateOrCreate(
                            ["id" => !empty($value['id']) ? $value['id'] : null],
                            [
                                "purchase_id"          => $purchase->id,
                                "product_detail_id"    => $value['product_detail_id'],
                                "quantity"             => $value['quantity'],
                                "cost"                 => $value['cost'] ?? 0,
                                "total_cost"           => $value['total_cost'] ?? 0,
                                "vat"                  => $value['vat'] ?? 0,
                                "gross_amount"         => $value['gross_amount'] ?? 0,
                                "orig_cost"            => $value['orig_cost'] ?? 0,
                                "orig_dealers_price"   => $value['orig_dealers_price'] ?? 0,
                                "orig_wholesale_price" => $value['orig_wholesale_price'] ?? 0,
                                "orig_srp"             => $value['orig_srp'] ?? 0,
                                "orig_fleet_price"     => $value['orig_fleet_price'] ?? 0,
                            ]
                        );

                        if ($purchaseDetail) {
                            $detailChanges = $purchaseDetail->getChanges();
                            $detailOriginal = $purchaseDetail->getOriginal();

                            $this->historical_data_bulk([
                                "model"         => PurchaseDetail::class,
                                "originalValue" => $originalDetailValue,
                                "changes"       => $detailChanges,
                                "original"      => $detailOriginal,
                                "createUpdate"  => $purchaseDetail,
                                "subject"       => "Purchase Detail",
                                "module"        => "Purchase",
                            ]);

                            $this->update_create_inventory([
                                "purchase_detail_id" => $purchaseDetail->id,
                                "warehouse_id"       => $request->warehouse_id,
                                "product_detail_id"  => $value['product_detail_id'],
                                "amount"             => $value['cost'] ?? 0,
                                "quantity"           => $value['quantity'],
                                "type"               => $request->type,
                                "date_inventory"     => $request->date_purchased,
                            ], "Purchase Order");
                        }
                    }

                    $ret = [
                        "success" => true,
                        "message" => "Purchase " . ($request->id ? "updated" : "created") . " successfully.",
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
        $data = Purchase::withTrashed()
            ->with([
                'purchase_details' => function ($query) {
                    $query->with(['product_detail' => function ($query) {
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
                    }]);
                },
                'supplier' => function ($query) {
                    $query->select(['id'])
                        ->with([
                            'profile' => function ($query) {
                                $query->select([
                                    'id',
                                    'user_id',
                                    'taxpayer_identification',
                                    DB::raw("TRIM(CONCAT_WS(' ', firstname, IF(middlename='', NULL, middlename), lastname, IF(name_ext='', NULL, name_ext))) supplier_name"),
                                ])
                                    ->with([
                                        'profile_addresses',
                                    ]);
                            },
                            'user_payments',
                        ]);
                },
            ])->find($id);

        return response()->json([
            'success'   => true,
            'data'      => $data
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Purchase $purchase)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Purchase $purchase)
    {
        //
    }

    public function purchase_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " purchase.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $purchase = Purchase::withTrashed()->updateOrCreate([
                    "id" => $request->id ?? null,
                ], [
                    "deleted_by" => $request->isTrash ? null : Auth::id(),
                    "deleted_at" => $request->isTrash ? null : now(),
                ]);

                if ($purchase) {
                    $historical_data = [
                        [
                            "historicalable_type" => Purchase::class,
                            "historicalable_id" => $purchase->id,
                            "subject" => "Purchase",
                            "module" => "Purchase",
                            "description" => "Purchase has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                        "message" => "Purchase " . ($request->isTrash ? "restored" : "archived") . " successfully."
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    protected function generate_invoice_no()
    {
        $invoice_no = "PO-" . date('Y') . "-" . date('m') . "-" . date('d') . "-" . rand(1000, 9999);

        $checkInvoice = Purchase::where("invoice_no", $invoice_no)->first();

        if ($checkInvoice) {
            $this->generate_invoice_no();
        }

        return $invoice_no;
    }

    public function report_ledger_supplier(Request $request)
    {
        $warehouse_name = "(SELECT warehouse_name FROM warehouses WHERE warehouses.id = purchases.warehouse_id)";
        $supplier_name = "(SELECT (SELECT CONCAT(CASE WHEN lastname IS NOT NULL AND lastname != '' THEN CONCAT(lastname, ', ') ELSE '' END, firstname, CASE WHEN middlename IS NOT NULL THEN CONCAT(LEFT(middlename, 1), '.') ELSE '' END) FROM `profiles` WHERE `profiles`.user_id=users.id) FROM users WHERE users.id=purchases.supplier_id)";
        $date_purchased_formatted = "DATE_FORMAT(purchases.date_purchased, '%m/%d/%Y')";
        $date_due_format = "DATE_FORMAT(purchases.date_due, '%m/%d/%Y')";
        $date_returned_format = "DATE_FORMAT(purchases.date_returned, '%m/%d/%Y')";
        $ewt_type = "(SELECT ewt_type FROM ewt_types WHERE ewt_types.id = purchases.ewt_type_id)";
        $created_at_formatted = "DATE_FORMAT(purchases.created_at, '%m/%d/%Y')";

        $data = Purchase::select([
            "purchases.*",
            DB::raw("$warehouse_name warehouse_name"),
            DB::raw("$supplier_name supplier_name"),
            DB::raw("$date_purchased_formatted date_purchased_formatted"),
            DB::raw("$date_due_format date_due_format"),
            DB::raw("$date_returned_format date_returned_format"),
            DB::raw("$ewt_type ewt_type"),
            DB::raw("$created_at_formatted created_at_formatted")
        ])->with(['purchase_payments']);

        if ($request->supplier_id) {
            $supplierIds = explode(',', $request->supplier_id);
            $data = $data->whereIn("supplier_id", $supplierIds);
        }

        if ($request->date_purchased_string) {
            $date_purchased_string = explode(",", $request->date_purchased_string);

            if (count($date_purchased_string) == 2 && $date_purchased_string[0] && $date_purchased_string[1]) {
                $data = $data->whereBetween("date_purchased", [$date_purchased_string[0], $date_purchased_string[1]]);
            }
        }

        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null'  &&
                $request->sort_order != ''  && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                $data = $data->orderBy(isset($request->sort_field) ? $request->sort_field : 'id', isset($request->sort_order)  ? $request->sort_order : 'desc');
            }
        } else {
            $data = $data->orderBy('id', 'desc');
        }

        if ($request->page_size) {
            $data = $data->limit($request->page_size)
                ->paginate($request->page_size, ['*'], 'page', $request->page)
                ->toArray();
        } else {
            $data = $data->get();
        }

        return response()->json([
            'success'   => true,
            'data'      => $data,
        ], 200);
    }

    public function purchase_preview($id)
    {
        $data = Purchase::with([
            'supplier.profile',
            'profile_address',
            'ewt_type',
            'purchase_details' => function ($query) {
                $query->with(['product_detail' => function ($query) {
                    $query->with(['product', 'product_size', 'product_type']);
                }]);
            },

        ])->find($id);

        return $this->pdf_template([
            'title' => 'PURCHASE-' . $data->invoice_no . '-' . date('Ymd-his'),
            'data' => $data,
            'template' => 'pdf.purchase_preview'
        ]);
    }

    public function purchase_info(Request $request)
    {
        // Updated: eager-load return details with their parent purchase_return for history/qty computation
        $data = Purchase::with([
            'supplier.profile',
            'profile_address',
            'ewt_type',
            'purchase_details' => function ($query) {
                $query->with([
                    'product_detail' => function ($q) {
                        $q->with(['product', 'product_size', 'product_type']);
                    },
                    // Load all return details for this line item, ordered oldest-first for history display
                    // Updated: withTrashed() so soft-deleted (archived) purchase_returns are still accessible
                    'purchase_return_details' => function ($q) {
                        $q->with(['purchase_return' => function ($q2) {
                            $q2->withTrashed();
                        }])->orderBy('id', 'asc');
                    },
                ]);
            },
        ])->find($request->id);

        // Compute per-product return history, available_quantity, and invoice-level pending flag
        $has_pending_return = false;

        foreach ($data->purchase_details as $detail) {
            $running_qty = (int) $detail->quantity; // starts at original purchased qty
            $history = [];

            foreach ($detail->purchase_return_details as $prd) {
                $purchase_return = $prd->purchase_return;

                // Updated: treat soft-deleted (archived) purchase_returns as "Archived" —
                // their quantities bounce back to the available pool, same as Rejected/Cancelled
                $is_deleted = $purchase_return && $purchase_return->deleted_at !== null;
                $status     = $is_deleted ? 'Archived' : ($purchase_return->status ?? null);
                $ret_qty    = (int) $prd->quantity;

                // Snapshot the qty BEFORE this return (what the user saw as "Purchase Order Qty")
                // Updated: skip archived (soft-deleted) entries from history — they still affect
                // running_qty calculation above but are not shown in the table
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

                // Only Completed and Pending reduce the available pool;
                // Rejected, Cancelled, and Archived (soft-deleted) bounce back
                if (in_array($status, ['Completed', 'Pending'])) {
                    $running_qty -= $ret_qty;
                }

                // Only non-deleted Pending entries block new submissions
                if ($status === 'Pending' && !$is_deleted) {
                    $has_pending_return = true;
                }
            }

            // Append computed fields directly onto the model for the JSON response
            $detail->return_history       = $history;
            $detail->available_quantity   = $running_qty;
        }

        $data->has_pending_return = $has_pending_return;

        return response()->json([
            'success' => true,
            'data'    => $data,
        ], 200);
    }
}
