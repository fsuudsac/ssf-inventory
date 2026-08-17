<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\ModuleButton;
use App\Models\User;
use App\Models\UserPermission;
use App\Models\UserRolePermission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class ModuleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dataModules = [
            [
                "module_code" => "page_dashboard",
                "module_name" => "Dashboard",
                "description" => "",
                "system_id" => 12,
                "module_buttons" => [
                    [
                        "mod_button_code" => "view_page",
                        "mod_button_name" => "View Page",
                    ]
                ]
            ],
            [
                "module_code" => "page_budget_allocation",
                "module_name" => "Budget Allocation",
                "description" => "",
                "system_id" => 12,
                "module_buttons" => [
                    [
                        "mod_button_code" => "view_page",
                        "mod_button_name" => "View Page",
                    ],
                    [
                        "mod_button_code" => "btn_view",
                        "mod_button_name" => "View",
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
                        "mod_button_code" => "btn_sweep",
                        "mod_button_name" => "Sweep Budget",
                    ]
                ]
            ],
            [
                "module_code" => "page_purchase",
                "module_name" => "Purchase Order",
                "description" => "",
                "system_id" => 12,
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
                        "mod_button_code" => "btn_payment",
                        "mod_button_name" => "Payment",
                    ],
                    [
                        "mod_button_code" => "btn_view",
                        "mod_button_name" => "View",
                    ],
                ]
            ],
            [
                "module_code" => "page_sales",
                "module_name" => "Release Item",
                "description" => "",
                "system_id" => 12,
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
                        "mod_button_code" => "btn_payment",
                        "mod_button_name" => "Payment",
                    ],
                    [
                        "mod_button_code" => "btn_view",
                        "mod_button_name" => "View",
                    ],
                ]
            ],
            [
                "module_code" => "page_product",
                "module_name" => "Product",
                "description" => "",
                "system_id" => 12,
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
                ]
            ],
            [
                "module_code" => "page_inventory",
                "module_name" => "Inventory",
                "description" => "",
                "system_id" => 12,
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
                ]
            ],
            [
                "module_code" => "page_warehouse",
                "module_name" => "Warehouse",
                "description" => "",
                "system_id" => 12,
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
                        "mod_button_code" => "btn_status",
                        "mod_button_name" => "Status",
                    ],
                ]
            ],
            [
                "module_code" => "page_transfer",
                "module_name" => "Transfer",
                "description" => "",
                "system_id" => 12,
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
                ]
            ],
            [
                "module_code" => "page_reports",
                "module_name" => "Reports",
                "description" => "",
                "system_id" => 12,
                "module_buttons" => [
                    [
                        "mod_button_code" => "view_page",
                        "mod_button_name" => "View Page",
                    ],
                ]
            ],
            [
                "module_code" => "page_suppliers",
                "module_name" => "Suppliers",
                "description" => "",
                "system_id" => 12,
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
                        "mod_button_code" => "btn_import",
                        "mod_button_name" => "Import",
                    ],
                ]
            ],
            [
                "module_code" => "page_customers",
                "module_name" => "Customers",
                "description" => "",
                "system_id" => 12,
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
                        "mod_button_code" => "btn_import",
                        "mod_button_name" => "Import",
                    ],
                ]
            ],
            [
                "module_code" => "page_users",
                "module_name" => "Users",
                "description" => "",
                "system_id" => 12,
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
                        "mod_button_name" => "Edit Permission",
                    ],
                ],
            ],
            [
                "module_code" => "page_admin_setting",
                "module_name" => "Admin Settings",
                "description" => "",
                "system_id" => 12,
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
                ]
            ],
            [
                "module_code" => "page_user_permissions",
                "module_name" => "User Permissions",
                "description" => "",
                "system_id" => 12,
                "module_buttons" => [
                    [
                        "mod_button_code" => "view_page",
                        "mod_button_name" => "View Page",
                    ],
                ]
            ],
            [
                "module_code" => "page_video_faq",
                "module_name" => "Video FAQ",
                "description" => "",
                "system_id" => 12,
                "module_buttons" => [
                    [
                        "mod_button_code" => "view_page",
                        "mod_button_name" => "View Page",
                    ],
                ]
            ],
        ];

        Module::truncate();
        ModuleButton::truncate();
        UserRolePermission::truncate();
        UserPermission::truncate();

        foreach ($dataModules as $module_key => $module) {
            $data_mod = Arr::except($module, ['module_buttons']);

            $moduleCreate = Module::create($data_mod);
            if ($moduleCreate) {
                foreach ($module['module_buttons'] as $module_button_key => $module_button) {
                    $createModuleButton = ModuleButton::create($module_button + ["module_id" => $moduleCreate->id]);

                    if ($createModuleButton) {
                        $dataUserRoles = [1, 2, 3];

                        foreach ($dataUserRoles as $role_key => $role) {
                            UserRolePermission::create([
                                "user_role_id" => $role,
                                "mod_button_id" => $createModuleButton->id,
                                "status" => 1,
                                "created_by" => 1
                            ]);
                        }

                        $dataUsers = User::whereNotIn('user_role_id', ['Supplier', 'Customer'])->get();

                        foreach ($dataUsers as $user_key => $user) {
                            UserPermission::create([
                                "user_id" => $user->id,
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
