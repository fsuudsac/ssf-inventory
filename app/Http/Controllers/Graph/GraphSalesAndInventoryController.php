<?php

namespace App\Http\Controllers\Graph;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\SalesOrder;
use Illuminate\Http\Request;

class GraphSalesAndInventoryController extends Controller
{
    public function index(Request $request)
    {
        $data = [];

        if ($request->action == "year") {
            $data = $this->getYearly($request);
        } else if ($request->action == "quarter") {
            $data = $this->getQuarterly($request);
        } else if ($request->action == "month") {
            $data = $this->getMonthly($request);
        } else if ($request->action == "day") {
            $data = $this->getDaily($request);
        }

        $ret = [
            "success" => true,
            "data" => $data
        ];

        return response()->json($ret, 200);
    }

    private function getYearly($request)
    {
        $data_series_name = [];
        $dataPurchaseSeries = [];
        $dataSalesSeries = [];
        $dataPurchaseReturnSeries = [];
        $dataSalesReturnSeries = [];

        $date_from = date("Y") - 5;
        $date_to = date("Y");

        if ($request->date_range_string) {
            $date_range_string = explode(",", $request->date_range_string);

            $date_from = $date_range_string[0];
            $date_to = $date_range_string[1];
        }

        for ($x = $date_from; $x <= $date_to; $x++) {
            $data_series_name[] = $x;

            $dataPurchase = Purchase::whereYear("date_purchased", $x)->get();

            $dataPurchaseSeries[] = $dataPurchase->where("type", "Purchase Order")->sum("net_amount_due");
            $dataPurchaseReturnSeries[] = $dataPurchase->where("type", "Purchase Order Return")->sum("net_amount_due");

            $dataSales = SalesOrder::whereYear("date_sold", $x)->get();
            $dataSalesSeries[] = $dataSales->where("type", "Release Item")->sum("net_amount_due");
            $dataSalesReturnSeries[] = $dataSales->where("type", "Release Item Return")->sum("net_amount_due");
        }

        $data_series_value = [
            [
                "name" => "Purchase Order",
                "data" => $dataPurchaseSeries,
                "color" => "#2caffe"
            ],
            [
                "name" => "Release Item",
                "data" => $dataSalesSeries,
                "color" => "#544fc5"
            ],
            [
                "name" => "Purchase Order Return",
                "data" => $dataPurchaseReturnSeries,
                "color" => "#00e272"
            ],
            [
                "name" => "Release Item Return",
                "data" => $dataSalesReturnSeries,
                "color" => "#fe6a35"
            ]
        ];

        return [
            "data_series_name" => $data_series_name,
            "data_series_value" => $data_series_value,
            "action" => $request->action,
            "downTo" => "quarter",
        ];
    }

    private function getQuarterly($request)
    {
        $data_series_name = ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"];
        $dataPurchaseSeries = [];
        $dataSalesSeries = [];
        $dataPurchaseReturnSeries = [];
        $dataSalesReturnSeries = [];

        $year = $request->year;

        for ($x = 1; $x <= 4; $x++) {
            $dataPurchase = Purchase::whereYear("date_purchased", $year)->whereRaw("QUARTER(date_purchased) = $x")->get();
            $dataPurchaseSeries[] = $dataPurchase->where("type", "Purchase Order")->sum("net_amount_due");
            $dataPurchaseReturnSeries[] = $dataPurchase->where("type", "Purchase Order Return")->sum("net_amount_due");

            $dataSales = SalesOrder::whereYear("date_sold", $year)->whereRaw("QUARTER(date_sold) = $x")->get();
            $dataSalesSeries[] = $dataSales->where("type", "Release Item")->sum("net_amount_due");
            $dataSalesReturnSeries[] = $dataSales->where("type", "Release Item Return")->sum("net_amount_due");
        }

        $data_series_value = [
            [
                "name" => "Purchase Order",
                "data" => $dataPurchaseSeries,
                "color" => "#2caffe"
            ],
            [
                "name" => "Release Item",
                "data" => $dataSalesSeries,
                "color" => "#544fc5"
            ],
            [
                "name" => "Purchase Order Return",
                "data" => $dataPurchaseReturnSeries,
                "color" => "#00e272"
            ],
            [
                "name" => "Release Item Return",
                "data" => $dataSalesReturnSeries,
                "color" => "#fe6a35"
            ]
        ];

        return [
            "data_series_name" => $data_series_name,
            "data_series_value" => $data_series_value,
            "action" => $request->action,
            "downTo" => "month",
        ];
    }

    private function getMonthly($request)
    {
        $year = $request->year;
        $quarters = ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"];
        $quarter = array_search($request->quarter, $quarters);

        $dataPurchaseSeries = [];
        $dataSalesSeries = [];
        $dataPurchaseReturnSeries = [];
        $dataSalesReturnSeries = [];

        $data_series_name = $this->monthsInQuarter($quarter + 1);
        $data_series_value = [];

        foreach ($data_series_name as $key => $value) {
            $month = date("m", strtotime("$year-$value"));

            $dataPurchase = Purchase::whereYear("date_purchased", $year)->whereMonth("date_purchased", $month)->get();
            $dataPurchaseSeries[] = $dataPurchase->where("type", "Purchase Order")->sum("net_amount_due");
            $dataPurchaseReturnSeries[] = $dataPurchase->where("type", "Purchase Order Return")->sum("net_amount_due");

            $dataSales = SalesOrder::whereYear("date_sold", $year)->whereMonth("date_sold", $month)->get();
            $dataSalesSeries[] = $dataSales->where("type", "Release Item")->sum("net_amount_due");
            $dataSalesReturnSeries[] = $dataSales->where("type", "Release Item Return")->sum("net_amount_due");
        }

        $data_series_value = [
            [
                "name" => "Purchase Order",
                "data" => $dataPurchaseSeries,
                "color" => "#2caffe"
            ],
            [
                "name" => "Release Item",
                "data" => $dataSalesSeries,
                "color" => "#544fc5"
            ],
            [
                "name" => "Purchase Order Return",
                "data" => $dataPurchaseReturnSeries,
                "color" => "#00e272"
            ],
            [
                "name" => "Release Item Return",
                "data" => $dataSalesReturnSeries,
                "color" => "#fe6a35"
            ]
        ];

        return [
            "data_series_name" => $data_series_name,
            "data_series_value" => $data_series_value,
            "action" => $request->action,
            "downTo" => "day",
        ];
    }

    private function getDaily($request)
    {
        $year = $request->year;
        $month = date("m", strtotime("$year-$request->month"));
        $days = cal_days_in_month(CAL_GREGORIAN, $month, $year);

        $data_series_name = range(1, $days);

        $dataPurchaseSeries = [];
        $dataSalesSeries = [];
        $dataPurchaseReturnSeries = [];
        $dataSalesReturnSeries = [];

        foreach ($data_series_name as $key => $value) {
            $day = str_pad($value, 2, '0', STR_PAD_LEFT);
            $date = date("Y-m-d", strtotime("$year-$month-$day"));

            $dataPurchase = Purchase::whereDate("date_purchased", $date)->get();
            $dataPurchaseSeries[] = $dataPurchase->where("type", "Purchase Order")->sum("net_amount_due");
            $dataPurchaseReturnSeries[] = $dataPurchase->where("type", "Purchase Order Return")->sum("net_amount_due");

            $dataSales = SalesOrder::whereDate("date_sold", $date)->get();
            $dataSalesSeries[] = $dataSales->where("type", "Release Item")->sum("net_amount_due");
            $dataSalesReturnSeries[] = $dataSales->where("type", "Release Item Return")->sum("net_amount_due");
        }

        $data_series_value = [
            [
                "name" => "Purchase Order",
                "data" => $dataPurchaseSeries,
                "color" => "#2caffe"
            ],
            [
                "name" => "Release Item",
                "data" => $dataSalesSeries,
                "color" => "#544fc5"
            ],
            [
                "name" => "Purchase Order Return",
                "data" => $dataPurchaseReturnSeries,
                "color" => "#00e272"
            ],
            [
                "name" => "Release Item Return",
                "data" => $dataSalesReturnSeries,
                "color" => "#fe6a35"
            ]
        ];

        return [
            "data_series_name" => $data_series_name,
            "data_series_value" => $data_series_value,
            "action" => $request->action,
            "downTo" => "year",
        ];
    }
}
