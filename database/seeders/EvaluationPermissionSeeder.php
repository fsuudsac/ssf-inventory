<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\ModuleButton;
use App\Models\User;
use App\Models\UserPermission;
use App\Models\UserRole;
use App\Models\UserRolePermission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class EvaluationPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        UserPermission::whereHas("module_button", function ($query) {
            $query->whereHas("module", function ($query) {
                $query->where("system_id", 4);
            });
        })->delete();

        UserRolePermission::whereHas("module_button", function ($query) {
            $query->whereHas("module", function ($query) {
                $query->where("system_id", 4);
            });
        })->delete();

        ModuleButton::whereHas("module", function ($query) {
            $query->where("system_id", 4);
        })->delete();

        Module::where("system_id", 4)->delete();

        // Evaluation
        $evaluationModules = [
            "system_id" => 4,
            "modules" => [
                [
                    "module_name" => "Dashboard",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],

                    ]
                ],

                [
                    "module_name" => "Evaluation",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_add",
                            "mod_button_name" => "Add",
                        ],
                        [
                            "mod_button_code" => "btn_edit",
                            "mod_button_name" => "Edit",
                        ],
                        [
                            "mod_button_code" => "btn_delete",
                            "mod_button_name" => "Delete",
                        ],
                        [
                            "mod_button_code" => "btn_preview",
                            "mod_button_name" => "Preview",
                        ],
                        [
                            "mod_button_code" => "btn_add_category",
                            "mod_button_name" => "Add Category",
                        ],
                        [
                            "mod_button_code" => "btn_edit_category",
                            "mod_button_name" => "Edit Category",
                        ],
                        [
                            "mod_button_code" => "btn_delete_category",
                            "mod_button_name" => "Delete Category",
                        ],
                        [
                            "mod_button_code" => "btn_view_category",
                            "mod_button_name" => "View Category",
                        ],
                        [
                            "mod_button_code" => "btn_status_category",
                            "mod_button_name" => "Category Status",
                        ],
                    ]
                ],

                [
                    "module_name" => "Reports",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                    ]
                ],
                [
                    "module_name" => "Mobile APK",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                    ]
                ],
            ]
        ];

        $systemModule = [
            $evaluationModules
        ];



        foreach ($systemModule as $key => $value) {
            foreach ($value["modules"] as $key2 => $value2) {
                $last_mod_code = "";

                $lastModuleCode = Module::where("system_id", $value["system_id"])->orderBy("id", "desc")->first();

                if ($lastModuleCode) {
                    $code_split = explode("-", $lastModuleCode->module_code);

                    $last_mod_code = "M-" . sprintf("%02d", $code_split[1] + 1);
                } else {
                    $last_mod_code = "M-01";
                }

                $data_mod = Arr::except($value2, ['module_buttons']);
                $data_mod["module_code"] = $last_mod_code;
                $data_mod["system_id"] = $value["system_id"];

                $moduleCreate = Module::create($data_mod);
                if ($moduleCreate) {
                    foreach ($value2['module_buttons'] as $key3 => $value3) {
                        $createModuleButton = ModuleButton::create($value3 + ["module_id" => $moduleCreate->id]);

                        if ($createModuleButton) {
                            $dataUserRoles = UserRole::all();

                            foreach ($dataUserRoles as $key4 => $value4) {
                                if (in_array($value4->id, [3, 5])) {
                                    $includeModule = [
                                        "Dashboard",
                                        "Faculty Monitoring - List",
                                        "Faculty Monitoring - Justification",
                                        "Faculty Monitoring - Absent",
                                        "Faculty Monitoring - Report"
                                    ];

                                    if (in_array($value2['module_name'], $includeModule)) {
                                        UserRolePermission::create([
                                            "user_role_id" => $value4->id,
                                            "mod_button_id" => $createModuleButton->id,
                                            "status" => 1,
                                            "created_by" => 1
                                        ]);
                                    }
                                } else if ($value4->id == 4) {
                                    $includeModule = [
                                        "Dashboard",
                                        "Entrance Exam",
                                        "Applicant Walk-in Schedule",
                                    ];

                                    if (in_array($value2['module_name'], $includeModule)) {
                                        UserRolePermission::create([
                                            "user_role_id" => $value4->id,
                                            "mod_button_id" => $createModuleButton->id,
                                            "status" => 1,
                                            "created_by" => 1
                                        ]);
                                    }
                                } else {
                                    UserRolePermission::create([
                                        "user_role_id" => $value4->id,
                                        "mod_button_id" => $createModuleButton->id,
                                        "status" => 1,
                                        "created_by" => 1
                                    ]);
                                }
                            }

                            $dataUsers = User::all();

                            foreach ($dataUsers as $key4 => $value4) {
                                if (in_array($value4->user_role_id, [3, 4])) {
                                    $includeModule = [
                                        "Dashboard",
                                        "Faculty Monitoring - List",
                                        "Faculty Monitoring - Justification",
                                        "Faculty Monitoring - Absent",
                                        "Faculty Monitoring - Report"
                                    ];

                                    if (in_array($value2['module_name'], $includeModule)) {
                                        UserPermission::create([
                                            "user_id" => $value4->id,
                                            "mod_button_id" => $createModuleButton->id,
                                            "status" => 1,
                                            "created_by" => 1
                                        ]);
                                    }
                                } else  if ($value4->user_role_id == 5) {
                                    $includeModule = [
                                        "Dashboard",
                                        "Entrance Exam",
                                        "Applicant Walk-in Schedule",
                                    ];

                                    if (in_array($value2['module_name'], $includeModule)) {
                                        UserPermission::create([
                                            "user_id" => $value4->id,
                                            "mod_button_id" => $createModuleButton->id,
                                            "status" => 1,
                                            "created_by" => 1
                                        ]);
                                    }
                                } else {
                                    UserPermission::create([
                                        "user_id" => $value4->id,
                                        "mod_button_id" => $createModuleButton->id,
                                        "status" => 1,
                                        "created_by" => 1
                                    ]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
