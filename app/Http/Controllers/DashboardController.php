<?php

namespace App\Http\Controllers;

use App\Models\ProductDetail;
use App\Models\Purchase;
use App\Models\SalesOrder;

class DashboardController extends Controller
{
    public function product_sales_and_purchase()
    {
        $countProduct = ProductDetail::count();

        $totalPurchase = Purchase::where("paid_status", "Paid")->whereYear("date_purchased", date("Y"))->whereMonth("date_purchased", date("m"))->sum("net_amount_due");

        $totalSales = SalesOrder::where("paid_status", "Paid")->whereYear("date_sold", date("Y"))->whereMonth("date_sold", date("m"))->sum("net_amount_due");

        return response()->json([
            "countProduct" => $countProduct,
            "totalPurchase" => $totalPurchase,
            "totalSales" => $totalSales
        ], 200);
    }
}
