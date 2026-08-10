<?php

namespace App\Http\Controllers;

use App\Models\ProductDetail;
use App\Models\Profile;
use App\Models\SalesOrder;
use App\Models\SalesOrderDetail;
use App\Models\SalesOrderWarranty;
use App\Models\UserPayment;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SalesOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $customer_type = "(SELECT customer_type FROM profiles WHERE profiles.user_id = sales_orders.customer_id)";
        $customer_name = "(SELECT (SELECT TRIM(CONCAT_WS(' ', lastname, IF(lastname IS NOT NULL, ', ', ''), firstname, IF(middlename='', NULL, middlename), IF(name_ext='', NULL, name_ext))) FROM `profiles` WHERE `profiles`.user_id = users.id) FROM users WHERE users.id = sales_orders.customer_id)";
        $company_name = "(SELECT (SELECT (SELECT company FROM companies WHERE companies.id = `profiles`.company_id) FROM `profiles` WHERE `profiles`.user_id = users.id) FROM users WHERE users.id = sales_orders.customer_id)";
        $credit_term = "(SELECT credit_term FROM credit_terms WHERE credit_terms.id = sales_orders.credit_term_id)";
        $ewt_type = "(SELECT ewt_type FROM ewt_types WHERE ewt_types.id = sales_orders.ewt_type_id)";
        $date_transaction_format = "DATE_FORMAT(sales_orders.created_at, '%m/%d/%Y')";
        $date_due_format = "DATE_FORMAT(sales_orders.date_due, '%m/%d/%Y')";
        $date_returned_format = "DATE_FORMAT(sales_orders.date_returned, '%m/%d/%Y')";

        $data = SalesOrder::select([
            "*",
            DB::raw("$customer_type as customer_type"),
            DB::raw("$customer_name as customer_name"),
            DB::raw("$company_name as company_name"),
            DB::raw("$credit_term as credit_term"),
            DB::raw("$ewt_type as ewt_type"),
            DB::raw("$date_transaction_format as date_transaction_format"),
            DB::raw("$date_due_format as date_due_format"),
            DB::raw("$date_returned_format as date_returned_format"),
        ])
            ->with(['sales_payments'])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "type",
                    "invoice_no",
                    "vat_type",
                ],
                "rawFields" => [
                    $customer_type,
                    $customer_name,
                    $company_name,
                    $credit_term,
                    $ewt_type,
                    $date_transaction_format,
                    $date_due_format,
                    $date_returned_format,
                ]
            ])
            ->trashState($request->isTrash)
            ->filter($request)
            ->sortable($request);

        if ($request->from == 'DashboardPaymentDueList' && $request->limit) {
            $data = $data->limit($request->limit);
        }

        if (!empty($request->page_size)) {
            $data = $data->paginate($request->page_size, ['*'], 'page', $request->page ?? 1)->toArray();
        } else {
            // Return empty result for FormSalesReturn when no customer is selected
            if ($request->from == 'FormSalesReturn' && !$request->customer_id) {
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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " sales order.",
        ];

        $dataValidate = $request->validate([
            "customer_id"  => "required",
            "terms"        => "required",
            "date_sales"   => "required",
            "date_due"     => "required",
            "vat_type"     => "required",
            "invoice_no"   => "required",
        ]);

        // Merge remaining sales order fields
        $dataValidate += [
            "credit_term_id"          => $request->credit_term_id,
            "date_sold"               => $request->date_sales,
            "ewt_type_id"             => $request->ewt_type_id,
            "total_gross_amount"      => $request->total_gross_amount,
            "value_added_tax"         => $request->total_value_added_tax,
            "total_amount_payable"    => $request->total_amount_payable,
            "withholding_tax"         => $request->total_withholding_tax,
            "amount_due"              => $request->total_amount_due,
            "discount"                => $request->total_discount,
            "net_amount_due"          => $request->total_net_amount_due,
            "type"                    => "Release Item",
            "profile_address_id"      => $request->profile_address_id,
            "has_warranty"            => $request->has_warranty,
            "taxpayer_identification" => $request->taxpayer_identification,
            "paid_status"             => $request->terms == "Cash" ? "Paid" : "Not Paid",
        ];

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                // Update customer type on profile if changed
                $findProfile = Profile::where('user_id', $request->customer_id)->first();
                if ($findProfile) {
                    $findProfile->fill(['customer_type' => $request->customer_type])->save();
                }

                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                $originalValue = SalesOrder::find($request->id);
                $salesOrder = SalesOrder::updateOrCreate(
                    ["id" => $request->id ?? null],
                    $dataValidate
                );

                if ($salesOrder) {
                    $changes = $salesOrder->getChanges();
                    $original = $salesOrder->getOriginal();

                    $this->historical_data_bulk([
                        "model"         => SalesOrder::class,
                        "originalValue" => $originalValue,
                        "changes"       => $changes,
                        "original"      => $original,
                        "createUpdate"  => $salesOrder,
                        "subject"       => "Sales Order",
                        "module"        => "Sales Order",
                    ]);

                    // Save sales details and create inventory entries
                    foreach ($request->sales_details as $sales_detail) {
                        $findProductDetail = ProductDetail::find($sales_detail['product_detail_id']);

                        if (!$findProductDetail) {
                            continue;
                        }

                        $originalDetailValue = SalesOrderDetail::find($sales_detail['id'] ?? null);
                        $salesOrderDetail = SalesOrderDetail::updateOrCreate(
                            ["id" => !empty($sales_detail['id']) ? $sales_detail['id'] : null],
                            [
                                "sales_order_id"     => $salesOrder->id,
                                "product_detail_id"  => $sales_detail['product_detail_id'],
                                "quantity"           => $sales_detail['quantity'],
                                "orig_cost"          => $sales_detail['product_detail']['cost'] ?? 0,
                                "price"              => $sales_detail['price'] ?? 0,
                                "total_selling_price" => $sales_detail['selling_price'] ?? 0,
                                "vat"                => $sales_detail['vat'] ?? 0,
                                "gross_amount"       => $sales_detail['gross_amount'] ?? 0,
                            ]
                        );

                        if ($salesOrderDetail) {
                            $detailChanges = $salesOrderDetail->getChanges();
                            $detailOriginal = $salesOrderDetail->getOriginal();

                            $this->historical_data_bulk([
                                "model"         => SalesOrderDetail::class,
                                "originalValue" => $originalDetailValue,
                                "changes"       => $detailChanges,
                                "original"      => $detailOriginal,
                                "createUpdate"  => $salesOrderDetail,
                                "subject"       => "Sales Order Detail",
                                "module"        => "Sales Order",
                            ]);

                            // Resolve main warehouse for inventory entry
                            $findWarehouse = Warehouse::where('status', 1)->first() ?? Warehouse::first();

                            $this->update_create_inventory([
                                "warehouse_id"      => $findWarehouse?->id,
                                "sales_detail_id"   => $salesOrderDetail->id,
                                "product_detail_id" => $sales_detail['product_detail_id'],
                                "amount"            => $sales_detail['price'] ?? 0,
                                "quantity"          => $sales_detail['quantity'],
                                "type"              => "Release Item",
                                "date_inventory"    => $request->date_sales,
                            ], "Release Item");
                        }
                    }

                    // Save warranty records if applicable
                    if ($request->has_warranty == 1) {
                        foreach ($request->sales_order_warranty as $warranty) {
                            SalesOrderWarranty::updateOrCreate(
                                ["id" => !empty($warranty['id']) ? $warranty['id'] : null],
                                [
                                    "sales_order_id"     => $salesOrder->id,
                                    "warranty_no"        => $warranty['warranty_no'],
                                    "warranty_exp_date"  => $warranty['warranty_exp_date'],
                                ]
                            );
                        }
                    }

                    // Handle payment record based on terms
                    if ($request->terms == "Cash") {
                        $paymentData = [
                            "user_id"  => $request->customer_id,
                            "sales_id" => $salesOrder->id,
                            "amount"   => $request->total_net_amount_due,
                            "type"     => "Release Item",
                        ];

                        $findUserPayment = UserPayment::where('sales_id', $salesOrder->id)
                            ->where('user_id', $request->customer_id)
                            ->first();

                        if ($findUserPayment) {
                            $findUserPayment->fill($paymentData)->save();
                        } else {
                            UserPayment::create($paymentData);
                        }
                    } else {
                        // Remove payment record if terms changed away from Cash
                        UserPayment::where('sales_id', $salesOrder->id)
                            ->where('user_id', $request->customer_id)
                            ->delete();
                    }

                    $ret = [
                        "success" => true,
                        "message" => "Sales order " . ($request->id ? "updated" : "created") . " successfully.",
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
        $data = SalesOrder::withTrashed()
            ->with([
                'sales_order_details' => function ($query) {
                    $query->with(['product_detail' => function ($query) {

                        $product_name = "(SELECT product_name FROM products WHERE products.id = product_details.product_id)";
                        $product_category = "(SELECT (SELECT product_category FROM product_categories WHERE product_categories.id = products.product_category_id) FROM products WHERE products.id = product_details.product_id)";
                        $product_category_id = "(SELECT (SELECT id FROM product_categories WHERE product_categories.id = products.product_category_id) FROM products WHERE products.id = product_details.product_id)";
                        $product_type = "(SELECT product_type FROM product_types WHERE product_types.id = product_details.product_type_id)";
                        $product_size = "(SELECT product_size FROM product_sizes WHERE product_sizes.id = product_details.product_size_id)";
                        $date_formatted = "DATE_FORMAT(product_details.created_at, '%m/%d/%Y')";

                        $total_added = "( SELECT SUM(quantity) FROM inventories WHERE inventories.product_detail_id = product_details.id AND inventories.type IN ('Purchase Order', 'Release Item Return', 'Transfer In')";
                        $total_deducted = "( SELECT SUM(quantity) FROM inventories WHERE inventories.product_detail_id = product_details.id AND inventories.type IN ('Release Item', 'Purchase Order Return', 'Transfer Out')";

                        $mainWarehouse = $this->getMainWarehouse();
                        $warehouse_id = $mainWarehouse->id ?? null;

                        $total_added .= " AND inventories.warehouse_id = $warehouse_id";
                        $total_deducted .= " AND inventories.warehouse_id = $warehouse_id";

                        $total_added .= ")";
                        $total_deducted .= ")";

                        $total_stock = "(IF($total_added IS NULL, 0, $total_added) - IF($total_deducted IS NULL, 0, $total_deducted))";

                        $cost = "(SELECT cost FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
                        $dealers_price = "(SELECT dealers_price FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
                        $wholesale_price = "(SELECT wholesale_price FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
                        $srp = "(SELECT srp FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
                        $fleet_price = "(SELECT fleet_price FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
                        $start_date = "(SELECT start_date FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
                        $end_date = "(SELECT end_date FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
                        $start_date_format = "(SELECT DATE_FORMAT(start_date, '%m/%d/%Y') FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
                        $end_date_format = "(SELECT DATE_FORMAT(end_date, '%m/%d/%Y') FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
                        $query->select([
                            "id",
                            DB::raw("$product_name product_name"),
                            DB::raw("$product_category product_category"),
                            DB::raw("$product_category_id product_category_id"),
                            DB::raw("$product_type product_type"),
                            DB::raw("$product_size product_size"),
                            DB::raw("$date_formatted created_at_format"),
                            DB::raw("$total_added total_added"),
                            DB::raw("$total_deducted total_deducted"),
                            DB::raw("$total_stock total_stock"),
                            DB::raw("$cost cost"),
                            DB::raw("$dealers_price dealers_price"),
                            DB::raw("$wholesale_price wholesale_price"),
                            DB::raw("$srp srp"),
                            DB::raw("$fleet_price fleet_price"),
                            DB::raw("$start_date start_date"),
                            DB::raw("$end_date end_date"),
                            DB::raw("$start_date_format start_date_format"),
                            DB::raw("$end_date_format end_date_format")
                        ]);
                        $query->with(['product', 'product_size', 'product_type']);
                        $query->withTrashed();
                    }]);
                },
                'sales_order_warranties',
                'user' => function ($query) {
                    $query->select(['id'])
                        ->with([
                            'profile' => function ($query) {
                                $query->select([
                                    'id',
                                    'user_id',
                                    'customer_type',
                                    'taxpayer_identification',
                                    DB::raw("TRIM(CONCAT_WS(' ', firstname, IF(middlename='', NULL, middlename), lastname, IF(name_ext='', NULL, name_ext))) customer_name"),
                                ])
                                    ->with([
                                        'profile_addresses' => function ($query) {
                                            $query->withTrashed();
                                        },
                                    ]);
                            },
                            'user_payments'
                        ]);
                },
            ])->find($id);

        return response()->json([
            'success' => true,
            'data' => $data,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SalesOrder $salesOrder)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SalesOrder $salesOrder)
    {
        //
    }

    public function sales_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " sales order.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $salesOrder = SalesOrder::withTrashed()->updateOrCreate([
                    "id" => $request->id ?? null,
                ], [
                    "deleted_by" => $request->isTrash ? null : Auth::id(),
                    "deleted_at" => $request->isTrash ? null : now(),
                ]);

                if ($salesOrder) {
                    $historical_data = [
                        [
                            "historicalable_type" => SalesOrder::class,
                            "historicalable_id" => $salesOrder->id,
                            "subject" => "Sales Order",
                            "module" => "Sales Order",
                            "description" => "Sales Order has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                        "message" => "Sales Order " . ($request->isTrash ? "restored" : "archived") . " successfully."
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    public function report_ledger_customer(Request $request)
    {
        $customer_type = "(SELECT customer_type FROM profiles WHERE profiles.user_id = sales_orders.customer_id)";
        $customer_name = "(SELECT(SELECT CONCAT(CASE WHEN lastname IS NOT NULL AND lastname != '' THEN CONCAT(lastname, ', ') ELSE '' END, firstname, CASE WHEN middlename IS NOT NULL THEN CONCAT(LEFT(middlename, 1), '.') ELSE '' END) FROM `profiles` WHERE `profiles`.user_id = users.id) FROM users WHERE users.id = sales_orders.customer_id)";
        $credit_term = "(SELECT credit_term FROM credit_terms WHERE credit_terms.id = sales_orders.credit_term_id)";
        $ewt_type = "(SELECT ewt_type FROM ewt_types WHERE ewt_types.id = sales_orders.ewt_type_id)";
        $date_transaction_format = "DATE_FORMAT(sales_orders.created_at, '%m/%d/%Y')";
        $date_due_format = "DATE_FORMAT(sales_orders.date_due, '%m/%d/%Y')";
        $date_returned_format = "DATE_FORMAT(sales_orders.date_returned, '%m/%d/%Y')";

        $data = SalesOrder::select([
            "*",
            DB::raw("$customer_type as customer_type"),
            DB::raw("$customer_name as customer_name"),
            DB::raw("$credit_term as credit_term"),
            DB::raw("$ewt_type as ewt_type"),
            DB::raw("$date_transaction_format as date_transaction_format"),
            DB::raw("$date_due_format as date_due_format"),
            DB::raw("$date_returned_format as date_returned_format"),
        ])->with(['sales_payments']);

        $data = $data->where(function ($query) use ($request, $customer_type, $customer_name,  $credit_term, $ewt_type, $date_transaction_format, $date_due_format, $date_returned_format) {
            if ($request->search) {
                $query->orWhere(DB::raw("$customer_type"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$customer_name"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$ $credit_term"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$ewt_type"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$date_transaction_format"), 'LIKE', "%$request->search%");
                $query->orWhere("type", 'LIKE', "%$request->search%");
                $query->orWhere("invoice_no", 'LIKE', "%$request->search%");
                $query->orWhere("vat_type", 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$date_due_format"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$date_returned_format"), 'LIKE', "%$request->search%");
            }
        });

        if ($request->customer_id) {
            $customerIds = explode(',', $request->customer_id);
            $data = $data->whereIn("customer_id", $customerIds);
        }

        if ($request->date_sales_string) {
            $date_transaction_format = explode(",", $request->date_sales_string);

            if (count($date_transaction_format) == 2 && $date_transaction_format[0] && $date_transaction_format[1]) {
                $data = $data->whereBetween('date_sold', [$date_transaction_format[0], $date_transaction_format[1]]);
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
            'data'      => $data
        ], 200);
    }

    public function sales_order_no(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not updated!",
        ];

        $sales_orders = $request->data;

        foreach ($sales_orders as $key => $value) {
            SalesOrder::where("id", $value['id'])->update([
                "order_no" => $key,
            ]);
        }

        $ret  = [
            "success" => true,
            "message" => "Data updated successfully"
        ];

        return response()->json($ret, 200);
    }

    public function multiple_archived_sales(Request $request)
    {
        // isTrash = true means currently archived → restore; false = archive
        $isTrash = $request->status == "Archived";

        $ret = [
            "success" => false,
            "message" => "Failed to " . ($isTrash ? "restore" : "archive") . " sales orders.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret, $isTrash) {
                $salesOrders = SalesOrder::withTrashed()->whereIn('id', $request->ids)->get();

                foreach ($salesOrders as $salesOrder) {
                    $salesOrder->fill([
                        "deleted_by" => $isTrash ? null : Auth::id(),
                        "deleted_at" => $isTrash ? null : now(),
                    ])->save();

                    $historical_data = [
                        [
                            "historicalable_type" => SalesOrder::class,
                            "historicalable_id"   => $salesOrder->id,
                            "subject"             => "Sales Order",
                            "module"              => "Sales Order",
                            "description"         => "Sales Order has been " . ($isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
                            "field_name"          => "Status",
                            "old_value"           => $isTrash ? "Archived" : "Active",
                            "new_value"           => $isTrash ? "Active" : "Archived",
                            "action"              => "Update",
                            "status"              => "Success",
                        ]
                    ];

                    $this->historical_data($historical_data);
                }

                $ret = [
                    "success" => true,
                    "message" => "Sales orders " . ($isTrash ? "restored" : "archived") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    protected function generate_invoice_no(Request $request)
    {
        $findLastSalesOrder = SalesOrder::where("customer_id", $request->customer_id)->orderBy('date_purchased', 'desc')->first();

        if ($findLastSalesOrder) {
            $invoiceNo = explode("-", $findLastSalesOrder->invoice_no);
            $invoice_no = $invoiceNo[1] + 1;
        } else {
            $invoice_no = 1;
        }

        return "INV-" . str_pad($invoice_no, 5, "0", STR_PAD_LEFT);
    }

    public function sales_user_payments(Request $request)
    {
        $salesInfo = SalesOrder::find($request->sales_id);

        $data = UserPayment::select([
            "*",
            DB::raw("DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at_format"),
            DB::raw("DATE_FORMAT(created_at, '%m-%d-%Y') as date_payment"),
        ])
            ->where('sales_id', $request->sales_id)
            ->orderBy('created_at', 'asc')
            ->get();

        $net_amount_due = $salesInfo && $salesInfo->net_amount_due ? $salesInfo->net_amount_due : 0;

        $amount_payable = $net_amount_due;

        $data = $data->map(function ($item, $index) use ($net_amount_due, &$amount_payable) {
            $dataUserPayment = UserPayment::select([
                "*",
                DB::raw("DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at_format")
            ])
                ->where('user_id', $item->user_id)
                ->where(DB::raw("DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s')"), "<=", $item->created_at_format)
                ->orderBy('created_at', 'desc')
                ->get();

            $totalAmount = $dataUserPayment->sum('amount');

            $item->total_amount = $totalAmount;
            $item->balance = $net_amount_due - $totalAmount;
            $item->amount_payable = $amount_payable;
            $item->index = $index; // Add index to each item

            $amount_payable -= $item->amount;

            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ], 200);
    }

    public function sales_preview($id)
    {
        $data = SalesOrder::with([
            'user.profile',
            'profile_address',
            'ewt_type',
            'sales_order_details' => function ($query) {
                $query->with(['product_detail' => function ($query) {
                    $query->with(['product', 'product_size', 'product_type']);
                }]);
            },

        ])->find($id);

        return $this->pdf_template([
            'title' => 'SALES-' . $data->invoice_no . '-' . date('Ymd-his'),
            'data' => $data,
            'template' => 'pdf.sales_preview'
        ]);
    }

    public function sales_order_info(Request $request)
    {
        $data = SalesOrder::with([
            'user.profile',
            'profile_address',
            'ewt_type',
            'sales_order_details' => function ($query) {
                $query->with(['product_detail' => function ($query) {
                    $query->with(['product', 'product_size', 'product_type']);
                }]);
            },

        ])->find($request->id);

        return response()->json([
            'success' => true,
            'data' => $data,
        ], 200);
    }

    public function revenue_snap_shot(Request $request)
    {
        $customer_type = "(SELECT customer_type FROM profiles WHERE profiles.user_id = sales_orders.customer_id)";
        $customer_name = "(SELECT(SELECT CONCAT(CASE WHEN lastname IS NOT NULL AND lastname != '' THEN CONCAT(lastname, ', ') ELSE '' END, firstname, CASE WHEN middlename IS NOT NULL THEN CONCAT(LEFT(middlename, 1), '.') ELSE '' END) FROM `profiles` WHERE `profiles`.user_id = users.id) FROM users WHERE users.id = sales_orders.customer_id)";
        $credit_term = "(SELECT credit_term FROM credit_terms WHERE credit_terms.id = sales_orders.credit_term_id)";
        $ewt_type = "(SELECT ewt_type FROM ewt_types WHERE ewt_types.id = sales_orders.ewt_type_id)";
        $date_transaction_format = "DATE_FORMAT(sales_orders.created_at, '%m/%d/%Y')";
        $date_due_format = "DATE_FORMAT(sales_orders.date_due, '%m/%d/%Y')";
        $date_returned_format = "DATE_FORMAT(sales_orders.date_returned, '%m/%d/%Y')";

        $data = SalesOrder::select([
            "*",
            DB::raw("$customer_type as customer_type"),
            DB::raw("$customer_name as customer_name"),
            DB::raw("$credit_term as credit_term"),
            DB::raw("$ewt_type as ewt_type"),
            DB::raw("$date_transaction_format as date_transaction_format"),
            DB::raw("$date_due_format as date_due_format"),
            DB::raw("$date_returned_format as date_returned_format"),
        ])
            ->with(['sales_order_details'])
            ->whereBetween("date_sold", [$request->start_date, $request->end_date]);

        if ($request->product_detail_id) {
            $data = $data->whereHas('sales_order_details', function ($query) use ($request) {
                if ($request->product_detail_id) {
                    $query->where('product_detail_id', $request->product_detail_id);
                }
            });
        }

        $data = $data->get();

        return response()->json([
            'success' => true,
            'data' => $data,
        ], 200);
    }

    // public function report_general_pdf(Request $request)
    // {
    //     $data = SalesOrder::with([
    //         'user.profile',
    //         'profile_address',
    //         'ewt_type',
    //         'sales_order_details' => function ($query) {
    //             $query->with(['product_detail' => function ($query) {
    //                 $query->with(['product', 'product_size', 'product_type']);
    //             }], [
    //                 'sales_order_warranties' => function ($query) {
    //                     $query->with(['warranty_no', 'warranty_exp_date']);
    //                 }
    //             ]);
    //         },
    //     ]);

    //     if ($request->start_date !== null && $request->end_date !== null) {
    //         $data->whereBetween('created_at', [$request->start_date, $request->end_date]);
    //     } else if ($request->start_date === null && $request->end_date === null) {
    //         $data;
    //     }

    //     $findPSalesOrder = $data->get();

    //     dd($findPSalesOrder);

    //     // return $this->pdf_template([
    //     //     'title' => 'REPORT-STATEMENT-OF-PROFIT-OR-LOSS' . '-' . date('Ymd-his'),
    //     //     'data' => $findPSalesOrder,
    //     //     'template' => 'pdf.statement-of-profit-or-loss-report-template'
    //     // ]);
    // }

    public function report_general_pdf(Request $request)
    {
        $query = SalesOrder::with([
            'user.profile',
            'profile_address',
            'ewt_type',
            'sales_order_details' => function ($query) {
                $query->with(['product_detail' => function ($query) {
                    $query->with(['product', 'product_size', 'product_type']);
                }], [
                    'sales_order_warranties' => function ($query) {
                        $query->with(['warranty_no', 'warranty_exp_date']);
                    }
                ]);
            },
        ]);

        // Apply date filter only if both dates are provided
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        $findPSalesOrder = $query->get();

        // If still no data, fetch all records as a fallback
        if ($findPSalesOrder->isEmpty()) {
            $findPSalesOrder = SalesOrder::with([
                'user.profile',
                'profile_address',
                'ewt_type',
                'sales_order_details' => function ($query) {
                    $query->with(['product_detail' => function ($query) {
                        $query->with(['product', 'product_size', 'product_type']);
                    }], [
                        'sales_order_warranties' => function ($query) {
                            $query->with(['warranty_no', 'warranty_exp_date']);
                        }
                    ]);
                },
            ])->get();
        }

        return $this->pdf_template([
            'title' => 'REPORT-STATEMENT-OF-PROFIT-OR-LOSS' . '-' . date('Ymd-his'),
            'data' => [
                'sales_orders' => $findPSalesOrder,
                'start_date' => $request->start_date ?? '',
                'end_date' => $request->end_date ?? '',
            ],
            'template' => 'pdf.statement-of-profit-or-loss-report-template'
        ]);
    }
}
