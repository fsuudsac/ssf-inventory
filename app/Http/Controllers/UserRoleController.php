<?php

namespace App\Http\Controllers;

use App\Models\UserRole;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserRoleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $created_at_format = "DATE_FORMAT(user_roles.created_at, '%m/%d/%Y')";

        $data = UserRole::select([
            "*",
            DB::raw("$created_at_format as created_at_format")
        ])
            ->search([
                'search' => $request->search,
                'fields' => ['role', 'type'],
                'rawFields' => [$created_at_format]
            ])
            ->filter($request) // put your filter logic here
            ->sortable($request)
            ->pagination($request);

        return response()->json([
            'success' => true,
            'data' => $data,
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
        $ret  = [
            "success" => false,
            "message" => "Data not " . ($request->id ? "update" : "saved")
        ];

        $request->validate([
            'type' => [
                'required',
            ],
            'role' => [
                'required',
            ],
        ]);

        $data = [
            "type" => $request->type,
            "role" => $request->role,
        ];

        if ($request->id) {
            $data += [
                "updated_by" => auth()->user()->id
            ];
        } else {
            $data += [
                "created_by" => auth()->user()->id
            ];
        }

        $data = UserRole::updateOrCreate([
            "id" => $request->id,
        ], $data);

        if ($data) {
            $ret  = [
                "success" => true,
                "message" => "Data " . ($request->id ? "updated" : "saved") . " successfully"
            ];
        }

        return response()->json($ret, 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\UserRole  $userRole
     * @return \Illuminate\Http\Response
     */
    public function show(UserRole $userRole)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\UserRole  $userRole
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, UserRole $userRole)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\UserRole  $userRole
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    public function user_role_status(Request $request)
    {
        $ret = [
            'success' => false,
            'message' => 'Failed to update status',
        ];

        $request->validate([
            'id' => 'required|exists:user_roles,id',
            'status' => 'required|in:Active,Inactive',
        ]);

        try {
            DB::transaction(function () use ($request, &$ret) {
                $originalValue = UserRole::withTrashed()->find($request->id);
                $createUpdate = UserRole::withTrashed()->find($request->id);

                if ($createUpdate) {
                    $createUpdate->update([
                        'updated_by' => auth()->user()->id,
                        'deleted_by' => $request->status == 'Inactive' ? auth()->user()->id : null,
                        'deleted_at' => $request->status == 'Inactive' ? now() : null,
                    ]);

                    $changes = $createUpdate->getChanges(); // Get the changes that were made
                    $original = $createUpdate->getOriginal();

                    $historical_data = [
                        [
                            "historicalable_type" => UserRole::class,
                            "historicalable_id" => $createUpdate->id,
                            "subject" => "Users & Permissions / User Roles",
                            "description" => 'User Role ' . $request->role . ' status has been updated',
                            "field_name" => "Status",
                            'old_value' => $originalValue->deleted_at ? 'Inactive' : 'Active',
                            'new_value' => $createUpdate->deleted_at ? 'Inactive' : 'Active',
                            'action' => 'Update',
                            'status' => 'Success',
                        ]
                    ];
                    $this->historical_data($historical_data);

                    $ret = [
                        'success' => true,
                        'message' => 'Status updated successfully',
                        'data' => $createUpdate
                    ];
                }
            });
        } catch (\Throwable $th) {
            //throw $th;
            $ret['message'] = 'An error occurred: ' . $th->getMessage();
        }

        return response()->json($ret, 201);
    }

    public function user_role_order_no(Request $request)
    {
        $ret = [
            'success' => false,
            'message' => 'Failed to update order number',
        ];

        $request->validate([
            'newOrder' => 'required',
        ]);

        try {
            DB::transaction(function () use ($request, &$ret) {
                foreach ($request->newOrder as $key => $value) {
                    UserRole::withTrashed()->where('id', $value['id'])->update(['order_no' => $key]);
                }

                $ret = [
                    'success' => true,
                    'message' => 'Order number updated successfully',
                ];
            });
        } catch (\Throwable $th) {
            //throw $th;
            $ret['message'] = 'An error occurred: ' . $th->getMessage();
        }

        return response()->json($ret, 201);
    }
}
