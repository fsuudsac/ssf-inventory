<?php

namespace App\Http\Controllers;

use App\Models\ProductType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $date_formatted = "DATE_FORMAT(product_types.created_at, '%m/%d/%Y')";

        $data = ProductType::select([
            "*",
            DB::raw("$date_formatted date_formatted"),
        ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "product_type",
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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " product type.",
        ];

        $dataValidate = $request->validate([
            "product_type" => [
                "required",
                Rule::unique("product_types")->ignore($request->id),
            ],
        ]);

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                // withTrashed() so editing an archived record updates instead of duplicate-inserting
                $originalValue = ProductType::withTrashed()->find($request->id);
                $productType = ProductType::withTrashed()->updateOrCreate([
                    "id" => $request->id ?? null,
                ], $dataValidate);

                if ($productType) {
                    $changes = $productType->getChanges();
                    $original = $productType->getOriginal();

                    $this->historical_data_bulk([
                        "model" => ProductType::class,
                        "originalValue" => $originalValue,
                        "changes" => $changes,
                        "original" => $original,
                        "createUpdate" => $productType,
                        "subject" => "Product Type",
                        "module" => "Product Type",
                    ]);

                    $ret = [
                        "success" => true,
                        "message" => "Product Type " . ($request->id ? "updated" : "created") . " successfully.",
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
    public function show(ProductType $productType)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductType $productType)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductType $productType)
    {
        //
    }

    public function product_type_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " product type.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                // Loop over ids to support bulk archive/restore
                $productTypes = ProductType::withTrashed()->whereIn("id", $request->ids)->get();

                foreach ($productTypes as $productType) {
                    $productType->fill([
                        "deleted_by" => $request->isTrash ? null : Auth::id(),
                        "deleted_at" => $request->isTrash ? null : now(),
                        "updated_by" => $request->isTrash ? Auth::id() : null,
                    ])->save();

                    $historical_data = [
                        [
                            "historicalable_type" => ProductType::class,
                            "historicalable_id"   => $productType->id,
                            "subject"             => "Product Type",
                            "module"              => "Product Type",
                            "description"         => "Product Type has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                    "message" => "Product Type " . ($request->isTrash ? "restored" : "archived") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
