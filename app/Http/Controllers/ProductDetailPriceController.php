<?php

namespace App\Http\Controllers;

use App\Models\ProductDetailPrice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductDetailPriceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $start_date_formatted = "DATE_FORMAT(start_date, '%m/%d/%Y')";
        $end_date_formatted = "DATE_FORMAT(end_date, '%m/%d/%Y')";

        $data = ProductDetailPrice::select([
            "product_detail_prices.*",
            DB::raw("$start_date_formatted start_date_formatted"),
            DB::raw("$end_date_formatted end_date_formatted"),
        ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "price",
                    "start_date",
                    "end_date",
                    "status",
                ],
                "rawFields" => [
                    $start_date_formatted,
                    $end_date_formatted,
                ]
            ])
            ->trashState($request->isTrash)
            ->filter($request);

        // Custom sort: use request sort params if valid, otherwise default by start_date/end_date for ModalProductDetail
        $invalidValues = ['', 'undefined', 'null'];
        if (
            !in_array($request->sort_field, $invalidValues) &&
            !in_array($request->sort_order, $invalidValues)
        ) {
            $data = $data->orderBy($request->sort_field, $request->sort_order);
        } else {
            if ($request->from == 'ModalProductDetail') {
                $data = $data->orderBy('start_date', 'asc')
                    ->orderBy('end_date', 'asc');
            } else {
                $data = $data->orderBy('id', 'desc');
            }
        }

        $data = $data->pagination($request);

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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " product detail price.",
        ];

        $dataValidate = $request->validate([
            "product_detail_id" => "required",
            "cost"              => "required",
            "start_date"        => "required|date",
            "end_date"          => "required|date|after_or_equal:start_date",
        ]);

        // Check for overlapping date ranges on the same product detail
        $overlapping = ProductDetailPrice::where('product_detail_id', $request->product_detail_id)
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_date', [$request->start_date, $request->end_date])
                    ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                    ->orWhere(function ($query) use ($request) {
                        $query->where('start_date', '<=', $request->start_date)
                            ->where('end_date', '>=', $request->end_date);
                    });
            })
            ->when($request->id, fn($query) => $query->where('id', '!=', $request->id))
            ->exists();

        if ($overlapping) {
            $ret["message"] = "The specified date range overlaps with an existing record for this product detail.";
            return response()->json($ret, 200);
        }

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                // Merge optional price fields
                $dataValidate += [
                    "dealers_price"  => $request->dealers_price ?? null,
                    "wholesale_price" => $request->wholesale_price ?? null,
                    "srp"            => $request->srp ?? null,
                    "fleet_price"    => $request->fleet_price ?? null,
                    "product_id"     => $request->product_id ?? null,
                ];

                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                $originalValue = ProductDetailPrice::find($request->id);
                $productDetailPrice = ProductDetailPrice::updateOrCreate(
                    ["id" => $request->id ?? null],
                    $dataValidate
                );

                if ($productDetailPrice) {
                    $changes = $productDetailPrice->getChanges();
                    $original = $productDetailPrice->getOriginal();

                    $this->historical_data_bulk([
                        "model"         => ProductDetailPrice::class,
                        "originalValue" => $originalValue,
                        "changes"       => $changes,
                        "original"      => $original,
                        "createUpdate"  => $productDetailPrice,
                        "subject"       => "Product Detail Price",
                        "module"        => "Product Detail Price",
                    ]);

                    $ret = [
                        "success" => true,
                        "message" => "Product detail price " . ($request->id ? "updated" : "created") . " successfully.",
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
    public function show(ProductDetailPrice $productDetailPrice)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductDetailPrice $productDetailPrice)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductDetailPrice $productDetailPrice)
    {
        //
    }

    public function product_detail_price_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " product detail price.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $productDetailPrice = ProductDetailPrice::withTrashed()->updateOrCreate([
                    "id" => $request->id ?? null,
                ], [
                    "deleted_by" => $request->isTrash ? null : Auth::id(),
                    "deleted_at" => $request->isTrash ? null : now(),
                ]);

                if ($productDetailPrice) {
                    $historical_data = [
                        [
                            "historicalable_type" => ProductDetailPrice::class,
                            "historicalable_id" => $productDetailPrice->id,
                            "subject" => "Product Detail Price",
                            "module" => "Product Detail Price",
                            "description" => "Product Detail Price has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                        "message" => "Product Detail Price " . ($request->isTrash ? "restored" : "archived") . " successfully."
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
