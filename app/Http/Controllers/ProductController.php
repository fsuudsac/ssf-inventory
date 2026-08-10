<?php

namespace App\Http\Controllers;

use App\Imports\ProductImport;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $product_category = "(SELECT product_category FROM product_categories WHERE product_categories.id = products.product_category_id)";
        $created_at_format = "DATE_FORMAT(products.created_at, '%m/%d/%Y')";

        $data = Product::select([
            "*",
            DB::raw("$product_category product_category"),
            DB::raw("$created_at_format created_at_format")
        ])
            ->with(['attachments'])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "product_name",
                    "qr_code",
                    "description",
                ],
                "rawFields" => [
                    $product_category,
                    $created_at_format,
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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " product.",
        ];

        $dataValidate = $request->validate([
            "product_name" => [
                "required",
                Rule::unique("products")->where("product_category_id", $request->product_category_id)->ignore($request->id),
            ],
            "product_category_id" => "required",
            "description" => "nullable",
        ]);

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                $originalValue = Product::find($request->id);
                $product = Product::updateOrCreate([
                    "id" => $request->id ?? null,
                ], $dataValidate);

                if ($product) {
                    if ($request->hasFile("qr_code_file")) {
                        $qr_code_file = $request->file("qr_code_file");
                        $filePath = Str::random(10) . "." . $qr_code_file->getClientOriginalExtension();
                        $filePath = $qr_code_file->storeAs("products/product$product->id", $filePath, 'public');

                        $product->qr_code = $request->qr_code;
                        $product->qr_file_path = "storage/" . $filePath;
                        $product->save();
                    }

                    if ($request->hasFile("attachments")) {
                        $attachments = $request->file("attachments");

                        foreach ($attachments as $key => $attachment) {
                            $this->create_attachment($product, $attachment, [
                                "folder_name" => "products/product$product->id",
                                "file_description" => "Product Attachment",
                            ]);
                        }
                    }

                    $changes = $product->getChanges();
                    $original = $product->getOriginal();

                    $this->historical_data_bulk([
                        "model" => Product::class,
                        "originalValue" => $originalValue,
                        "changes" => $changes,
                        "original" => $original,
                        "createUpdate" => $product,
                        "subject" => "Product",
                        "module" => "Product",
                    ]);

                    $ret = [
                        "success" => true,
                        "message" => "Product " . ($request->id ? "updated" : "created") . " successfully.",
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
        $data = Product::withTrashed()->with(['attachments', 'product_details.product_detail_prices'])->find($id);

        return response()->json([
            'success'   => true,
            'data'      => $data
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        //
    }

    public function upload_products(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not updated",
            "request" => $request->all()
        ];

        $request->validate([
            'file_excel' => 'required|mimes:xls,xlsx',
        ]);

        if ($request->hasFile('file_excel')) {
            $path = $request->file('file_excel');
            $importData = ['link_origin' => $request->link_origin];
            $import = new ProductImport($importData);
            Excel::import($import, $path);

            $ret = $import->getMessage();
        }

        $ret += [
            "request" => $request->all()
        ];

        return response()->json($ret);
    }

    public function product_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " product.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                // Loop over ids to support bulk archive/restore
                $products = Product::withTrashed()->whereIn("id", $request->ids)->get();

                foreach ($products as $product) {
                    $product->fill([
                        "deleted_by" => $request->isTrash ? null : Auth::id(),
                        "deleted_at" => $request->isTrash ? null : now(),
                        "updated_by" => $request->isTrash ? Auth::id() : null,
                    ])->save();

                    $historical_data = [
                        [
                            "historicalable_type" => Product::class,
                            "historicalable_id"   => $product->id,
                            "subject"             => "Product",
                            "module"              => "Product",
                            "description"         => "Product has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                    "message" => "Product " . ($request->isTrash ? "restored" : "archived") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }



    public function product_info(Request $request)
    {
        $data = Product::with(['attachments', 'product_details'])->find($request->id);

        return response()->json([
            'success'   => true,
            'data'      => $data
        ], 200);
    }

    public function product_generate_qr_code()
    {
        return response()->json([
            "success" => true,
            "data" => $this->generate_qr_code()
        ], 200);
    }

    protected function generate_qr_code()
    {
        $accessCode = Str::random(20);

        $check = Product::where('qr_code', $accessCode)->first();

        if ($check) {
            return $this->generateAccessCode();
        }

        return $accessCode;
    }


    public function product_graph(Request $request)
    {
        $data = [];

        $data = $this->product_bar_graph($request);

        $ret = [
            "success" => true,
            "data" => $data
        ];

        return response()->json($ret, 200);
    }

    public function product_bar_graph()
    {
        $data_series_name = [];
        $data_series_value = [];

        $data_value = [];

        $getProduct = Product::select([
            "*"
        ])->orderBy('product_name', 'asc')->get();

        foreach ($getProduct as $key => $value) {
            $data_series_name[] = [
                $value->product_name
            ];

            $dataProducts = Product::where('product_name', $value->product_name)->count();

            $data_value[] = [
                "name" => $value->product_name,
                "y" => $dataProducts,
            ];
        }

        $data_series_value = [
            [
                "name" => "Products",
                "data" => $data_value,
                "colorByPoint" => true,
                "pointPlacement" => -0.2,
                "dataLabels" => [
                    "enabled" => true,
                    "color" => "#ffffff",
                    "style" => [
                        'fontSize' => '20px',
                        'fontFamily' => 'Verdana, sans-serif',
                    ]
                ],
                "grouping" => false,
            ],
        ];

        return [
            "data_series_value" => $data_series_value,
            "data_series_name" => $data_series_name,
        ];
    }

    public function product_attachment(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not updated",
        ];

        $request->validate([
            'product_id' => 'required',
            'attachment' => 'required',
        ]);

        $findProduct = Product::find($request->product_id);

        if ($findProduct) {
            $attachment = $request->file('attachment');

            $create_attachment = $this->create_attachment($findProduct, $attachment, [
                'folder_name' => "products/product$findProduct->id",
                'file_description' => "Product attachment"
            ]);

            $ret = [
                "success" => true,
                "message" => "Data updated successfully",
                "data" => $create_attachment
            ];
        }

        return response()->json($ret, 200);
    }
}
