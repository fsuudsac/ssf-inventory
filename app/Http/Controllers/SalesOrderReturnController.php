<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\SalesOrderReturn;
use App\Models\SalesOrderReturnDetail;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SalesOrderReturnController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $customer_name = "(SELECT (SELECT (SELECT CONCAT(CASE WHEN lastname IS NOT NULL AND lastname != '' THEN CONCAT(lastname, ', ') ELSE '' END, firstname, CASE WHEN middlename IS NOT NULL THEN CONCAT(LEFT(middlename, 1), '.') ELSE '' END) FROM `profiles` WHERE `profiles`.user_id = users.id) FROM users WHERE users.id = sales_orders.customer_id) FROM sales_orders WHERE sales_orders.id = sales_order_id)";
        $invoice_no = "(SELECT invoice_no FROM sales_orders WHERE sales_orders.id = sales_order_id)";
        $date_return_formatted = "DATE_FORMAT(date_return, '%m/%d/%Y')";

        $data = SalesOrderReturn::select([
            'sales_order_returns.*',
            DB::raw($customer_name . ' as customer_name'),
            DB::raw($invoice_no . ' as invoice_no'),
            DB::raw($date_return_formatted . ' as date_return_formatted'),
        ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "status",
                    "remarks",
                ],
                "rawFields" => [
                    $invoice_no,
                    $date_return_formatted,
                    $customer_name,
                ]
            ])
            ->trashState($request->isTrash)
            ->filter($request)
            ->sortable($request);

        if ($request->from == 'DashboardPaymentDueList' && $request->limit) {
            $data = $data->limit($request->limit);
        }

        if (!empty($request->page_size)) {
            $data = $data->limit($request->page_size)->paginate($request->page_size, ['*'], 'page', $request->page ?? 1)->toArray();
        } else {
            if ($request->from == "FormSalesReturn" && !$request->customer_id) {
                $data = [];
            } else {
                $data = $data->get();
            }
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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " sales order return.",
        ];

        $dataValidate = $request->validate([
            "sales_order_id" => "required",
            "date_return"    => "required",
            "status"         => "required",
        ]);

        $dataValidate["remarks"] = $request->remarks;

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                $originalValue = SalesOrderReturn::find($request->id);
                $salesOrderReturn = SalesOrderReturn::updateOrCreate(
                    ["id" => $request->id ?? null],
                    $dataValidate
                );

                if ($salesOrderReturn) {
                    $changes = $salesOrderReturn->getChanges();
                    $original = $salesOrderReturn->getOriginal();

                    $this->historical_data_bulk([
                        "model"         => SalesOrderReturn::class,
                        "originalValue" => $originalValue,
                        "changes"       => $changes,
                        "original"      => $original,
                        "createUpdate"  => $salesOrderReturn,
                        "subject"       => "Sales Order Return",
                        "module"        => "Sales Order Return",
                    ]);

                    $warehouse = Warehouse::where("status", 1)->first();

                    // Save return details and upsert inventory entries
                    foreach ($request->sales_order_return_details as $detail) {
                        $originalDetailValue = SalesOrderReturnDetail::find($detail['id'] ?? null);
                        $salesOrderReturnDetail = SalesOrderReturnDetail::updateOrCreate(
                            ["id" => !empty($detail['id']) ? $detail['id'] : null],
                            [
                                "sales_order_return_id"  => $salesOrderReturn->id,
                                "sales_order_detail_id"  => $detail['sales_order_detail_id'],
                                "product_detail_id"      => $detail['product_detail_id'],
                                "quantity"               => $detail['return_quantity'],
                            ]
                        );

                        if ($salesOrderReturnDetail) {
                            $detailChanges = $salesOrderReturnDetail->getChanges();
                            $detailOriginal = $salesOrderReturnDetail->getOriginal();

                            $this->historical_data_bulk([
                                "model"         => SalesOrderReturnDetail::class,
                                "originalValue" => $originalDetailValue,
                                "changes"       => $detailChanges,
                                "original"      => $detailOriginal,
                                "createUpdate"  => $salesOrderReturnDetail,
                                "subject"       => "Sales Order Return Detail",
                                "module"        => "Sales Order Return",
                            ]);

                            Inventory::updateOrCreate(
                                [
                                    "sales_order_return_detail_id" => $salesOrderReturnDetail->id,
                                    "type"                         => "Release Item Return",
                                ],
                                [
                                    "warehouse_id"                 => $warehouse?->id,
                                    "sales_order_return_detail_id" => $salesOrderReturnDetail->id,
                                    "product_detail_id"            => $detail['product_detail_id'],
                                    "quantity"                     => $detail['return_quantity'],
                                    "type"                         => "Release Item Return",
                                    "created_by"                   => Auth::id(),
                                ]
                            );
                        }
                    }

                    $ret = [
                        "success" => true,
                        "message" => "Sales order return " . ($request->id ? "updated" : "created") . " successfully.",
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
        $data = SalesOrderReturn::withTrashed()
            ->with([
                'sales_order_return_details' => function ($query) {
                    $query->with([
                        'product_detail' => function ($query) {
                            $query->with([
                                'product'      => fn($q) => $q->withTrashed(),
                                'product_size' => fn($q) => $q->withTrashed(),
                                'product_type' => fn($q) => $q->withTrashed(),
                            ]);
                        },
                        'sales_order_detail',
                    ]);
                },
                'sales_order' => fn($q) => $q->withTrashed(),
            ])->find($id);

        return response()->json([
            "success" => true,
            "data"    => $data,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SalesOrderReturn $salesOrderReturn)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SalesOrderReturn $salesOrderReturn)
    {
        //
    }

    public function sales_return_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " sales order return.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $salesOrderReturn = SalesOrderReturn::withTrashed()->updateOrCreate(
                    ["id" => $request->id ?? null],
                    [
                        "deleted_by" => $request->isTrash ? null : Auth::id(),
                        "deleted_at" => $request->isTrash ? null : now(),
                        "updated_by" => $request->isTrash ? Auth::id() : null,
                    ]
                );

                if ($salesOrderReturn) {
                    $historical_data = [
                        [
                            "historicalable_type" => SalesOrderReturn::class,
                            "historicalable_id"   => $salesOrderReturn->id,
                            "subject"             => "Sales Order Return",
                            "module"              => "Sales Order Return",
                            "description"         => "Sales Order Return has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                        "message" => "Sales order return " . ($request->isTrash ? "restored" : "archived") . " successfully.",
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
