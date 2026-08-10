<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\ProductDetail;
use App\Models\Purchase;
use App\Models\SalesOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $product_name = "(SELECT product_name FROM products WHERE products.id = inventories.product_detail_id)";
        $warehouse_name = "(SELECT warehouse_name FROM warehouses WHERE warehouses.id = inventories.warehouse_id)";
        $address = "(SELECT address FROM warehouses WHERE warehouses.id = inventories.warehouse_id)";
        $reorder_point = "(SELECT reorder_point FROM product_details WHERE product_details.id = inventories.product_detail_id)";
        $product_size = "(SELECT (SELECT product_size FROM product_sizes WHERE product_sizes.id = product_details.product_size_id ) FROM product_details WHERE product_details.id = inventories.product_detail_id)";
        $date_inventory_formatted = "DATE_FORMAT(inventories.date_inventory, '%m/%d/%Y')";

        $quantity_add = "(SELECT SUM(quantity) FROM inventories WHERE inventories.product_detail_id = inventories.product_detail_id AND inventories.type IN ('Purchase Order', 'Release Item Return', 'Transfer In')";
        $quantity_sub = "(SELECT SUM(quantity) FROM inventories WHERE inventories.product_detail_id = inventories.product_detail_id AND inventories.type IN ('Release Item', 'Purchase Order Return', 'Transfer Out')";

        if ($request->warehouse_id) {
            $quantity_add .= " AND inventories.warehouse_id = ?";
            $quantity_sub .= " AND inventories.warehouse_id = ?";
        }

        $quantity_add .= ")";
        $quantity_sub .= ")";

        $available_stock = "(IFNULL($quantity_add, 0) - IFNULL($quantity_sub, 0))";

        $data = Inventory::select([
            "*",
            DB::raw("$product_name as product_name"),
            DB::raw("$warehouse_name as warehouse_name"),
            DB::raw("$address as address"),
            DB::raw("$reorder_point as reorder_point"),
            DB::raw("$product_size as product_size"),
            DB::raw("$date_inventory_formatted as date_inventory_formatted"),
            DB::raw("$quantity_add as quantity_add"),
            DB::raw("$quantity_sub as quantity_sub"),
            DB::raw("$available_stock as available_stock"),
        ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "email",
                    "type",
                    "status",
                ],
                "rawFields" => [
                    $product_name,
                    $warehouse_name,
                    $address,
                    $reorder_point,
                    $product_size,
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Inventory $inventory)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Inventory $inventory)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory)
    {
        //
    }

    public function product_inventory(Request $request)
    {
        $product_name = "( SELECT product_name FROM products WHERE products.id = product_id )";
        $product_type = "( SELECT product_type FROM product_types WHERE product_types.id = product_type_id )";
        $product_size = "( SELECT product_size FROM product_sizes WHERE product_sizes.id = product_size_id )";
        $created_at_format = "DATE_FORMAT(created_at, '%Y-%m-%d')";
        $availableStockRaw = "COALESCE(quantity_add, 0) - COALESCE(quantity_sub, 0)";

        $data = ProductDetail::select([
            "*",
            DB::raw("$product_name product_name"),
            DB::raw("$product_type product_type"),
            DB::raw("$product_size product_size"),
            DB::raw("$created_at_format created_at_format"),
        ])
            ->withSum(['inventories AS quantity_add' => function ($query) use ($request) {
                $query->whereIn('type', ['Purchase Order', 'Release Item Return', 'Transfer In'])
                    ->where(function ($query) {
                        $query->orWhere(fn($q) => $q->where('type', 'Purchase Order')->whereHas('purchase_detail.purchase', fn($q) => $q->whereNull('deleted_at')));
                        $query->orWhere(fn($q) => $q->where('type', 'Release Item Return')->whereHas('sales_order_return_detail.sales_order_return', fn($q) => $q->whereNull('deleted_at')));
                        $query->orWhere(fn($q) => $q->where('type', 'Transfer In')->whereHas('transfer_detail.transfer', fn($q) => $q->whereNull('deleted_at')));
                    });


                if ($request->warehouse_ids) {
                    $query->whereIn('warehouse_id', explode(',', $request->warehouse_ids));
                }
            }], 'quantity')
            ->withSum(['inventories AS quantity_sub' => function ($query) use ($request) {
                $query->whereIn('type', ['Release Item', 'Purchase Order Return', 'Transfer Out'])
                    ->where(function ($query) {
                        $query->orWhere(fn($q) => $q->where('type', 'Release Item')->whereHas('sales_order_detail.sales', fn($q) => $q->whereNull('deleted_at')));
                        $query->orWhere(fn($q) => $q->where('type', 'Purchase Order Return')->whereHas('purchase_return_detail.purchase_return', fn($q) => $q->whereNull('deleted_at')));
                        $query->orWhere(fn($q) => $q->where('type', 'Transfer Out')->whereHas('transfer_detail.transfer', fn($q) => $q->whereNull('deleted_at')));
                    });

                if ($request->warehouse_ids) {
                    $query->whereIn('warehouse_id', explode(',', $request->warehouse_ids));
                }
            }], 'quantity')
            ->with(['inventories.warehouse', 'product_detail_prices']);

        $data = $data->where(function ($query) use ($request, $product_name, $product_type, $product_size, $created_at_format) {
            if ($request->search) {
                $availableStockRaw = "COALESCE(quantity_add, 0) - COALESCE(quantity_sub, 0)";
                $query->orHavingRaw("$availableStockRaw LIKE ?", ["%$request->search%"]);

                $query->orWhere(DB::raw("$product_name"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$product_type"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$product_size"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$created_at_format"), 'LIKE', "%$request->search%");
            }
        });

        if ($request->inventoryStatus) {
            if ($request->inventoryStatus == 'Out of Stock') {
                $data = $data->whereRaw("$availableStockRaw <= 0");
            } else if ($request->inventoryStatus == 'Low Inventory') {
                $data = $data->whereRaw("$availableStockRaw > 0 && $availableStockRaw <= reorder_point");
            } else if ($request->inventoryStatus == "Higher than 'Reorder Point'") {
                $data = $data->whereRaw("$availableStockRaw > reorder_point");
            }
        }

        if ($request->warehouse_ids) {
            $warehouse_ids = explode(',', $request->warehouse_ids);
            $data = $data->wherehas('inventories', function ($query) use ($warehouse_ids) {
                $query->whereIn('warehouse_id', $warehouse_ids);
            });
        }

        if ($request->isTrash) {
            $data->onlyTrashed();
        }

        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null'  &&
                $request->sort_order != ''  && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                if ($request->sort_field == 'available_stock') {
                    $data = $data->orderByRaw($availableStockRaw . ' ' . $request->sort_order);
                } else {
                    $data = $data->orderBy($request->sort_field, $request->sort_order);
                }
            }
        } else {
            $data = $data->orderBy('id', 'desc');
        }

        if ($request->page_size) {
            $data = $data->limit($request->page_size)
                ->paginate($request->page_size, ['*'], 'page', $request->page)
                ->toArray();

            $data['data'] = collect($data['data'])->map(function ($item) {
                $item['available_stock'] = $item['quantity_add'] - $item['quantity_sub'];
                return $item;
            });
        } else {
            $data = $data->get();

            $data = collect($data)->map(function ($item) {
                $item['available_stock'] = $item['quantity_add'] - $item['quantity_sub'];
                return $item;
            });
        }

        return response()->json([
            'success'   => true,
            'data'      => $data
        ], 200);
    }

    public function report_ledger_supplier_pdf(Request $request)
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
        ]);

        if ($request->supplier_id !== null && $request->date_range !== null) {
            $dateRange = explode(',', $request->date_range);
            $data->where('supplier_id', $request->supplier_id)
                ->whereBetween('date_purchased', [$dateRange[0], $dateRange[1]]);
        } else if ($request->supplier_id === null && $request->date_range !== null) {
            $dateRange = explode(',', $request->date_range);
            $data->whereBetween('date_purchased', [$dateRange[0], $dateRange[1]]);
        } else if ($request->supplier_id !== null && $request->date_range === null) {
            $data->where('supplier_id', $request->supplier_id);
        } else {
            $data;
        }

        $findPurchase = $data->get();

        // dd($findPurchase);

        return $this->pdf_template([
            'title' => 'REPORT-LEDGER-SUPPLIER' . '-' . date('Ymd-his'),
            'data' => $findPurchase,
            'template' => 'pdf.supplier-ledger-report-template'
        ]);
    }

    public function report_ledger_customer_pdf(Request $request)
    {
        $data = SalesOrder::with([
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

        if ($request->customer_id !== null && $request->date_range !== null) {
            $dateRange = explode(',', $request->date_range);
            $data->where('customer_id', $request->customer_id)
                ->whereBetween('date_sold', [$dateRange[0], $dateRange[1]]);
        } else if ($request->customer_id === null && $request->date_range !== null) {
            $dateRange = explode(',', $request->date_range);
            $data->whereBetween('date_sold', [$dateRange[0], $dateRange[1]]);
        } else if ($request->customer_id !== null && $request->date_range === null) {
            $data->where('customer_id', $request->customer_id);
        } else {
            $data;
        }

        $findPSalesOrder = $data->get();

        // dd($findPSalesOrder;

        return $this->pdf_template([
            'title' => 'REPORT-LEDGER-CUSTOMER' . '-' . date('Ymd-his'),
            'data' => $findPSalesOrder,
            'template' => 'pdf.customer-ledger-report-template'
        ]);
    }

    public function report_inventory_pdf(Request $request)
    {
        $product_name = "( SELECT product_name FROM products WHERE products.id = product_id )";
        $product_type = "( SELECT product_type FROM product_types WHERE product_types.id = product_type_id )";
        $product_size = "( SELECT product_size FROM product_sizes WHERE product_sizes.id = product_size_id )";
        $quantity_add = "( SELECT SUM(quantity) FROM inventories WHERE inventories.product_detail_id = product_details.id AND inventories.type IN ('Purchase Order', 'Release Item Return', 'Transfer In')";
        $quantity_sub = "( SELECT SUM(quantity) FROM inventories WHERE inventories.product_detail_id = product_details.id AND inventories.type IN ('Release Item', 'Purchase Order Return', 'Transfer Out')";

        if ($request->warehouse_ids) {
            $warehouse_ids = explode(',', $request->warehouse_ids);
            $warehouse_ids_str = implode(',', array_map('intval', $warehouse_ids)); // Ensure the IDs are integers

            $quantity_add .= " AND inventories.warehouse_id IN ($warehouse_ids_str)";
            $quantity_sub .= " AND inventories.warehouse_id IN ($warehouse_ids_str)";
        }

        $quantity_add .= " )";
        $quantity_sub .= " )";

        $available_stock = "(IF($quantity_add IS NULL, 0, $quantity_add) - IF($quantity_sub IS NULL, 0, $quantity_sub))";
        $created_at_format = "DATE_FORMAT(created_at, '%Y-%m-%d')";

        $data = ProductDetail::select([
            "*",
            DB::raw("$product_name product_name"),
            DB::raw("$product_type product_type"),
            DB::raw("$product_size product_size"),
            DB::raw("$quantity_add quantity_add"),
            DB::raw("$quantity_sub quantity_sub"),
            DB::raw("$available_stock available_stock"),
            DB::raw("$created_at_format created_at_format"),
        ])->with(['inventories.warehouse', 'product_detail_prices']);

        $data = $data->where(function ($query) use ($request, $product_name, $product_type, $product_size, $quantity_add, $quantity_sub, $available_stock, $created_at_format) {
            if ($request->search) {
                $query->orWhere(DB::raw("$product_name"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$product_type"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$product_size"), 'LIKE', "%$request->search%");
                // $query->orWhere(DB::raw("$quantity_add"), 'LIKE', "%$request->search%");
                // $query->orWhere(DB::raw("$quantity_sub"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$available_stock"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$created_at_format"), 'LIKE', "%$request->search%");
            }
        });

        if ($request->inventoryStatus == 'Out of Stock') {
            $data = $data->whereRaw("$available_stock <= 0");
        } else if ($request->inventoryStatus == 'Low Inventory') {
            $data = $data->whereRaw("$available_stock > 0 && $available_stock <= reorder_point");
        } else if ($request->inventoryStatus == "Higher than 'Reorder Point'") {
            $data = $data->whereRaw("$available_stock > reorder_point");
        }

        if ($request->warehouse_ids) {
            $warehouse_ids = explode(',', $request->warehouse_ids);
            $data = $data->whereHas('inventories', function ($query) use ($warehouse_ids) {
                $query->whereIn('warehouse_id', $warehouse_ids);
            });
        }

        if ($request->isTrash) {
            $data->onlyTrashed();
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

        // Execute the query and retrieve the data
        $findInventory = $data->get();

        // Generate and return the PDF
        return $this->pdf_template([
            'title' => 'REPORT-LEDGER-INVENTORY ' . '-' . date('Ymd-his'),
            'data' => $findInventory,
            'template' => 'pdf.inventory-ledger-report-template',
        ]);
    }
}
