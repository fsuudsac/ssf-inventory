<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\SalesOrder;
use App\Models\UserPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserPaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sales_invoice_no = "( SELECT invoice_no FROM sales_orders WHERE sales_orders.id = user_payments.sales_id )";
        $purchase_invoice_no = "( SELECT invoice_no FROM purchases WHERE purchases.id = user_payments.purchase_id )";
        $customer_name = "(SELECT TRIM(CONCAT_WS(' ', firstname, IF(middlename='', NULL, middlename), lastname, IF(name_ext='', NULL, name_ext))) FROM profiles WHERE profiles.user_id = user_payments.user_id )";

        $data = UserPayment::select([
            "*",
            DB::raw("DATE_FORMAT(created_at, '%Y-%m-%d') as created_at_formatted"),
            DB::raw("DATE_FORMAT(created_at, '%m-%d-%Y') as date_payment_formatted"),
            DB::raw("$sales_invoice_no sales_invoice_no"),
            DB::raw("$purchase_invoice_no purchase_invoice_no"),
            DB::raw("$customer_name customer_name"),
            DB::raw("DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at_formatted_with_time")
        ])
            ->search([
                "search" => $request->search,
                "fields" => [],
                "rawFields" => []
            ])
            ->trashState($request->isTrash)
            ->filter($request)
            ->sortable($request);

        $net_amount_due = round((float) ($request->net_amount_due ?? 0), 2);
        $amount_payable = $net_amount_due;

        // Map callback to compute running balance and totals per payment row
        $mapPayment = function ($item, $index) use ($net_amount_due, &$amount_payable) {
            $dataUserPayment = UserPayment::select([
                "*",
                DB::raw("DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at_formatted_with_time"),
            ])
                ->where("user_id", $item->user_id)
                ->where(DB::raw("DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s')"), "<=", $item->created_at_formatted_with_time)
                ->orderBy("created_at", "desc")
                ->get();

            $totalAmount = round($dataUserPayment->sum("amount"), 2);

            $item->total_amount   = number_format($totalAmount, 2, ".", "");
            $item->balance        = number_format($net_amount_due - $totalAmount, 2, ".", "");
            $item->amount_payable = number_format($amount_payable, 2, ".", "");
            $item->index          = $index;

            $amount_payable -= $item->amount;

            return $item;
        };

        if (!empty($request->page_size)) {
            $data = $data->paginate($request->page_size, ["*"], "page", $request->page ?? 1)->toArray();

            $data["data"] = collect($data["data"])->map($mapPayment);
        } else {
            $data = collect($data->get())->map($mapPayment);
        }

        return response()->json([
            "success" => true,
            "data"    => $data,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to save payment.",
        ];

        $request->validate([
            "user_id" => "required",
            "amount"  => "required",
        ]);

        try {
            DB::transaction(function () use ($request, &$ret) {
                $userPayment = UserPayment::create([
                    "sales_id"    => $request->sales_id ?? null,
                    "purchase_id" => $request->purchase_id ?? null,
                    "amount"      => $request->amount,
                    "type"        => $request->type,
                    "user_id"     => $request->user_id,
                    "created_by"  => Auth::id(),
                ]);

                if ($userPayment) {
                    $this->historical_data_bulk([
                        "model"         => UserPayment::class,
                        "originalValue" => null,
                        "changes"       => $userPayment->getChanges(),
                        "original"      => $userPayment->getOriginal(),
                        "createUpdate"  => $userPayment,
                        "subject"       => "User Payment",
                        "module"        => "User Payment",
                    ]);

                    // Update purchase paid status if fully settled
                    if ($request->purchase_id) {
                        $purchase = Purchase::find($request->purchase_id);

                        if ($purchase) {
                            $totalPayment = $this->getTotalPayment($request->purchase_id, "Purchased");
                            $totalBalance = round($purchase->net_amount_due, 2) - round($totalPayment, 2);

                            if ($totalBalance <= 0) {
                                $purchase->update(["paid_status" => "Paid"]);
                            }
                        }
                    }

                    // Update sales order paid status if fully settled
                    if ($request->sales_id) {
                        $salesOrder = SalesOrder::find($request->sales_id);

                        if ($salesOrder) {
                            $totalPayment = $this->getTotalPayment($request->sales_id, "Release Item");
                            $totalBalance = round($salesOrder->net_amount_due, 2) - round($totalPayment, 2);

                            if ($totalBalance <= 0) {
                                $salesOrder->update(["paid_status" => "Paid"]);
                            }
                        }
                    }

                    $ret = [
                        "success" => true,
                        "message" => "Payment saved successfully.",
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
    public function show(UserPayment $userPayment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserPayment $userPayment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserPayment $userPayment)
    {
        //
    }
}
