<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $data = Company::select([
            "*",
        ])
            ->search([
                "search" => $request->search,
                "fields" => [],
                "rawFields" => [],
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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " company.",
        ];

        $dataValidate = $request->validate([
            "company" => [
                "required",
                Rule::unique("companies")->ignore($request->id),
            ],
        ]);

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                $originalValue = Company::find($request->id);
                $company = Company::updateOrCreate([
                    "id" => $request->id ?? null,
                ], $dataValidate);

                if ($company) {
                    $changes = $company->getChanges();
                    $original = $company->getOriginal();

                    $this->historical_data_bulk([
                        "model" => Company::class,
                        "originalValue" => $originalValue,
                        "changes" => $changes,
                        "original" => $original,
                        "createUpdate" => $company,
                        "subject" => "Company",
                        "module" => "Company",
                    ]);

                    $ret = [
                        "success" => true,
                        "message" => "Company " . ($request->id ? "updated" : "created") . " successfully.",
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
    public function show(Company $company)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Company $company)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Company $company)
    {
        //
    }

    public function company_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->isTrash ? "restore" : "archive") . " company.",
        ];

        try {
            DB::transaction(function () use ($request, &$ret) {
                $company = Company::withTrashed()->updateOrCreate([
                    "id" => $request->id ?? null,
                ], [
                    "deleted_by" => $request->isTrash ? null : Auth::id(),
                    "deleted_at" => $request->isTrash ? null : now(),
                ]);

                if ($company) {
                    $historical_data = [
                        [
                            "historicalable_type" => Company::class,
                            "historicalable_id" => $company->id,
                            "subject" => "Company",
                            "module" => "Company",
                            "description" => "Company has been " . ($request->isTrash ? "restored" : "archived") . " by " . $this->authFullname(),
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
                        "message" => "Company " . ($request->isTrash ? "restored" : "archived") . " successfully."
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }
}
