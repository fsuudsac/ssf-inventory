<?php

namespace App\Http\Controllers;

use App\Models\NotificationUser;
use Illuminate\Http\Request;

class NotificationUserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $data = NotificationUser::where("user_id", $request->user_id)
            ->with([
                "notification",
            ])
            ->orderBy("created_at", "desc")
            ->get();

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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function update_notification(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Notification not found",
        ];

        $find = NotificationUser::find($request->id);

        if ($find) {
            $find->update([
                "read" => 1,
            ]);

            $ret = [
                "success" => true,
                "message" => "Notification updated",
            ];
        }

        return response()->json($ret, 200);
    }
}
