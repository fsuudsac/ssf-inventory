<?php

namespace App\Http\Controllers;

use App\Models\CreditTerm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CreditTermController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $date_formatted = "DATE_FORMAT(credit_terms.created_at, '%m/%d/%Y')";

        $data = CreditTerm::select([
            "*",
            DB::raw("$date_formatted data_formatted")
        ])
            ->search([
                "search" => $request->search,
                "fields" => [
                    "credit_term",
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
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->id ? "update" : "create") . " credit term.",
        ];

        $dataValidate = $request->validate([
            "credit_term" => [
                "required",
                Rule::unique("credit_terms")->ignore($request->id),
            ],
        ]);

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                $originalValue = CreditTerm::find($request->id);
                $creditTerm = CreditTerm::updateOrCreate([
                    "id" => $request->id ?? null,
                ], $dataValidate);

                if ($creditTerm) {
                    $changes = $creditTerm->getChanges();
                    $original = $creditTerm->getOriginal();

                    $this->historical_data_bulk([
                        "model" => CreditTerm::class,
                        "originalValue" => $originalValue,
                        "changes" => $changes,
                        "original" => $original,
                        "createUpdate" => $creditTerm,
                        "subject" => "Credit Term",
                        "module" => "Credit Term",
                    ]);

                    $ret = [
                        "success" => true,
                        "message" => "Credit term " . ($request->id ? "updated" : "created") . " successfully.",
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
    public function show(CreditTerm $creditTerm)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CreditTerm $creditTerm)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CreditTerm $creditTerm)
    {
        //
    }

    public function credit_term_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " credit term.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                // Loop over ids to support bulk archive/restore
                $creditTerms = CreditTerm::withTrashed()->whereIn("id", $request->ids)->get();

                foreach ($creditTerms as $creditTerm) {
                    $creditTerm->fill([
                        "deleted_by" => $request->isTrash ? null : Auth::id(),
                        "deleted_at" => $request->isTrash ? null : now(),
                        "updated_by" => $request->isTrash ? Auth::id() : null,
                    ])->save();

                    $historical_data = [
                        [
                            "historicalable_type" => CreditTerm::class,
                            "historicalable_id"   => $creditTerm->id,
                            "subject"             => "Credit Term",
                            "module"              => "Credit Term",
                            "description"         => "Credit term has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                    "message" => "Credit term " . ($request->isTrash ? "restored" : "archived") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
