<?php

namespace App\Http\Controllers;

use App\Models\VideoFaq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VideoFaqController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $date_formatted = "DATE_FORMAT(video_faqs.created_at, '%m/%d/%Y')";

        $data = VideoFaq::select([
            "*",
            DB::raw("$date_formatted date_formatted")
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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " video FAQ.",
        ];

        $dataValidate = $request->validate([
            "title"       => "required|unique:video_faqs,title," . $request->id,
            "file_path"   => "required|url",
            "module_name" => "required",
        ]);

        $dataValidate["description"] = $request->description;

        try {
            DB::transaction(function () use ($request, &$ret, $dataValidate) {
                if ($request->id) {
                    $dataValidate["updated_by"] = Auth::id();
                } else {
                    $dataValidate["created_by"] = Auth::id();
                }

                $originalValue = VideoFaq::find($request->id);
                $videoFaq = VideoFaq::updateOrCreate(
                    ["id" => $request->id ?? null],
                    $dataValidate
                );

                if ($videoFaq) {
                    $changes = $videoFaq->getChanges();
                    $original = $videoFaq->getOriginal();

                    $this->historical_data_bulk([
                        "model"         => VideoFaq::class,
                        "originalValue" => $originalValue,
                        "changes"       => $changes,
                        "original"      => $original,
                        "createUpdate"  => $videoFaq,
                        "subject"       => "Video FAQ",
                        "module"        => "Video FAQ",
                    ]);

                    $ret = [
                        "success" => true,
                        "message" => "Video FAQ " . ($request->id ? "updated" : "created") . " successfully.",
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
    public function show(VideoFaq $videoFaq)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, VideoFaq $videoFaq)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(VideoFaq $videoFaq)
    {
        //
    }

    public function video_faq_info(Request $request)
    {
        $data = VideoFaq::where("module_name", $request->module_name)->first();

        return response()->json([
            "success" => true,
            "data"    => $data,
        ], 200);
    }
}
