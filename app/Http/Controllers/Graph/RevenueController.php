<?php

namespace App\Http\Controllers\Graph;

use App\Http\Controllers\Controller;
use App\Models\SalesOrder;
use Illuminate\Http\Request;

class RevenueController extends Controller
{
    public function graph_revenue(Request $request)
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
        $data_values = [];

        $date_from = date("Y") - 10;
        $date_to = date("Y");

        if ($request->date_range_string) {
            $date_range_string = explode(",", $request->date_range_string);

            $date_from = $date_range_string[0];
            $date_to = $date_range_string[1];
        }

        for ($x = $date_from; $x <= $date_to; $x++) {
            $data_series_name[] = $x;

            $dataSales = SalesOrder::where("paid_status", "Paid")->whereYear("date_sold", $x)->get();
            $data_values[] = round($dataSales->where("type", "Release Item")->sum("total_amount_payable"), 2);
        }

        $data_series_value = [
            [
                "name" => "Revenue",
                "data" => $data_values,
                "color" => "#544fc5"
            ],
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
        $data_values = [];

        $year = $request->year;

        for ($x = 1; $x <= 4; $x++) {
            $dataSales = SalesOrder::where("paid_status", "Paid")->whereYear("date_sold", $year)->whereRaw("QUARTER(date_sold) = $x")->get();
            $data_values[] = round($dataSales->where("type", "Release Item")->sum("total_amount_payable"), 2);
        }

        $data_series_value = [
            [
                "name" => "Revenue",
                "data" => $data_values,
                "color" => "#544fc5"
            ],
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

        $data_values = [];

        $data_series_name = $this->monthsInQuarter($quarter + 1);
        $data_series_value = [];

        foreach ($data_series_name as $key => $value) {
            $month = date("m", strtotime("$year-$value"));

            $dataSales = SalesOrder::where("paid_status", "Paid")->whereYear("date_sold", $year)->whereMonth("date_sold", $month)->get();
            $data_values[] = round($dataSales->where("type", "Release Item")->sum("total_amount_payable"), 2);
        }

        $data_series_value = [
            [
                "name" => "Revenue",
                "data" => $data_values,
                "color" => "#544fc5"
            ],
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

        $data_values = [];

        foreach ($data_series_name as $key => $value) {
            $day = str_pad($value, 2, '0', STR_PAD_LEFT);
            $date = date("Y-m-d", strtotime("$year-$month-$day"));

            $dataSales = SalesOrder::where("paid_status", "Paid")->whereDate("date_sold", $date)->get();
            $data_values[] = round($dataSales->where("type", "Release Item")->sum("total_amount_payable"), 2);
        }

        $data_series_value = [
            [
                "name" => "Revenue",
                "data" => $data_values,
                "color" => "#544fc5"
            ],
        ];

        return [
            "data_series_name" => $data_series_name,
            "data_series_value" => $data_series_value,
            "action" => $request->action,
            "downTo" => "year",
        ];
    }
}
