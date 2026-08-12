<?php

use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/


// Your API routes go here
Route::post('login', [App\Http\Controllers\AuthController::class, 'login']);
Route::post('register', [App\Http\Controllers\AuthController::class, 'register']);
Route::get('purchase_preview/{id}', [App\Http\Controllers\PurchaseController::class, 'purchase_preview']);
Route::get('sales_preview/{id}', [App\Http\Controllers\SalesOrderController::class, 'sales_preview']);
Route::get('sales_return_preview/{id}', [App\Http\Controllers\SalesOrderReturnController::class, 'sales_return_preview']);
Route::get('report_general_pdf', [App\Http\Controllers\SalesOrderController::class, 'report_general_pdf']);
Route::get('report_ledger_supplier_pdf', [App\Http\Controllers\InventoryController::class, 'report_ledger_supplier_pdf']);
Route::get('report_ledger_customer_pdf', [App\Http\Controllers\InventoryController::class, 'report_ledger_customer_pdf']);
Route::get('report_inventory_pdf', [App\Http\Controllers\InventoryController::class, 'report_inventory_pdf']);

Route::middleware('auth:api')->group(function () {
    // Auth
    Route::get('check_auth_status', [App\Http\Controllers\AuthController::class, "check_auth_status"]);

    // Company
    Route::post("company_archived", [App\Http\Controllers\CompanyController::class, "company_archived"]);
    Route::apiResource("company", App\Http\Controllers\CompanyController::class);

    // Credit Term
    Route::post("credit_term_archived", [App\Http\Controllers\CreditTermController::class, "credit_term_archived"]);
    Route::apiResource("credit_term", App\Http\Controllers\CreditTermController::class);

    // Dashboard
    Route::get("dashboard_list", [App\Http\Controllers\DashboardController::class, "dashboard_list"]);
    Route::get("product_sales_and_purchase", [App\Http\Controllers\DashboardController::class, "product_sales_and_purchase"]);

    // Email Template
    Route::post('email_template_multiple', [App\Http\Controllers\EmailTemplateController::class, 'email_template_multiple']);
    Route::apiResource('email_template', App\Http\Controllers\EmailTemplateController::class);

    // EWT Type
    Route::post("ewt_type_archived", [App\Http\Controllers\EwtTypeController::class, "ewt_type_archived"]);
    Route::apiResource("ewt_type", App\Http\Controllers\EwtTypeController::class);

    // Graph
    Route::apiResource("graph_sales_and_inventory", App\Http\Controllers\Graph\GraphSalesAndInventoryController::class);
    Route::apiResource("graph_product", App\Http\Controllers\Graph\GraphProductController::class);
    Route::get("graph_revenue", [App\Http\Controllers\Graph\RevenueController::class, "graph_revenue"]);

    // Historical Data
    Route::apiResource("historical_data", App\Http\Controllers\HistoricalDataController::class);

    // Inventory
    Route::get('product_inventory', [App\Http\Controllers\InventoryController::class, 'product_inventory']);
    Route::apiResource("inventory", App\Http\Controllers\InventoryController::class);

    // Module
    Route::apiResource('module', App\Http\Controllers\ModuleController::class);

    // Notification
    Route::apiResource("user_notifications", App\Http\Controllers\NotificationUserController::class);
    Route::post("update_notification", [App\Http\Controllers\NotificationUserController::class, "update_notification"]);

    // Profile Address
    Route::apiResource('profile_address', App\Http\Controllers\ProfileAddressController::class);

    // School Year
    Route::apiResource("school_year", App\Http\Controllers\RefSchoolYearController::class);

    // Transfer
    Route::post("transfer_multi_archived", [App\Http\Controllers\TransferController::class, "transfer_multi_archived"]);
    Route::post("transfer_change_status", [App\Http\Controllers\TransferController::class, "transfer_change_status"]);
    Route::apiResource("transfers", App\Http\Controllers\TransferController::class);

    // Video FAQ
    Route::post("video_faq_info", [App\Http\Controllers\VideoFaqController::class, 'video_faq_info']);
    Route::apiResource("video_faq", App\Http\Controllers\VideoFaqController::class);

    // Warehouse
    Route::post('warehouse_change_status', [App\Http\Controllers\WarehouseController::class, "warehouse_change_status"]);
    Route::post('multiple_archived_warehouse', [App\Http\Controllers\WarehouseController::class, "multiple_archived_warehouse"]);
    Route::apiResource('warehouse', App\Http\Controllers\WarehouseController::class);
});

// User
Route::middleware('auth:api')->group(function () {
    // User
    Route::get('users_supplier_company', [App\Http\Controllers\UserController::class, "users_supplier_company"]);
    Route::get('users_supplier', [App\Http\Controllers\UserController::class, "users_supplier"]);
    Route::get('users_customer', [App\Http\Controllers\UserController::class, "users_customer"]);
    Route::get('user_profile_info', [App\Http\Controllers\UserController::class, "user_profile_info"]);
    Route::get('existing_username', [App\Http\Controllers\UserController::class, "existing_username"]);

    Route::post('upload_suppliers', [App\Http\Controllers\UserController::class, 'upload_suppliers']);
    Route::post('supplier', [App\Http\Controllers\UserController::class, 'supplier']);
    Route::post('customer', [App\Http\Controllers\UserController::class, 'customer']);
    Route::post('upload_customers', [App\Http\Controllers\UserController::class, 'upload_customers']);

    Route::post('multiple_archived_supplier', [App\Http\Controllers\UserController::class, "multiple_archived_supplier"]);
    Route::post('multiple_archived_customer', [App\Http\Controllers\UserController::class, "multiple_archived_customer"]);

    Route::post('user_profile_info_update', [App\Http\Controllers\UserController::class, "user_profile_info_update"]);
    Route::post('user_update_role', [App\Http\Controllers\UserController::class, "user_update_role"]);
    Route::post('user_archived', [App\Http\Controllers\UserController::class, "user_archived"]);
    Route::post('users_update_email', [App\Http\Controllers\UserController::class, "users_update_email"]);
    Route::post('users_update_password', [App\Http\Controllers\UserController::class, "users_update_password"]);
    Route::post('users_info_update_password', [App\Http\Controllers\UserController::class, "users_info_update_password"]);
    Route::post('user_upload_signature', [App\Http\Controllers\UserController::class, "user_upload_signature"]);
    Route::post('user_profile_picture', [App\Http\Controllers\UserController::class, "user_profile_picture"]);
    Route::apiResource('users', App\Http\Controllers\UserController::class);

    // User Permission
    Route::post('user_permission_status', [App\Http\Controllers\UserPermissionController::class, 'user_permission_status']);
    Route::apiResource('user_permission', App\Http\Controllers\UserPermissionController::class);

    // User Role Permission
    Route::apiResource('user_role_permission', App\Http\Controllers\UserRolePermissionController::class);

    // User Payment
    Route::apiResource('user_payment', App\Http\Controllers\UserPaymentController::class);
});
// END User

// Sales
Route::middleware('auth:api')->group(function () {
    // Sales
    Route::post('sales_archived', [App\Http\Controllers\SalesOrderController::class, 'sales_archived']);
    Route::get('revenue_snap_shot', [App\Http\Controllers\SalesOrderController::class, 'revenue_snap_shot']);
    Route::post('sales_order_info', [App\Http\Controllers\SalesOrderController::class, 'sales_order_info']);
    Route::get('report_ledger_customer', [App\Http\Controllers\SalesOrderController::class, 'report_ledger_customer']);
    Route::get('sales_user_payments', [App\Http\Controllers\SalesOrderController::class, 'sales_user_payments']);
    Route::post('multiple_archived_sales', [App\Http\Controllers\SalesOrderController::class, "multiple_archived_sales"]);
    Route::post('sales_order_no', [App\Http\Controllers\SalesOrderController::class, 'sales_order_no']);
    Route::apiResource('sales', App\Http\Controllers\SalesOrderController::class);

    // Sales Order Details
    Route::post("sale_detail_delete", [App\Http\Controllers\SalesOrderDetailController::class, "sale_detail_delete"]);
    Route::post("sales_order_detail_archived", [App\Http\Controllers\SalesOrderDetailController::class, "sales_order_detail_archived"]);
    Route::apiResource('sales_order_details', App\Http\Controllers\SalesOrderDetailController::class);

    // Sales Order Warranty
    Route::post("sales_order_warranty_archived", [App\Http\Controllers\SalesOrderWarrantyController::class, "sales_order_warranty_archived"]);
    Route::post("sales_order_warranty_delete", [App\Http\Controllers\SalesOrderWarrantyController::class, "sales_order_warranty_delete"]);
    Route::apiResource('sales_order_warranty', App\Http\Controllers\SalesOrderWarrantyController::class);

    // Sales Order Return
    Route::post("sales_return_archived", [App\Http\Controllers\SalesOrderReturnController::class, 'sales_return_archived']);
    Route::apiResource("sales_order_return", App\Http\Controllers\SalesOrderReturnController::class);
});
// END Sales

// Product
Route::middleware('auth:api')->group(function () {
    // Product
    Route::get("product_generate_qr_code", [App\Http\Controllers\ProductController::class, "product_generate_qr_code"]);
    Route::get("product_graph", [App\Http\Controllers\ProductController::class, "product_graph"]);
    Route::get("product_info", [App\Http\Controllers\ProductController::class, "product_info"]);
    Route::post('upload_products', [App\Http\Controllers\ProductController::class, 'upload_products']);
    Route::post("product_archived", [App\Http\Controllers\ProductController::class, "product_archived"]);
    Route::post("product_attachment", [App\Http\Controllers\ProductController::class, "product_attachment"]);
    Route::delete("product_attachment/{id}", [App\Http\Controllers\ProductController::class, "product_attachment_delete"]);
    Route::apiResource("products", App\Http\Controllers\ProductController::class);

    // Product Detail Prices
    Route::post("product_detail_price_archived", [App\Http\Controllers\ProductDetailPriceController::class, "product_detail_price_archived"]);
    Route::apiResource("product_detail_prices", App\Http\Controllers\ProductDetailPriceController::class);

    // Product Details
    Route::post("product_detail_delete", [App\Http\Controllers\ProductDetailController::class, "product_detail_delete"]);
    Route::post("product_detail_preview", [App\Http\Controllers\ProductDetailController::class, "product_detail_preview"]);
    Route::get("product_detail_generate_qr_code", [App\Http\Controllers\ProductDetailController::class, 'product_detail_generate_qr_code']);
    Route::apiResource("product_details", App\Http\Controllers\ProductDetailController::class);

    // Product Category
    Route::post("product_category_archived", [App\Http\Controllers\ProductCategoryController::class, "product_category_archived"]);
    Route::apiResource("product_category", App\Http\Controllers\ProductCategoryController::class);

    // Product Type
    Route::post("product_type_archived", [App\Http\Controllers\ProductTypeController::class, "product_type_archived"]);
    Route::apiResource("product_type", App\Http\Controllers\ProductTypeController::class);

    // Product Size
    Route::post("product_size_archived", [App\Http\Controllers\ProductSizeController::class, "product_size_archived"]);
    Route::apiResource("product_size", App\Http\Controllers\ProductSizeController::class);
});
// END Product

// Purchase
Route::middleware('auth:api')->group(function () {
    // Purchase
    Route::post('purchase_info', [App\Http\Controllers\PurchaseController::class, 'purchase_info']);
    Route::post('purchase_archived', [App\Http\Controllers\PurchaseController::class, 'purchase_archived']);
    Route::get('report_ledger_supplier', [App\Http\Controllers\PurchaseController::class, 'report_ledger_supplier']);
    Route::apiResource('purchases', App\Http\Controllers\PurchaseController::class);

    // Purchase Details
    Route::post("purchase_detail_delete", [App\Http\Controllers\PurchaseDetailController::class, "purchase_detail_delete"]);

    // Purchase Return
    Route::post("purchase_return_archived", [App\Http\Controllers\PurchaseReturnController::class, 'purchase_return_archived']);
    Route::apiResource("purchase_return", App\Http\Controllers\PurchaseReturnController::class);
});
// END Purchase

// Department
Route::middleware('auth:api')->group(function () {
    // Department
    Route::post('department_archived', [\App\Http\Controllers\RefDepartmentController::class, 'department_archived']);
    Route::get('department_dropdown', [\App\Http\Controllers\RefDepartmentController::class, 'department_dropdown']);
    Route::get('get_department_dropdown', [\App\Http\Controllers\RefDepartmentController::class, 'get_department_dropdown']);
    Route::apiResource('department', \App\Http\Controllers\RefDepartmentController::class);

    // Department Type
    Route::post('department_type_archived', [\App\Http\Controllers\RefDepartmentTypeController::class, 'department_type_archived']);
    Route::apiResource('department_type', \App\Http\Controllers\RefDepartmentTypeController::class);

    // Department Allocation
    Route::apiResource('department_allocation', \App\Http\Controllers\RefDepartmentAllocationController::class);
});
// END Department