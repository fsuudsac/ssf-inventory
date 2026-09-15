<?php

namespace App\Http\Controllers;

use App\Models\RefSchoolYear;
use Illuminate\Http\Request;

class RefSchoolYearController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $data = RefSchoolYear::select([
            "*",
        ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "sy_from",
                    "sy_to",
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
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(RefSchoolYear $refSchoolYear)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RefSchoolYear $refSchoolYear)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RefSchoolYear $refSchoolYear)
    {
        //
    }
}
