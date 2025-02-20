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

class ModuleAndRolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Module::truncate();
        ModuleButton::truncate();
        UserPermission::truncate();
        UserRolePermission::truncate();

        // Fsuu Opis
        $opisModules = [
            "system_id" => 1,
            "modules" => [
                [
                    "module_name" => "Dashboard",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ]
                    ]
                ],
                [
                    "module_name" => "Schedule Scheduling",
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
                            "mod_button_code" => "btn_view",
                            "mod_button_name" => "Preview",
                        ],
                        [
                            "mod_button_code" => "btn_delete",
                            "mod_button_name" => "Delete",
                        ]
                    ]
                ],
                [
                    "module_name" => "Schedule Day Time",
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
                            "mod_button_code" => "btn_view",
                            "mod_button_name" => "Preview",
                        ],
                        [
                            "mod_button_code" => "btn_delete",
                            "mod_button_name" => "Delete",
                        ]
                    ]
                ],
                [
                    "module_name" => "Faculty Schedule",
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
                            "mod_button_code" => "btn_view",
                            "mod_button_name" => "Preview",
                        ],
                        [
                            "mod_button_code" => "btn_delete",
                            "mod_button_name" => "Delete",
                        ]
                    ]
                ],
                [
                    "module_name" => "Student Schedule",
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
                            "mod_button_code" => "btn_view",
                            "mod_button_name" => "Preview",
                        ],
                        [
                            "mod_button_code" => "btn_delete",
                            "mod_button_name" => "Delete",
                        ]
                    ]
                ],
                [
                    "module_name" => "Employee Full-time",
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
                            "mod_button_code" => "btn_view",
                            "mod_button_name" => "Preview",
                        ],
                        [
                            "mod_button_code" => "btn_delete",
                            "mod_button_name" => "Delete",
                        ]
                    ]
                ],
                [
                    "module_name" => "Employee Part-time",
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
                            "mod_button_code" => "btn_view",
                            "mod_button_name" => "Preview",
                        ],
                        [
                            "mod_button_code" => "btn_delete",
                            "mod_button_name" => "Delete",
                        ]
                    ]
                ],
                [
                    "module_name" => "Employee Archived",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_edit",
                            "mod_button_name" => "Edit",
                        ],
                        [
                            "mod_button_code" => "btn_view",
                            "mod_button_name" => "Preview",
                        ],
                        [
                            "mod_button_code" => "btn_delete",
                            "mod_button_name" => "Delete",
                        ]
                    ]
                ],
                [
                    "module_name" => "Student Current",
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
                            "mod_button_code" => "btn_view",
                            "mod_button_name" => "Preview",
                        ],
                        [
                            "mod_button_code" => "btn_delete",
                            "mod_button_name" => "Delete",
                        ]
                    ]
                ],
                [
                    "module_name" => "Student Archived",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_edit",
                            "mod_button_name" => "Edit",
                        ],
                        [
                            "mod_button_code" => "btn_view",
                            "mod_button_name" => "Preview",
                        ],
                        [
                            "mod_button_code" => "btn_delete",
                            "mod_button_name" => "Delete",
                        ]
                    ]
                ],
                [
                    "module_name" => "User Current",
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
                            "mod_button_code" => "btn_edit_permission",
                            "mod_button_name" => "Permission",
                        ],
                    ]
                ],
                [
                    "module_name" => "User Archived",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_edit",
                            "mod_button_name" => "Edit",
                        ],
                        [
                            "mod_button_code" => "btn_delete",
                            "mod_button_name" => "Delete",
                        ],
                    ]
                ],
                [
                    "module_name" => "Profile",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_edit",
                            "mod_button_name" => "Edit",
                        ],
                    ]
                ],
            ]
        ];

        // Faculty Monitoring
        $facultyMonitoringModules = [
            "system_id" => 2,
            "modules" => [
                [
                    "module_name" => "Dashboard",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ]
                    ]
                ],
                [
                    "module_name" => "Faculty Monitoring - List",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_edit",
                            "mod_button_name" => "Edit",
                        ],
                        [
                            "mod_button_code" => "btn_upload_excel",
                            "mod_button_name" => "Upload Excel",
                        ],
                        [
                            "mod_button_code" => "btn_active_archive",
                            "mod_button_name" => "Archived",
                        ],
                    ]
                ],
                [
                    "module_name" => "Faculty Monitoring - Justification",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_edit",
                            "mod_button_name" => "Edit",
                        ],
                        [
                            "mod_button_code" => "btn_preview",
                            "mod_button_name" => "Preview",
                        ],
                        [
                            "mod_button_code" => "btn_print",
                            "mod_button_name" => "Print",
                        ],
                    ]
                ],
                [
                    "module_name" => "Faculty Monitoring - Deduction",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_deduction",
                            "mod_button_name" => "Deduction",
                        ],
                        [
                            "mod_button_code" => "btn_print",
                            "mod_button_name" => "Print",
                        ],
                    ]
                ],
                [
                    "module_name" => "Faculty Monitoring - Absents",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_preview",
                            "mod_button_name" => "Preview",
                        ],
                        [
                            "mod_button_code" => "btn_print",
                            "mod_button_name" => "Print",
                        ],
                    ]
                ],
                [
                    "module_name" => "Faculty Monitoring - Presents",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_preview",
                            "mod_button_name" => "Preview",
                        ],
                        [
                            "mod_button_code" => "btn_print",
                            "mod_button_name" => "Print",
                        ],
                    ]
                ],
                [
                    "module_name" => "Faculty Monitoring - Reports",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                    ]
                ],
                [
                    "module_name" => "Grade Submission - List",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                    ]
                ],
                [
                    "module_name" => "Grade Submission - Approval",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                    ]
                ],
                [
                    "module_name" => "Grade Submission - Approved",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                    ]
                ],
                [
                    "module_name" => "Grade Submission - Reports",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                    ]
                ],
                [
                    "module_name" => "Admin Settings",
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
                            "mod_button_code" => "btn_active_archive",
                            "mod_button_name" => "Archived",
                        ],
                    ]
                ],
                [
                    "module_name" => "Email Template",
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
                    ]
                ],
            ]
        ];

        // Guidance
        $guidanceModules = [
            "system_id" => 3,
            "modules" => [
                [
                    "module_name" => "Dashboard",
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
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],

                    ]
                ],

                [
                    "module_name" => "Entrance Exam",
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
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],

                    ]
                ],

                // Guidance - Walk-In
                [
                    "module_name" => "Applicant Walk-in Schedule",
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
                    ]
                ],
                [
                    "module_name" => "Applicant Walk-in View List",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],
                        [
                            "mod_button_code" => "btn_back",
                            "mod_button_name" => "Back",
                        ],
                    ]
                ],
                [
                    "module_name" => "Applicant Walk-In Add",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],
                    ]
                ],
                [
                    "module_name" => "Applicant Walk-In Edit",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],
                    ]
                ],

                //Guidance - Online
                [
                    "module_name" => "Applicant Online Schedule",
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
                    ]
                ],
                [
                    "module_name" => "Applicant Online View List",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],
                        [
                            "mod_button_code" => "btn_back",
                            "mod_button_name" => "Back",
                        ],
                    ]
                ],
                [
                    "module_name" => "Applicant Online Add",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],
                    ]
                ],
                [
                    "module_name" => "Applicant Online Edit",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],
                    ]
                ],

                // Guidance Archived
                [
                    "module_name" => "Applicant Archived View",
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
                    ]
                ],
                [
                    "module_name" => "Applicant Archived List",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],
                        [
                            "mod_button_code" => "btn_back",
                            "mod_button_name" => "Back",
                        ],
                    ]
                ],

                // Guidance Report
                [
                    "module_name" => "Reports",
                    "description" => "",
                    "module_buttons" => [
                        [
                            "mod_button_code" => "view_page",
                            "mod_button_name" => "View Page",
                        ],
                        [
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],
                    ]
                ],

                // Guidance Admin Settings
                [
                    "module_name" => "Admin Settings",
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
                            "mod_button_code" => "btn_active_archive",
                            "mod_button_name" => "Active Archived",
                        ],
                        [
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],
                    ]
                ],

                // Guidance Email Template
                [
                    "module_name" => "Email Template",
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
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],
                    ]
                ],

                // Guidance Profiling Portal
                [
                    "module_name" => "Profiling Portal",
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
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],
                    ]
                ],

                // Guidance Profiling Validate
                [
                    "module_name" => "Profiling Validate",
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
                            "mod_button_code" => "btn_active_archive",
                            "mod_button_name" => "Active Archived",
                        ],
                        [
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],
                    ]
                ],
            ]
        ];


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
                            "mod_button_code" => "btn_preview",
                            "mod_button_name" => "Preview",
                        ],
                        [
                            "mod_button_code" => "btn_delete",
                            "mod_button_name" => "Delete",
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

        // ECOM
        $ecomModules = [
            "system_id" => 5,
            "modules" => [
                [
                    "module_name" => "Dashboard",
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
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],

                    ]
                ],
                [
                    "module_name" => "Mailbox",
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
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],

                    ]
                ],
                [
                    "module_name" => "Report",
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
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],

                    ]
                ],
                [
                    "module_name" => "System Settings",
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
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],

                    ]
                ],
                [
                    "module_name" => "Failed Sent Emails",
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
                            "mod_button_code" => "btn_submit",
                            "mod_button_name" => "Submit",
                        ],

                    ]
                ],

            ]
        ];


        $systemModule = [
            $opisModules,
            $facultyMonitoringModules,
            $guidanceModules,
            $evaluationModules,
            $ecomModules
        ];

        // dd($systemModule);

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