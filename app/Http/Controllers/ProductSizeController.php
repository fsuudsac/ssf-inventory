<?php

namespace App\Http\Controllers;

use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductSizeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $date_formatted = "DATE_FORMAT(product_sizes.created_at, '%m/%d/%Y')";

        $data = ProductSize::select([
            "*",
            DB::raw("$date_formatted date_formatted"),
        ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "product_size",
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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " product size.",
        ];

        $dataValidate = $request->validate([
            "product_size" => [
                "required",
                Rule::unique("product_sizes")->ignore($request->id),
            ],
        ]);

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                $originalValue = ProductSize::find($request->id);
                $productSize = ProductSize::updateOrCreate([
                    "id" => $request->id ?? null,
                ], $dataValidate);

                if ($productSize) {
                    $changes = $productSize->getChanges();
                    $original = $productSize->getOriginal();

                    $this->historical_data_bulk([
                        "model" => ProductSize::class,
                        "originalValue" => $originalValue,
                        "changes" => $changes,
                        "original" => $original,
                        "createUpdate" => $productSize,
                        "subject" => "Product Size",
                        "module" => "Product Size",
                    ]);

                    $ret = [
                        "success" => true,
                        "message" => "Product Size " . ($request->id ? "updated" : "created") . " successfully.",
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
    public function show(ProductSize $productSize)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductSize $productSize)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductSize $productSize)
    {
        //
    }

    public function product_size_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " product size.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                // Loop over ids to support bulk archive/restore
                $productSizes = ProductSize::withTrashed()->whereIn("id", $request->ids)->get();

                foreach ($productSizes as $productSize) {
                    $productSize->fill([
                        "deleted_by" => $request->isTrash ? null : Auth::id(),
                        "deleted_at" => $request->isTrash ? null : now(),
                        "updated_by" => $request->isTrash ? Auth::id() : null,
                    ])->save();

                    $historical_data = [
                        [
                            "historicalable_type" => ProductSize::class,
                            "historicalable_id"   => $productSize->id,
                            "subject"             => "Product Size",
                            "module"              => "Product Size",
                            "description"         => "Product Size has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                    "message" => "Product Size " . ($request->isTrash ? "restored" : "archived") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
