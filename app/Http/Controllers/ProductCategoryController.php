<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $date_formatted = "DATE_FORMAT(product_categories.created_at, '%m/%d/%Y')";

        $data = ProductCategory::select([
            "*",
            DB::raw("$date_formatted date_formatted")
        ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "product_category"
                ],
                "rawFields" => []
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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " product category.",
        ];

        $dataValidate = $request->validate([
            "product_category" => [
                "required",
                Rule::unique("product_categories")->ignore($request->id),
            ],
        ]);

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                $originalValue = ProductCategory::find($request->id);
                $productCategory = ProductCategory::updateOrCreate([
                    "id" => $request->id ?? null,
                ], $dataValidate);

                if ($productCategory) {
                    $changes = $productCategory->getChanges();
                    $original = $productCategory->getOriginal();

                    $this->historical_data_bulk([
                        "model" => ProductCategory::class,
                        "originalValue" => $originalValue,
                        "changes" => $changes,
                        "original" => $original,
                        "createUpdate" => $productCategory,
                        "subject" => "Product Category",
                        "module" => "Product Category",
                    ]);

                    $ret = [
                        "success" => true,
                        "message" => "Product Category " . ($request->id ? "updated" : "created") . " successfully.",
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
    public function show(ProductCategory $productCategory)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductCategory $productCategory)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductCategory $productCategory)
    {
        //
    }

    public function product_category_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " product category.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                // Loop over ids to support bulk archive/restore
                $productCategories = ProductCategory::withTrashed()->whereIn("id", $request->ids)->get();

                foreach ($productCategories as $productCategory) {
                    $productCategory->fill([
                        "deleted_by" => $request->isTrash ? null : Auth::id(),
                        "deleted_at" => $request->isTrash ? null : now(),
                        "updated_by" => $request->isTrash ? Auth::id() : null,
                    ])->save();

                    $historical_data = [
                        [
                            "historicalable_type" => ProductCategory::class,
                            "historicalable_id"   => $productCategory->id,
                            "subject"             => "Product Category",
                            "module"              => "Product Category",
                            "description"         => "Product Category has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
                            "field_name"          => "Status",
                            "old_value"           => $request->isTrash ? "Archived" : "Active",
                            "new_value"           => $request->isTrash ? "Active" : "Archived",
                            "action"              => "Update",
                            "status"              => "Success",
                        ]
                    ];

                    $this->historical_data($historical_data);
                }

                $ret = [
                    "success" => true,
                    "message" => "Product Category " . ($request->isTrash ? "restored" : "archived") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
