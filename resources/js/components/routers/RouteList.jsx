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
    faBuilding,
} from "@fortawesome/pro-regular-svg-icons";

import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

import Page404 from "../views/errors/Page404";
import PageRequestPermission from "../views/errors/PageRequestPermission";

import PageLogin from "../views/Public/PageLogin/PageLogin";

import PageEditProfile from "../views/Private/PageEditProfile/PageEditProfile";
import PageDashboard from "../views/Private/PageDashboard/PageDashboard";
import PageUser from "../views/Private/PageUser/PageUser";
import PageUserForm from "../views/Private/PageUser/PageUserForm";
import PageUserPermission from "../views/Private/PageUser/PageUserPermission";
import PageWarehouse from "../views/Private/PageWarehouse/PageWarehouse";
import PageInventory from "../views/Private/PageInventory/PageInventory";
import PagePurchase from "../views/Private/PagePurchase/PagePurchase";
import PagePurchaseForm from "../views/Private/PagePurchase/PagePurchaseForm";
import PageAdminSetting from "../views/Private/PageAdminSetting/PageAdminSetting";
import PageSalesForm from "../views/Private/PageSales/PageSalesForm";
import PageSales from "../views/Private/PageSales/PageSales";
import PageProductForm from "../views/Private/PageProduct/PageProductForm";
import PageProduct from "../views/Private/PageProduct/PageProduct";
import PageReportLedger from "../views/Private/PageReport/PageReportLedger";
import PageReportInventory from "../views/Private/PageReport/PageReportInventory";
import PagePurchaseView from "../views/Private/PagePurchase/PagePurchaseView";
import PageSalesView from "../views/Private/PageSales/PageSalesView";
import PageSalesReturnForm from "../views/Private/PageSales/PageSalesReturnForm";
import PagePurchaseReturnForm from "../views/Private/PagePurchase/PagePurchaseReturnForm";
import PageVideoFaqs from "../views/Private/PageVideoFaqs/PageVideoFaqs";
import PageTransfer from "../views/Private/PageTransfer/PageTransfer";
import PageReportSalesRevenue from "../views/Private/PageReport/PageReportSalesRevenue/PageReportSalesRevenue";
import PageReport from "../views/Private/PageReport/PageReport";
import PageBudgetAllocation from "../views/Private/PageBudgetAllocation/PageBudgetAllocation";
import PagePermission from "../views/Private/PagePermission/PagePermission";
import PageBudgetAllocationDepartment from "../views/Private/PageBudgetAllocation/components/PageBudgetAllocationDepartment/PageBudgetAllocationDepartment";
import PageReportBudget from "../views/Private/PageReport/PageReportBudget";
import PagePurchaseRequest from "../views/Private/PagePurchaseRequest/PagePurchaseRequest";
import PageCanvassing from "../views/Private/PageCanvassing/PageCanvassing";
import PagePurchaseOrder from "../views/Private/PagePurchaseOrder/PagePurchaseOrder";
import PageFinanceApproval from "../views/Private/PageFinanceApproval/PageFinanceApproval";
import PageVPASA from "../views/Private/PageVPASA/PageVPASA";
import PageDepartmentPortal from "../views/Private/PageDepartmentPortal/PageDepartmentPortal";
import PageDepartments from "../views/Private/PageDepartments/PageDepartments";

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
                path="/canvassing"
                element={
                    <PrivateRoute
                        moduleCode="page_canvassing"
                        moduleName="Canvassing & RFQ"
                        title="Canvassing"
                        subtitle="SOURCING & BID EVALUATION"
                        pageId="PageCanvassing"
                        pageHeaderIcon={faListCheck}
                        breadcrumb={[
                            {
                                name: "Canvassing & RFQ",
                            },
                        ]}
                        component={PageCanvassing}
                    />
                }
            />

            <Route
                path="/department-portal"
                element={
                    <PrivateRoute
                        moduleCode="page_department_portal"
                        moduleName="Department Request Portal"
                        title="Department Portal"
                        subtitle="REQUISITIONS & CANVASS REQUESTS"
                        pageId="PageDepartmentPortal"
                        pageHeaderIcon={faBuilding}
                        breadcrumb={[
                            {
                                name: "Department Portal",
                            },
                        ]}
                        component={PageDepartmentPortal}
                    />
                }
            />

            <Route
                path="/finance"
                element={
                    <PrivateRoute
                        moduleCode="page_finance_approval"
                        moduleName="Finance Budget Approval"
                        title="Finance Approval"
                        subtitle="BUDGET GATEKEEPER KANBAN"
                        pageId="PageFinanceApproval"
                        pageHeaderIcon={faMoneyBillWave}
                        breadcrumb={[
                            {
                                name: "Finance Approval",
                            },
                        ]}
                        component={PageFinanceApproval}
                    />
                }
            />

            <Route
                path="/finance-approval"
                element={
                    <PrivateRoute
                        moduleCode="page_finance_approval"
                        moduleName="Finance Budget Approval"
                        title="Finance Approval"
                        subtitle="BUDGET GATEKEEPER KANBAN"
                        pageId="PageFinanceApproval"
                        pageHeaderIcon={faMoneyBillWave}
                        breadcrumb={[
                            {
                                name: "Finance Approval",
                            },
                        ]}
                        component={PageFinanceApproval}
                    />
                }
            />

            <Route
                path="/vpasa"
                element={
                    <PrivateRoute
                        moduleCode="page_vpasa_approval"
                        moduleName="VPASA Executive Authorization"
                        title="VPASA Authorization"
                        subtitle="STAGE 5 EXECUTIVE SIGN-OFF"
                        pageId="PageVPASA"
                        pageHeaderIcon={faUserShield}
                        breadcrumb={[
                            {
                                name: "VPASA Authorization",
                            },
                        ]}
                        component={PageVPASA}
                    />
                }
            />

            <Route
                path="/vpasa-approval"
                element={
                    <PrivateRoute
                        moduleCode="page_vpasa_approval"
                        moduleName="VPASA Executive Authorization"
                        title="VPASA Authorization"
                        subtitle="STAGE 5 EXECUTIVE SIGN-OFF"
                        pageId="PageVPASA"
                        pageHeaderIcon={faUserShield}
                        breadcrumb={[
                            {
                                name: "VPASA Authorization",
                            },
                        ]}
                        component={PageVPASA}
                    />
                }
            />

            <Route
                path="/purchase-orders"
                element={
                    <PrivateRoute
                        moduleCode="page_purchase_order"
                        moduleName="Purchase Orders"
                        title="Purchase Orders"
                        subtitle="KANBAN TRACKING & FULFILLMENT"
                        pageId="PagePurchaseOrder"
                        pageHeaderIcon={faBoxOpen}
                        breadcrumb={[
                            {
                                name: "Purchase Orders",
                            },
                        ]}
                        component={PagePurchaseOrder}
                    />
                }
            />

            <Route
                path="/purchase-request"
                element={
                    <PrivateRoute
                        moduleCode="page_purchase_request"
                        moduleName="Purchase Request"
                        title="Purchase Request"
                        subtitle="PURCHASE REQUEST"
                        pageId="PagePurchaseRequest"
                        pageHeaderIcon={faListCheck}
                        breadcrumb={[
                            {
                                name: "Purchase Request",
                            },
                        ]}
                        component={PagePurchaseRequest}
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
            <Route
                path="/budget-allocation/:id"
                element={
                    <PrivateRoute
                        moduleCode="page_budget_allocation"
                        moduleName="Budget Allocation / Department"
                        title="DEPARTMENT"
                        pageId="PageBudgetAllocation"
                        pageHeaderIcon={faMoneyBillWave}
                        breadcrumb={[
                            {
                                name: "Budget Allocation",
                                link: "/budget-allocation",
                            },
                            {
                                name: "Department",
                            },
                        ]}
                        component={PageBudgetAllocationDepartment}
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
            <Route
                path="/reports/budget"
                element={
                    <PrivateRoute
                        moduleCode="page_reports"
                        moduleName="Reports"
                        title="Report"
                        subtitle="BUDGET"
                        pageId="PageReport"
                        pageHeaderIcon={faChartLine}
                        breadcrumb={[
                            {
                                name: "Report",
                            },
                            {
                                name: "Budget",
                            },
                        ]}
                        component={PageReportBudget}
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

            <Route
                path="/departments"
                element={
                    <PrivateRoute
                        moduleCode="page_departments"
                        moduleName="Departments"
                        title="Departments"
                        subtitle="SETTINGS & BUDGET"
                        pageId="PageDepartments"
                        pageHeaderIcon={faListCheck}
                        breadcrumb={[
                            {
                                name: "Settings",
                            },
                            {
                                name: "Departments",
                            },
                        ]}
                        component={PageDepartments}
                    />
                }
            />

            <Route
                path="/admin-setting/departments"
                element={
                    <PrivateRoute
                        moduleCode="page_departments"
                        moduleName="Departments"
                        title="Departments"
                        subtitle="SETTINGS & BUDGET"
                        pageId="PageDepartments"
                        pageHeaderIcon={faListCheck}
                        breadcrumb={[
                            {
                                name: "Admin Setting",
                                link: "/admin-setting",
                            },
                            {
                                name: "Departments",
                            },
                        ]}
                        component={PageDepartments}
                    />
                }
            />

            {/* end admin settings */}

            <Route
                path="/user-permissions"
                element={
                    <PrivateRoute
                        moduleCode="page_permissions"
                        moduleName=" Permissions"
                        title="Permissions"
                        subtitle="USER"
                        pageId="PagePermission"
                        pageHeaderIcon={faUserShield}
                        breadcrumb={[
                            {
                                name: "Permissions",
                            },
                        ]}
                        component={PagePermission}
                    />
                }
            />
            <Route
                path="/permissions"
                element={
                    <PrivateRoute
                        moduleCode="page_permissions"
                        moduleName=" Permissions"
                        title="Permissions Matrix"
                        subtitle="USER"
                        pageId="PagePermission"
                        pageHeaderIcon={faUserShield}
                        breadcrumb={[
                            {
                                name: "Permissions",
                            },
                        ]}
                        component={PagePermission}
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
