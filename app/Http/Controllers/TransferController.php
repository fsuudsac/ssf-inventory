<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Transfer;
use App\Models\TransferDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransferController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $from_transfer_name = "(SELECT warehouse_name FROM warehouses WHERE warehouses.id = transfers.from_warehouse_id)";
        $to_transfer_name = "(SELECT warehouse_name FROM warehouses WHERE warehouses.id = transfers.to_warehouse_id)";
        $date_transfer_formatted = "DATE_FORMAT(transfers.date_transfer, '%m/%d/%Y')";

        $data = Transfer::select([
            "transfers.*",
            DB::raw("$from_transfer_name from_warehouse_name"),
            DB::raw("$to_transfer_name to_warehouse_name"),
            DB::raw("$date_transfer_formatted date_transfer_formatted")
        ])
            ->with([
                'transfer_details' => function ($query) {
                    $query->with('product_detail.product', 'product_detail.product_type', 'product_detail.product_size');
                }
            ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "status",
                ],
                "rawFields" => [
                    $from_transfer_name,
                    $to_transfer_name,
                    $date_transfer_formatted
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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " transfer.",
        ];

        $dataValidate = $request->validate([
            "from_warehouse_id" => "required",
            "to_warehouse_id"   => "required",
            "date_transfer"     => "required",
            "status"            => "required",
        ]);

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                $dataValidate["reference_no"] = $this->generateReferenceNo();

                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                $originalValue = Transfer::find($request->id);
                $transfer = Transfer::updateOrCreate(
                    ["id" => $request->id ?? null],
                    $dataValidate
                );

                if ($transfer) {
                    $changes = $transfer->getChanges();
                    $original = $transfer->getOriginal();

                    $this->historical_data_bulk([
                        "model"         => Transfer::class,
                        "originalValue" => $originalValue,
                        "changes"       => $changes,
                        "original"      => $original,
                        "createUpdate"  => $transfer,
                        "subject"       => "Transfer",
                        "module"        => "Transfer",
                    ]);

                    // Save transfer details and create inventory entries if Completed
                    foreach ($request->transfer_details ?? [] as $detail) {
                        $originalDetailValue = TransferDetail::find($detail['id'] ?? null);
                        $transferDetail = TransferDetail::updateOrCreate(
                            ["id" => !empty($detail['id']) ? $detail['id'] : null],
                            [
                                "transfer_id"       => $transfer->id,
                                "product_detail_id" => $detail['product_detail_id'],
                                "quantity"          => $detail['quantity'],
                            ]
                        );

                        if ($transferDetail) {
                            $detailChanges = $transferDetail->getChanges();
                            $detailOriginal = $transferDetail->getOriginal();

                            $this->historical_data_bulk([
                                "model"         => TransferDetail::class,
                                "originalValue" => $originalDetailValue,
                                "changes"       => $detailChanges,
                                "original"      => $detailOriginal,
                                "createUpdate"  => $transferDetail,
                                "subject"       => "Transfer Detail",
                                "module"        => "Transfer",
                            ]);

                            if ($request->status == "Completed") {
                                Inventory::updateOrCreate(
                                    [
                                        "transfer_detail_id" => $transferDetail->id,
                                        "type"               => "Transfer Out",
                                    ],
                                    [
                                        "warehouse_id"       => $request->from_warehouse_id,
                                        "transfer_detail_id" => $transferDetail->id,
                                        "product_detail_id"  => $detail['product_detail_id'],
                                        "quantity"           => $detail['quantity'],
                                        "type"               => "Transfer Out",
                                        "created_by"         => Auth::id(),
                                    ]
                                );

                                Inventory::updateOrCreate(
                                    [
                                        "transfer_detail_id" => $transferDetail->id,
                                        "type"               => "Transfer In",
                                    ],
                                    [
                                        "warehouse_id"       => $request->to_warehouse_id,
                                        "transfer_detail_id" => $transferDetail->id,
                                        "product_detail_id"  => $detail['product_detail_id'],
                                        "quantity"           => $detail['quantity'],
                                        "type"               => "Transfer In",
                                        "created_by"         => Auth::id(),
                                    ]
                                );
                            }
                        }
                    }

                    $ret = [
                        "success" => true,
                        "message" => "Transfer " . ($request->id ? "updated" : "created") . " successfully.",
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
    public function show(Transfer $transfer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transfer $transfer)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transfer $transfer)
    {
        //
    }

    public function transfer_multi_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " transfers.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $transfers = Transfer::withTrashed()->whereIn('id', $request->ids)->get();

                foreach ($transfers as $transfer) {
                    if ($request->isTrash) {
                        $transfer->fill([
                            "deleted_by" => null,
                            "deleted_at" => null,
                            "updated_by" => Auth::id(),
                        ])->save();
                    } else {
                        $transfer->fill([
                            "deleted_by" => Auth::id(),
                            "deleted_at" => now(),
                        ])->save();
                    }

                    $historical_data = [
                        [
                            "historicalable_type" => Transfer::class,
                            "historicalable_id"   => $transfer->id,
                            "subject"             => "Transfer",
                            "module"              => "Transfer",
                            "description"         => "Transfer has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                    "message" => "Transfers " . ($request->isTrash ? "restored" : "archived") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    public function transfer_change_status(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to change transfer status.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $transfer = Transfer::with('transfer_details')->find($request->id);

                if ($transfer) {
                    $transfer->fill(["status" => $request->status])->save();

                    $historical_data = [
                        [
                            "historicalable_type" => Transfer::class,
                            "historicalable_id"   => $transfer->id,
                            "subject"             => "Transfer",
                            "module"              => "Transfer",
                            "description"         => "Transfer status changed to {$request->status} by " . $this->authFullname(),
                            "field_name"          => "status",
                            "old_value"           => $transfer->getOriginal("status"),
                            "new_value"           => $request->status,
                            "action"              => "Update",
                            "status"              => "Success",
                        ]
                    ];

                    $this->historical_data($historical_data);

                    // Create inventory entries when status is set to Completed
                    if ($request->status == "Completed") {
                        foreach ($transfer->transfer_details as $detail) {
                            Inventory::updateOrCreate(
                                [
                                    "transfer_detail_id" => $detail->id,
                                    "type"               => "Transfer Out",
                                ],
                                [
                                    "warehouse_id"       => $transfer->from_warehouse_id,
                                    "transfer_detail_id" => $detail->id,
                                    "product_detail_id"  => $detail->product_detail_id,
                                    "quantity"           => $detail->quantity,
                                    "type"               => "Transfer Out",
                                    "created_by"         => Auth::id(),
                                ]
                            );

                            Inventory::updateOrCreate(
                                [
                                    "transfer_detail_id" => $detail->id,
                                    "type"               => "Transfer In",
                                ],
                                [
                                    "warehouse_id"       => $transfer->to_warehouse_id,
                                    "transfer_detail_id" => $detail->id,
                                    "product_detail_id"  => $detail->product_detail_id,
                                    "quantity"           => $detail->quantity,
                                    "type"               => "Transfer In",
                                    "created_by"         => Auth::id(),
                                ]
                            );
                        }
                    }

                    $ret = [
                        "success" => true,
                        "message" => "Transfer status changed successfully.",
                    ];
                } else {
                    $ret["message"] = "Transfer not found.";
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    protected function generateReferenceNo()
    {
        $lastData = Transfer::orderBy('created_at', 'desc')->first();

        if ($lastData && $lastData->reference_no) {
            $lastReferenceNoParts = explode('-', $lastData->reference_no);
            $newNumber = str_pad((int) $lastReferenceNoParts[1] + 1, 4, '0', STR_PAD_LEFT);
            $newReferenceNo = date('ym') . '-' . $newNumber;
        } else {
            $newReferenceNo = date('ym') . '-0001';
        }

        return $newReferenceNo;
    }
}
