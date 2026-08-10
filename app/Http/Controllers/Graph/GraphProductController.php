<?php

namespace App\Http\Controllers\Graph;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\ProductDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GraphProductController extends Controller
{
    public function index(Request $request)
    {
        $ret = [
            "success" => true,
            "data" => $this->getProducts($request)
        ];

        return response()->json($ret, 200);
    }

    private function getProducts($request)
    {
        $data_series_name = [];
        $dataSold = [];
        $dataAvailable = [];

        $product_name = "(SELECT product_name FROM products WHERE products.id = product_details.product_id)";
        $product_type = "(SELECT product_type FROM product_types WHERE product_types.id = product_details.product_type_id)";
        $product_size = "(SELECT product_size FROM product_sizes WHERE product_sizes.id = product_details.product_size_id)";
        $product_info = "CONCAT_WS('', $product_name, IF($product_type IS NOT NULL OR $product_size IS NOT NULL, ' (', ''), $product_type, IF($product_size IS NOT NULL, IF($product_size IS NOT NULL, ' - ', ''), ''), $product_size, IF($product_type IS NOT NULL OR $product_size IS NOT NULL, ')', ''))";

        $dataProducts = ProductDetail::select([
            "id",
            DB::raw("$product_info AS product_info"),
        ])->get();

        $data_series_name = $dataProducts->pluck("product_info")->toArray();

        foreach ($dataProducts as $key => $value) {
            $sold = Inventory::where("product_detail_id", $value->id);

            if ($request->date_range_string) {
                $date_range_string = explode(",", $request->date_range_string);
                $sold = $sold->whereBetween("date_inventory", [$date_range_string[0], $date_range_string[1]]);
            }

            $sold = $sold->whereIn("type", ["Release Item", "Purchase Order Return"])
                ->where(function ($query) {
                    $query->orWhere(fn($q) => $q->where('type', 'Release Item')->whereHas('sales_order_detail.sales', fn($q) => $q->whereNull('deleted_at')));
                    $query->orWhere(fn($q) => $q->where('type', 'Purchase Order Return')->whereHas('purchase_return_detail.purchase_return', fn($q) => $q->whereNull('deleted_at')));
                });

            $sold = $sold->get()->sum("quantity");

            $totalAdd = Inventory::where("product_detail_id", $value->id);

            if ($request->date_range_string) {
                $date_range_string = explode(",", $request->date_range_string);
                $totalAdd = $totalAdd->whereBetween("date_inventory", [$date_range_string[0], $date_range_string[1]]);
            }

            $totalAdd = $totalAdd->whereIn('type', ['Purchase Order', 'Release Item Return'])
                ->where(function ($query) {
                    $query->orWhere(fn($q) => $q->where('type', 'Purchase Order')->whereHas('purchase_detail.purchase', fn($q) => $q->whereNull('deleted_at')));
                    $query->orWhere(fn($q) => $q->where('type', 'Release Item Return')->whereHas('sales_order_return_detail.sales_order_return', fn($q) => $q->whereNull('deleted_at')));
                });

            $totalAdd = $totalAdd->get()->sum("quantity");

            $dataSold[$key] = $sold;
            $dataAvailable[$key] = $totalAdd - $sold;
        }

        $data_series_value = [
            [
                "name" => "Remaining Quantity",
                "data" => $dataAvailable,
                "color" => "#544fc5"
            ],
            [
                "name" => "Sold Quantity",
                "data" => $dataSold,
                "color" => "#2caffe"
            ],
        ];

        return [
            "data_series_name" => $data_series_name,
            "data_series_value" => $data_series_value,
            "dataProducts" => $dataProducts
        ];
    }
}
