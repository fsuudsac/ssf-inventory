import { Routes, Route } from "react-router-dom";
import {
    faBoxOpen,
    faChartMixedUpCircleDollar,
    faHome,
    faListCheck,
    faUserGroup,
    faUsers,
    faWarehouseFull,
    faChartLine,
    faCogs,
    faVideo,
    faRightLeftLarge,
    faUserShield,
    faMoneyBillWave,
} from "@fortawesome/pro-regular-svg-icons";

import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

import Page404 from "../views/errors/Page404";
import PageRequestPermission from "../views/errors/PageRequestPermission";

import PageLogin from "../views/public/PageLogin/PageLogin";

import PageEditProfile from "../views/private/PageEditProfile/PageEditProfile";
import PageDashboard from "../views/private/PageDashboard/PageDashboard";
import PageUser from "../views/private/PageUser/PageUser";
import PageUserForm from "../views/private/PageUser/PageUserForm";
import PageUserPermission from "../views/private/PageUser/PageUserPermission";
import PageWarehouse from "../views/private/PageWarehouse/PageWarehouse";
import PageInventory from "../views/private/PageInventory/PageInventory";
import PagePurchase from "../views/private/PagePurchase/PagePurchase";
import PagePurchaseForm from "../views/private/PagePurchase/PagePurchaseForm";
import PageAdminSetting from "../views/private/PageAdminSetting/PageAdminSetting";
import PageSalesForm from "../views/private/PageSales/PageSalesForm";
import PageSales from "../views/private/PageSales/PageSales";
import PageProductForm from "../views/private/PageProduct/PageProductForm";
import PageProduct from "../views/private/PageProduct/PageProduct";
import PageReportLedger from "../views/private/PageReport/PageReportLedger";
import PageReportInventory from "../views/private/PageReport/PageReportInventory";
import PagePurchaseView from "../views/private/PagePurchase/PagePurchaseView";
import PageSalesView from "../views/private/PageSales/PageSalesView";
import PageSalesReturnForm from "../views/private/PageSales/PageSalesReturnForm";
import PagePurchaseReturnForm from "../views/private/PagePurchase/PagePurchaseReturnForm";
import PageVideoFaqs from "../views/private/PageVideoFaqs/PageVideoFaqs";
import PageTransfer from "../views/private/PageTransfer/PageTransfer";
import PageUserPermissions from "../views/private/PageUserPermissions/PageUserPermissions";
import PageReportSalesRevenue from "../views/private/PageReport/PageReportSalesRevenue/PageReportSalesRevenue";
import PageReport from "../views/private/PageReport/PageReport";
import PageBudgetAllocation from "../views/Private/PageBudgetAllocation/PageBudgetAllocation";

export default function RouteList() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <PublicRoute
                        title="LOGIN"
                        pageId="PageLogin"
                        component={PageLogin}
                    />
                }
            />

            {/* <Route
                path="/register"
                element={
                    <PublicRoute
                        title="REGISTER"
                        pageId="PageRegister"
                        component={PageRegister}
                    />
                }
            /> */}

            <Route
                path="/edit-profile"
                element={
                    <PrivateRoute
                        moduleName="Edit Profile"
                        title="User"
                        subtitle="VIEW / EDIT"
                        pageId="PageUserProfile"
                        pageHeaderIcon={faUsers}
                        breadcrumb={[
                            {
                                name: "Edit Profile",
                            },
                        ]}
                        component={PageEditProfile}
                    />
                }
            />

            <Route
                path="/dashboard"
                element={
                    <PrivateRoute
                        moduleCode="page_dashboard"
                        moduleName="Dashboard"
                        title="Dashboard"
                        subtitle="ADMIN"
                        pageId="PageDashboard"
                        pageHeaderIcon={faHome}
                        breadcrumb={[
                            {
                                name: "Dashboard",
                            },
                        ]}
                        component={PageDashboard}
                    />
                }
            />

            <Route
                path="/budget-allocation"
                element={
                    <PrivateRoute
                        moduleCode="page_budget_allocation"
                        moduleName="Budget Allocation"
                        title="Budget Allocation"
                        subtitle="BUDGET"
                        pageId="PageBudgetAllocation"
                        pageHeaderIcon={faMoneyBillWave}
                        breadcrumb={[
                            {
                                name: "Budget Allocation",
                            },
                        ]}
                        component={PageBudgetAllocation}
                    />
                }
            />

            {/* products */}
            <Route
                path="/product"
                element={
                    <PrivateRoute
                        moduleCode="page_product"
                        moduleName="Product"
                        title="Product"
                        subtitle="LIST"
                        pageId="PageProduct"
                        pageHeaderIcon={faBoxOpen}
                        breadcrumb={[
                            {
                                name: "Product",
                            },
                        ]}
                        component={PageProduct}
                    />
                }
            />
            <Route
                path="/product/add"
                element={
                    <PrivateRoute
                        moduleCode="page_product"
                        moduleName="Add Product"
                        title="Product"
                        subtitle="ADD"
                        pageId="PageProductForm"
                        pageHeaderIcon={faBoxOpen}
                        breadcrumb={[
                            {
                                name: "Product",
                                link: "/product",
                            },
                            {
                                name: "Add",
                            },
                        ]}
                        component={PageProductForm}
                    />
                }
            />
            <Route
                path="/product/edit/:id"
                element={
                    <PrivateRoute
                        moduleCode="page_product"
                        moduleName="Edit Product"
                        title="Product"
                        subtitle="EDIT"
                        pageId="PageProductForm"
                        pageHeaderIcon={faBoxOpen}
                        breadcrumb={[
                            {
                                name: "Product",
                                link: "/product",
                            },
                            {
                                name: "Edit",
                            },
                        ]}
                        component={PageProductForm}
                    />
                }
            />
            {/* end products */}

            {/* inventory */}
            <Route
                path="/inventory"
                element={
                    <PrivateRoute
                        moduleCode="page_inventory"
                        moduleName="Inventory"
                        title="Inventory"
                        subtitle="LIST"
                        pageId="PageInventory"
                        pageHeaderIcon={faBoxOpen}
                        breadcrumb={[
                            {
                                name: "Inventory",
                            },
                        ]}
                        component={PageInventory}
                    />
                }
            />

            <Route
                path="/inventory/add"
                element={
                    <PrivateRoute
                        moduleCode="page_inventory"
                        moduleName="Add Product"
                        title="Product"
                        subtitle="ADD"
                        pageId="PageProductForm"
                        pageHeaderIcon={faBoxOpen}
                        breadcrumb={[
                            {
                                name: "Inventory",
                                link: "/inventory",
                            },
                            {
                                name: "Add Product",
                            },
                        ]}
                        component={PageProductForm}
                    />
                }
            />

            <Route
                path="/inventory/edit/:id"
                element={
                    <PrivateRoute
                        moduleCode="page_inventory"
                        moduleName="Edit Product"
                        title="Product"
                        subtitle="EDIT"
                        pageId="PageProductForm"
                        pageHeaderIcon={faBoxOpen}
                        breadcrumb={[
                            {
                                name: "Inventory",
                                link: "/inventory",
                            },
                            {
                                name: "Edit Product",
                            },
                        ]}
                        component={PageProductForm}
                    />
                }
            />
            {/* end inventory */}

            {/* START PURCHASE */}
            <Route
                path="/purchase-order"
                element={
                    <PrivateRoute
                        moduleCode="page_purchase"
                        moduleName="Purchase Order"
                        title="Purchase Order"
                        subtitle="LIST"
                        pageId="PagePurchase"
                        pageHeaderIcon={faListCheck}
                        breadcrumb={[
                            {
                                name: "Purchase Order",
                            },
                        ]}
                        component={PagePurchase}
                    />
                }
            />
            <Route
                path="/purchase-order/view/:id"
                element={
                    <PrivateRoute
                        moduleCode="page_purchase"
                        moduleName="View Purchase Order"
                        title="Purchase Order"
                        subtitle="VIEW"
                        pageId="PagePurchaseView"
                        pageHeaderIcon={faListCheck}
                        breadcrumb={[
                            {
                                name: "Purchase Order",
                            },
                            {
                                name: "View",
                            },
                        ]}
                        component={PagePurchaseView}
                    />
                }
            />

            <Route
                path="/purchase-order/add-purchase"
                element={
                    <PrivateRoute
                        moduleCode="page_purchase"
                        moduleName="Add Purchase Order"
                        title="Purchase Order"
                        subtitle="ADD"
                        pageId="PagePurchaseForm"
                        pageHeaderIcon={faListCheck}
                        breadcrumb={[
                            {
                                name: "Purchase Order",
                                link: "/purchase-order",
                            },
                            {
                                name: "Add Purchase Order",
                            },
                        ]}
                        component={PagePurchaseForm}
                    />
                }
            />

            <Route
                path="/purchase-order/add-purchase-order-return"
                element={
                    <PrivateRoute
                        moduleCode="page_purchase"
                        moduleName="Add Purchase Order Return"
                        title="Purchase Order Return"
                        subtitle="ADD"
                        pageId="PagePurchaseReturnForm"
                        pageHeaderIcon={faListCheck}
                        breadcrumb={[
                            {
                                name: "Purchase Order",
                                link: "/purchase-order",
                            },
                            {
                                name: "Add Purchase Order Return",
                            },
                        ]}
                        component={PagePurchaseReturnForm}
                    />
                }
            />

            <Route
                path="/purchase-order/edit-purchase/:id"
                element={
                    <PrivateRoute
                        moduleCode="page_purchase"
                        moduleName="Edit Purchase Order"
                        title="Purchase Order"
                        subtitle="EDIT"
                        pageId="PagePurchaseForm"
                        pageHeaderIcon={faListCheck}
                        breadcrumb={[
                            {
                                name: "Purchase Order",
                                link: "/purchase-order",
                            },
                            {
                                name: "Edit Purchase Order",
                            },
                        ]}
                        component={PagePurchaseForm}
                    />
                }
            />

            <Route
                path="/purchase-order/edit-purchase-order-return/:id"
                element={
                    <PrivateRoute
                        moduleCode="page_purchase"
                        moduleName="Edit Purchase Order Return"
                        title="Purchase Order Return"
                        subtitle="EDIT"
                        pageId="PagePurchaseReturnForm"
                        pageHeaderIcon={faListCheck}
                        breadcrumb={[
                            {
                                name: "Purchase Order",
                                link: "/purchase-order",
                            },
                            {
                                name: "Edit Purchase Order Return",
                            },
                        ]}
                        component={PagePurchaseReturnForm}
                    />
                }
            />

            {/* END PURCHASE */}

            {/* START SALES */}
            <Route
                path="/release-item"
                element={
                    <PrivateRoute
                        moduleCode="page_sales"
                        moduleName="Release Item"
                        title="Release Item"
                        subtitle="LIST"
                        pageId="PageSale"
                        pageHeaderIcon={faChartMixedUpCircleDollar}
                        breadcrumb={[
                            {
                                name: "Sale",
                            },
                        ]}
                        component={PageSales}
                    />
                }
            />

            <Route
                path="/release-item/view/:id"
                element={
                    <PrivateRoute
                        moduleCode="page_sales"
                        moduleName="Release Item View"
                        title="Release Item"
                        subtitle="VIEW"
                        pageId="PageSalesView"
                        pageHeaderIcon={faListCheck}
                        breadcrumb={[
                            {
                                name: "Release Item",
                            },
                            {
                                name: "View",
                            },
                        ]}
                        component={PageSalesView}
                    />
                }
            />

            <Route
                path="/release-item/add-sales"
                element={
                    <PrivateRoute
                        moduleCode="page_sales"
                        moduleName="Add Sale"
                        title="Release Item"
                        subtitle="ADD"
                        pageId="PageSaleForm"
                        pageHeaderIcon={faChartMixedUpCircleDollar}
                        breadcrumb={[
                            {
                                name: "Release Item",
                                link: "/release-item",
                            },
                            {
                                name: "Add",
                            },
                        ]}
                        component={PageSalesForm}
                    />
                }
            />

            <Route
                path="/release-item/add-sales-return"
                element={
                    <PrivateRoute
                        moduleCode="page_sales"
                        moduleName="Add Release Item Return"
                        title="Release Item Return"
                        subtitle="ADD"
                        pageId="PageSalesReturnForm"
                        pageHeaderIcon={faChartMixedUpCircleDollar}
                        breadcrumb={[
                            {
                                name: "Release Item",
                                link: "/release-item",
                            },
                            {
                                name: "Add Release Item Return",
                            },
                        ]}
                        component={PageSalesReturnForm}
                    />
                }
            />

            <Route
                path="/release-item/edit-sales/:id"
                element={
                    <PrivateRoute
                        moduleCode="page_sales"
                        moduleName="Edit Sale"
                        title="Release Item"
                        subtitle="EDIT"
                        pageId="PageSaleForm"
                        pageHeaderIcon={faListCheck}
                        breadcrumb={[
                            {
                                name: "Release Item",
                                link: "/release-item",
                            },
                            {
                                name: "Edit",
                            },
                        ]}
                        component={PageSalesForm}
                    />
                }
            />

            <Route
                path="/release-item/edit-sales-return/:id"
                element={
                    <PrivateRoute
                        moduleCode="page_sales"
                        moduleName="Edit Release Item Return"
                        title="Release Item Return"
                        subtitle="EDIT"
                        pageId="PageSalesReturnForm"
                        pageHeaderIcon={faChartMixedUpCircleDollar}
                        breadcrumb={[
                            {
                                name: "Release Item",
                                link: "/release-item",
                            },
                            {
                                name: "Edit Release Item Return",
                            },
                        ]}
                        component={PageSalesReturnForm}
                    />
                }
            />
            {/* END SALES */}

            <Route
                path="/warehouse"
                element={
                    <PrivateRoute
                        moduleCode="page_warehouse"
                        moduleName="Warehouse"
                        title="Warehouse"
                        subtitle="LIST"
                        pageId="PageWarehouse"
                        pageHeaderIcon={faWarehouseFull}
                        breadcrumb={[
                            {
                                name: "Warehouse",
                            },
                        ]}
                        component={PageWarehouse}
                    />
                }
            />

            <Route
                path="/transfer"
                element={
                    <PrivateRoute
                        moduleCode="page_transfer"
                        moduleName="Transfer"
                        title="Transfer"
                        subtitle="LIST"
                        pageId="PageUser"
                        pageHeaderIcon={faRightLeftLarge}
                        breadcrumb={[
                            {
                                name: "Transfer",
                            },
                        ]}
                        component={PageTransfer}
                    />
                }
            />

            {/* users */}
            <Route
                path="/users"
                element={
                    <PrivateRoute
                        moduleCode="page_users"
                        moduleName="Users"
                        title="Users"
                        subtitle="VIEW / EDIT"
                        pageId="PageUser"
                        pageHeaderIcon={faUsers}
                        breadcrumb={[
                            {
                                name: "Users",
                            },
                        ]}
                        component={PageUser}
                    />
                }
            />

            <Route
                path="/users/add"
                element={
                    <PrivateRoute
                        moduleCode="page_users"
                        moduleName="Add User"
                        title="Users"
                        subtitle="ADD"
                        pageId="PageUserForm"
                        pageHeaderIcon={faUsers}
                        breadcrumb={[
                            {
                                name: "Users",
                                link: "/users",
                            },
                            {
                                name: "Add",
                            },
                        ]}
                        component={PageUserForm}
                    />
                }
            />

            <Route
                path="/users/edit/:id"
                element={
                    <PrivateRoute
                        moduleCode="page_users"
                        moduleName="User Edit"
                        title="Users"
                        subtitle="EDIT"
                        pageId="PageUserForm"
                        pageHeaderIcon={faUsers}
                        breadcrumb={[
                            {
                                name: "Users",
                                link: "/users",
                            },
                            {
                                name: "Edit",
                            },
                        ]}
                        component={PageUserForm}
                    />
                }
            />

            <Route
                path="/users/permission/:id"
                element={
                    <PrivateRoute
                        moduleCode="page_users"
                        moduleName="User Edit Permission"
                        title="User's Edit Permission"
                        subtitle="EDIT"
                        pageId="PageUserPermission"
                        pageHeaderIcon={faUsers}
                        breadcrumb={[
                            {
                                name: "Users",
                                link: "/users",
                            },
                            {
                                name: "Edit Permission",
                            },
                        ]}
                        component={PageUserPermission}
                    />
                }
            />

            <Route
                path="/suppliers"
                element={
                    <PrivateRoute
                        moduleCode="page_suppliers"
                        moduleName="Suppliers"
                        title="Suppliers"
                        subtitle="LIST"
                        pageId="PageUser"
                        pageHeaderIcon={faUserGroup}
                        breadcrumb={[
                            {
                                name: "Suppliers",
                            },
                        ]}
                        component={PageUser}
                    />
                }
            />

            <Route
                path="/suppliers/add"
                element={
                    <PrivateRoute
                        moduleCode="page_suppliers"
                        moduleName="Add Supplier"
                        title="Supplier"
                        subtitle="ADD"
                        pageId="PageUserForm"
                        pageHeaderIcon={faUserGroup}
                        breadcrumb={[
                            {
                                name: "Supplier",
                                link: "/suppliers",
                            },
                            {
                                name: "Add",
                            },
                        ]}
                        component={PageUserForm}
                    />
                }
            />

            <Route
                path="/suppliers/edit/:id"
                element={
                    <PrivateRoute
                        moduleCode="page_suppliers"
                        moduleName="Edit Supplier"
                        title="Supplier"
                        subtitle="EDIT"
                        pageId="PageUserForm"
                        pageHeaderIcon={faUserGroup}
                        breadcrumb={[
                            {
                                name: "Supplier",
                                link: "/suppliers",
                            },
                            {
                                name: "Edit",
                            },
                        ]}
                        component={PageUserForm}
                    />
                }
            />

            <Route
                path="/customers"
                element={
                    <PrivateRoute
                        moduleCode="page_customers"
                        moduleName="Customers"
                        title="Customers"
                        subtitle="ADMIN"
                        pageId="PageUser"
                        pageHeaderIcon={faHome}
                        breadcrumb={[
                            {
                                name: "Customers",
                            },
                        ]}
                        component={PageUser}
                    />
                }
            />

            <Route
                path="/customers/add"
                element={
                    <PrivateRoute
                        moduleCode="page_customers"
                        moduleName="Add Customer"
                        title="Customers"
                        subtitle="ADD"
                        pageId="PageUserForm"
                        pageHeaderIcon={faHome}
                        breadcrumb={[
                            {
                                name: "Customers",
                                link: "/customers",
                            },
                            {
                                name: "Add",
                            },
                        ]}
                        component={PageUserForm}
                    />
                }
            />

            <Route
                path="/customers/edit/:id"
                element={
                    <PrivateRoute
                        moduleCode="page_customers"
                        moduleName="Edit Customer"
                        title="Customers"
                        subtitle="EDIT"
                        pageId="PageUserForm"
                        pageHeaderIcon={faUserGroup}
                        breadcrumb={[
                            {
                                name: "Customers",
                                link: "/customers",
                            },
                            {
                                name: "Edit",
                            },
                        ]}
                        component={PageUserForm}
                    />
                }
            />

            {/* end users */}

            {/* reports */}
            <Route
                path="/reports/general"
                element={
                    <PrivateRoute
                        moduleCode="page_reports"
                        moduleName="Reports"
                        title="Report"
                        subtitle="VIEW"
                        pageId="PageReport"
                        pageHeaderIcon={faChartLine}
                        breadcrumb={[
                            {
                                name: "Report",
                            },
                            {
                                name: "General",
                            },
                        ]}
                        component={PageReport}
                    />
                }
            />
            <Route
                path="/reports/ledger"
                element={
                    <PrivateRoute
                        moduleCode="page_reports"
                        moduleName="Reports"
                        title="Report"
                        subtitle="VIEW"
                        pageId="PageReport"
                        pageHeaderIcon={faChartLine}
                        breadcrumb={[
                            {
                                name: "Report",
                            },
                            {
                                name: "Ledger",
                            },
                        ]}
                        component={PageReportLedger}
                    />
                }
            />
            <Route
                path="/reports/inventory"
                element={
                    <PrivateRoute
                        moduleCode="page_reports"
                        moduleName="Reports"
                        title="Report"
                        subtitle="INVENTORY"
                        pageId="PageReport"
                        pageHeaderIcon={faChartLine}
                        breadcrumb={[
                            {
                                name: "Report",
                            },
                            {
                                name: "Inventory",
                            },
                        ]}
                        component={PageReportInventory}
                    />
                }
            />
            <Route
                path="/reports/sales-revenue"
                element={
                    <PrivateRoute
                        moduleCode="page_reports"
                        moduleName="Reports"
                        title="Report"
                        subtitle="SALES REVENUE"
                        pageId="PageReport"
                        pageHeaderIcon={faChartLine}
                        breadcrumb={[
                            {
                                name: "Report",
                            },
                            {
                                name: "Release Item Revenue",
                            },
                        ]}
                        component={PageReportSalesRevenue}
                    />
                }
            />
            {/* end reports */}

            {/* admin settings */}

            <Route
                path="/admin-setting"
                element={
                    <PrivateRoute
                        moduleCode="page_admin_setting"
                        moduleName="Admin Settings"
                        title="Setting"
                        subtitle="ADMIN"
                        pageId="PageAdminSetting"
                        pageHeaderIcon={faCogs}
                        breadcrumb={[
                            {
                                name: "Admin Setting",
                            },
                        ]}
                        component={PageAdminSetting}
                    />
                }
            />

            {/* end admin settings */}

            <Route
                path="/user-permissions"
                element={
                    <PrivateRoute
                        moduleCode="page_user_permissions"
                        moduleName="User Permissions"
                        title="Permissions"
                        subtitle="USER"
                        pageId="PageUserPermissions"
                        pageHeaderIcon={faUserShield}
                        breadcrumb={[
                            {
                                name: "User Permissions",
                            },
                        ]}
                        component={PageUserPermissions}
                    />
                }
            />
            <Route
                path="/video-faqs"
                element={
                    <PrivateRoute
                        moduleCode="page_video_faq"
                        moduleName="Video FAQs"
                        title="FAQs"
                        subtitle="VIDEO"
                        pageId="PageVideoFaqs"
                        pageHeaderIcon={faVideo}
                        breadcrumb={[
                            {
                                name: "Video FAQs",
                            },
                        ]}
                        component={PageVideoFaqs}
                    />
                }
            />

            <Route
                path="/request-permission"
                element={<PageRequestPermission />}
            />

            <Route path="*" element={<Page404 />} />
        </Routes>
    );
}
