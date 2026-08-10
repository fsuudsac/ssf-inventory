<?php

namespace App\Http\Controllers;

use App\Models\ProfileAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProfileAddressController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {

        $barangay_name = "(SELECT barangay FROM ref_barangays WHERE ref_barangays.id=profile_addresses.barangay_id AND category='FAMILY ADDRESS')";

        $data = ProfileAddress::select([
            "*",
            DB::raw("$barangay_name barangay_name")
        ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "barangay_name",
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
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->id ? "update" : "create") . " profile address.",
        ];

        $dataValidate = $request->validate([
            "profile_id" => "required",
            "type"       => "required",
            "address"    => "required",
        ]);

        $dataValidate["status"] = $request->status;

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                // If setting as primary (status = 1), unset existing primary of the same type
                if ($request->status == 1) {
                    ProfileAddress::where('profile_id', $request->profile_id)
                        ->where('type', $request->type)
                        ->where('status', 1)
                        ->update(['status' => 0]);
                }

                $originalValue = ProfileAddress::find($request->id);
                $profileAddress = ProfileAddress::updateOrCreate(
                    [
                        "profile_id" => $request->profile_id,
                        "address"    => $request->address,
                        "type"       => $request->type,
                    ],
                    $dataValidate
                );

                if ($profileAddress->wasRecentlyCreated) {
                    $profileAddress->created_by = Auth::id();
                } else {
                    $profileAddress->updated_by = Auth::id();
                }

                $profileAddress->save();

                if ($profileAddress) {
                    $changes = $profileAddress->getChanges();
                    $original = $profileAddress->getOriginal();

                    $this->historical_data_bulk([
                        "model"         => ProfileAddress::class,
                        "originalValue" => $originalValue,
                        "changes"       => $changes,
                        "original"      => $original,
                        "createUpdate"  => $profileAddress,
                        "subject"       => "Profile Address",
                        "module"        => "Profile Address",
                    ]);

                    $ret = [
                        "success" => true,
                        "message" => "Profile address " . ($request->id ? "updated" : "created") . " successfully.",
                        "data"    => ProfileAddress::where('profile_id', $request->profile_id)->get(),
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
     *
     * @param  \App\Models\ProfileAddress  $profileAddress
     * @return \Illuminate\Http\Response
     */
    public function show(ProfileAddress $profileAddress)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\ProfileAddress  $profileAddress
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, ProfileAddress $profileAddress)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ProfileAddress  $profileAddress
     * @return \Illuminate\Http\Response
     */
    public function destroy(ProfileAddress $profileAddress)
    {
        //
    }

    public function profile_address_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " profile address.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $profileAddress = ProfileAddress::withTrashed()->updateOrCreate([
                    "id" => $request->id ?? null,
                ], [
                    "deleted_by" => $request->isTrash ? null : Auth::id(),
                    "deleted_at" => $request->isTrash ? null : now(),
                ]);

                if ($profileAddress) {
                    $historical_data = [
                        [
                            "historicalable_type" => ProfileAddress::class,
                            "historicalable_id" => $profileAddress->id,
                            "subject" => "Profile Address",
                            "module" => "Profile Address",
                            "description" => "Profile Address has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
                            "field_name" => "Status",
                            "old_value" => $request->isTrash ? "Active" : "Archived",
                            "new_value" => !$request->isTrash ? "Active" : "Archived",
                            "action" => "Update",
                            "status" => "Success",
                        ]
                    ];

                    $this->historical_data($historical_data);

                    $ret = [
                        "success" => true,
                        "message" => "Profile Address " . ($request->isTrash ? "restored" : "archived") . " successfully."
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
