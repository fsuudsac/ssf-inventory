<?php

namespace App\Http\Controllers;

use App\Models\ProductDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class ProductDetailController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $product_name = "(SELECT product_name FROM products WHERE products.id = product_details.product_id)";
        $product_category = "(SELECT (SELECT product_category FROM product_categories WHERE product_categories.id = products.product_category_id) FROM products WHERE products.id = product_details.product_id)";
        $product_category_id = "(SELECT (SELECT id FROM product_categories WHERE product_categories.id = products.product_category_id) FROM products WHERE products.id = product_details.product_id)";
        $product_type = "(SELECT product_type FROM product_types WHERE product_types.id = product_details.product_type_id)";
        $product_size = "(SELECT product_size FROM product_sizes WHERE product_sizes.id = product_details.product_size_id)";
        $date_formatted = "DATE_FORMAT(product_details.created_at, '%m/%d/%Y')";

        // $total_added = "( SELECT SUM(quantity) FROM inventories WHERE inventories.product_detail_id = product_details.id AND inventories.type IN ('Purchase Order', 'Release Item Return', 'Transfer In')";
        // $total_deducted = "( SELECT SUM(quantity) FROM inventories WHERE inventories.product_detail_id = product_details.id AND inventories.type IN ('Release Item', 'Purchase Order Return', 'Transfer Out')";



        // if ($request->from == 'page_sales_form') {
        //     $mainWarehouse = $this->getMainWarehouse();
        //     $warehouse_id = $mainWarehouse->id ?? null;

        //     $total_added .= " AND inventories.warehouse_id = $warehouse_id";
        //     $total_deducted .= " AND inventories.warehouse_id = $warehouse_id";
        // } else {
        //     if ($request->from_warehouse_id) {
        //         $total_added .= " AND inventories.warehouse_id = $request->from_warehouse_id";
        //         $total_deducted .= " AND inventories.warehouse_id = $request->from_warehouse_id";
        //     }
        // }

        // $total_added .= ")";
        // $total_deducted .= ")";

        // $total_stock = "(IF($total_added IS NULL, 0, $total_added) - IF($total_deducted IS NULL, 0, $total_deducted))";

        $cost = "(SELECT cost FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
        $dealers_price = "(SELECT dealers_price FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
        $wholesale_price = "(SELECT wholesale_price FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
        $srp = "(SELECT srp FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
        $fleet_price = "(SELECT fleet_price FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
        $start_date = "(SELECT start_date FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
        $end_date = "(SELECT end_date FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
        $start_date_format = "(SELECT DATE_FORMAT(start_date, '%m/%d/%Y') FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";
        $end_date_format = "(SELECT DATE_FORMAT(end_date, '%m/%d/%Y') FROM product_detail_prices WHERE product_detail_prices.product_detail_id = product_details.id AND start_date <= NOW() AND end_date >= NOW() ORDER BY product_detail_prices.id DESC LIMIT 1)";

        $total_stock = "COALESCE(total_added, 0) - COALESCE(total_deducted, 0)";

        $data = ProductDetail::select([
            "*",
            DB::raw("$product_name product_name"),
            DB::raw("$product_category product_category"),
            DB::raw("$product_category_id product_category_id"),
            DB::raw("$product_type product_type"),
            DB::raw("$product_size product_size"),
            DB::raw("$date_formatted created_at_format"),
            DB::raw("$cost cost"),
            DB::raw("$dealers_price dealers_price"),
            DB::raw("$wholesale_price wholesale_price"),
            DB::raw("$srp srp"),
            DB::raw("$fleet_price fleet_price"),
            DB::raw("$start_date start_date"),
            DB::raw("$end_date end_date"),
            DB::raw("$start_date_format start_date_format"),
            DB::raw("$end_date_format end_date_format")
        ])
            ->withSum(['inventories AS total_added' => function ($query) use ($request) {
                $query->whereIn('type', ['Purchase Order', 'Release Item Return', 'Transfer In'])
                    ->where(function ($query) {
                        $query->orWhere(fn($q) => $q->where('type', 'Purchase Order')->whereHas('purchase_detail.purchase', fn($q) => $q->whereNull('deleted_at')));
                        $query->orWhere(fn($q) => $q->where('type', 'Release Item Return')->whereHas('sales_order_return_detail.sales_order_return', fn($q) => $q->whereNull('deleted_at')));
                        $query->orWhere(fn($q) => $q->where('type', 'Transfer In')->whereHas('transfer_detail.transfer', fn($q) => $q->whereNull('deleted_at')));
                    });

                if ($request->from == 'page_sales_form') {
                    $mainWarehouse = $this->getMainWarehouse();
                    $warehouse_id = $mainWarehouse->id ?? null;

                    $query->where('warehouse_id', $warehouse_id);
                } else {
                    if ($request->from_warehouse_id) {
                        $query->where('warehouse_id', $request->from_warehouse_id);
                    }
                }
            }], 'quantity')
            ->withSum(['inventories AS total_deducted' => function ($query) use ($request) {
                $query->whereIn('type', ['Release Item', 'Purchase Order Return', 'Transfer Out'])
                    ->where(function ($query) {
                        $query->orWhere(fn($q) => $q->where('type', 'Release Item')->whereHas('sales_order_detail.sales', fn($q) => $q->whereNull('deleted_at')));
                        $query->orWhere(fn($q) => $q->where('type', 'Purchase Order Return')->whereHas('purchase_return_detail.purchase_return', fn($q) => $q->whereNull('deleted_at')));
                        $query->orWhere(fn($q) => $q->where('type', 'Transfer Out')->whereHas('transfer_detail.transfer', fn($q) => $q->whereNull('deleted_at')));
                    });

                if ($request->from == 'page_sales_form') {
                    $mainWarehouse = $this->getMainWarehouse();
                    $warehouse_id = $mainWarehouse->id ?? null;

                    $query->where('warehouse_id', $warehouse_id);
                } else {
                    if ($request->from_warehouse_id) {
                        $query->where('warehouse_id', $request->from_warehouse_id);
                    }
                }
            }], 'quantity')
            ->with('product_detail_prices')
            ->search([
                "search" => $request->search,
                "fields" => [
                    "cost",
                    "dealers_price",
                    "wholesale_price",
                    "srp",
                    "fleet_price",
                    "reorder_point",
                ],
                "rawFields" => [
                    $product_name,
                    $product_category,
                    $product_type,
                    $product_size,
                    $date_formatted,
                    $total_stock,
                ]
            ])
            ->trashState($request->isTrash)
            ->filter($request)
            ->sortable($request);

        // Paginate and compute total_stock from withSum columns
        if (!empty($request->page_size)) {
            $data = $data->paginate($request->page_size, ['*'], 'page', $request->page ?? 1)->toArray();

            $data['data'] = collect($data['data'])->map(function ($item) {
                $item['total_stock'] = ($item['total_added'] ?? 0) - ($item['total_deducted'] ?? 0);
                return $item;
            });
        } else {
            $data = $data->get();

            $data = collect($data)->map(function ($item) {
                $item['total_stock'] = ($item['total_added'] ?? 0) - ($item['total_deducted'] ?? 0);
                return $item;
            });
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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " product detail.",
        ];

        $dataValidate = $request->validate([
            "product_id" => "required",
            "product_type_id" => [
                "required",
                Rule::unique("product_details")->where(function ($query) use ($request) {
                    return $query->where("product_id", $request->product_id)
                        ->where("product_type_id",  $request->product_type_id)
                        ->where("product_size_id", $request->product_size_id);
                })->ignore($request->id),
            ],
            "product_size_id" => [
                "required",
                Rule::unique("product_details")->where(function ($query) use ($request) {
                    return $query->where("product_id", $request->product_id)
                        ->where("product_type_id", $request->product_type_id)
                        ->where("product_size_id", $request->product_size_id);
                })->ignore($request->id),
            ],
            "reorder_point" => "nullable",
        ]);

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();

                    if ($request->hasFile('qr_code_file')) {
                        $qr_code_file = $request->file('qr_code_file');
                        $filePath = Str::random(10) . '.' . $qr_code_file->getClientOriginalExtension();
                        $filePath = $qr_code_file->storeAs("products/product$request->product_id", $filePath, 'public');

                        $dataValidate['qr_code'] = $request->qr_code;
                        $dataValidate['qr_code_file_path'] = "storage/" . $filePath;
                    }
                }

                $originalValue = ProductDetail::find($request->id);
                $productDetail = ProductDetail::updateOrCreate([
                    "id" => $request->id ?? null,
                ], $dataValidate);

                if ($productDetail) {
                    $changes = $productDetail->getChanges();
                    $original = $productDetail->getOriginal();

                    $this->historical_data_bulk([
                        "model" => ProductDetail::class,
                        "originalValue" => $originalValue,
                        "changes" => $changes,
                        "original" => $original,
                        "createUpdate" => $productDetail,
                        "subject" => "Product Detail",
                        "module" => "Product Detail",
                    ]);

                    $ret = [
                        "success" => true,
                        "message" => "Product Detail " . ($request->id ? "updated" : "created") . " successfully.",
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
    public function show(ProductDetail $productDetail)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductDetail $productDetail)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductDetail $productDetail)
    {
        //
    }

    public function product_detail_archived(Request $request)
    {

        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " product detail.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $productDetail = ProductDetail::withTrashed()->updateOrCreate([
                    "id" => $request->id ?? null,
                ], [
                    "deleted_by" => $request->isTrash ? null : Auth::id(),
                    "deleted_at" => $request->isTrash ? null : now(),
                ]);

                if ($productDetail) {
                    $historical_data = [
                        [
                            "historicalable_type" => ProductDetail::class,
                            "historicalable_id" => $productDetail->id,
                            "subject" => "Product Detail",
                            "module" => "Product Detail",
                            "description" => "Product Detail has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                        "message" => "Product Detail " . ($request->isTrash ? "restored" : "archived") . " successfully."
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    public function product_detail_generate_qr_code()
    {
        return response()->json([
            "success" => true,
            "data" => $this->generate_qr_code()
        ], 200);
    }

    protected function generate_qr_code()
    {
        $accessCode = Str::random(20);

        $check = ProductDetail::where('qr_code', $accessCode)->first();

        if ($check) {
            return $this->generateAccessCode();
        }

        return $accessCode;
    }

    public function product_detail_preview(Request $request)
    {
        $product_name = "(SELECT product_name FROM products WHERE products.id = product_details.product_id)";
        $product_type = "(SELECT product_type FROM product_types WHERE product_types.id = product_details.product_type_id)";
        $product_size = "(SELECT product_size FROM product_sizes WHERE product_sizes.id = product_details.product_size_id)";
        $date_formatted = "DATE_FORMAT(product_details.created_at, '%m/%d/%Y')";

        $data = ProductDetail::select([
            "*",
            DB::raw("$product_name product_name"),
            DB::raw("$product_type product_type"),
            DB::raw("$product_size product_size"),
            DB::raw("$date_formatted created_at_format")
        ]);

        $data = $data->where(function ($query) use ($request, $product_name, $product_type, $product_size, $date_formatted) {
            if ($request->search) {
                $query->orWhere("cost", 'LIKE', "%$request->search%");
                $query->orWhere("dealers_price", 'LIKE', "%$request->search%");
                $query->orWhere("wholesale_price", 'LIKE', "%$request->search%");
                $query->orWhere("srp", 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$product_name"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$product_type"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$product_size"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$date_formatted"), 'LIKE', "%$request->search%");
            }
        });

        $data = $data->where('product_id', $request->product_id);

        $data = $data->orderBy('id', 'desc')->get();

        return response()->json([
            'success'   => true,
            'data'      => $data
        ], 200);
    }
}
