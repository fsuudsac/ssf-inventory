<?php

namespace App\Http\Controllers;

use App\Models\HistoricalData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HistoricalDataController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $created_at_format = "DATE_FORMAT(historical_data.created_at, '%M %d, %Y %r')";
        $created_by = "(SELECT " . $this->fullname . " fullname FROM profiles WHERE profiles.user_id = historical_data.created_by ORDER BY profiles.id DESC LIMIT 1)";

        $data = HistoricalData::select([
            'historical_data.*',
            DB::raw("{$created_by} AS created_by_name"),
            DB::raw("{$created_at_format} AS created_at_format"),
        ])
            ->search([
                'search' => $request->search,
                'fields' => [
                    'subject',
                    'description',
                    'field_name',
                    'old_value',
                    'new_value',
                    'action',
                    'module',
                    'status',
                ],
                'rawFields' => [
                    $created_by,
                    $created_at_format,
                ],
            ])
            ->filter($request)
            ->sortable($request)
            ->pagination($request);

        return response()->json([
            'success' => true,
            'data' => $data,
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
    public function show(HistoricalData $historicalData)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, HistoricalData $historicalData)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HistoricalData $historicalData)
    {
        //
    }
}
