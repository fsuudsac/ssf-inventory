<?php

namespace App\Http\Controllers;

use App\Models\RefAllocationType;
use Illuminate\Http\Request;

class RefAllocationTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $data = RefAllocationType::select([
            "*",
        ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "allocation_type",
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
    public function show(RefAllocationType $refAllocationType)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RefAllocationType $refAllocationType)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RefAllocationType $refAllocationType)
    {
        //
    }
}
