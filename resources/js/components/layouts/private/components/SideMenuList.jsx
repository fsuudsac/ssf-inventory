import { Menu } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome,
    faUsers,
    faCogs,
    faWarehouseFull,
    faListCheck,
    faChartMixedUpCircleDollar,
    faBoxesStacked,
    faChartPie,
    faBoxOpenFull,
    faVideo,
    faRightLeftLarge,
    faUserShield,
    faMoneyBillWave,
    faCodePullRequest,
    faBuilding,
} from "@fortawesome/pro-regular-svg-icons";

export const adminHeaderMenuLeft = (
    <>
        {/* <div className="ant-menu-left-icon">
            <Link to="/subscribers/current">
                <span className="anticon">
                    <FontAwesomeIcon icon={faUsers} />
                </span>
                <Typography.Text>Subscribers</Typography.Text>
            </Link>
        </div> */}
    </>
);

export const adminHeaderDropDownMenuLeft = () => {
    const items = [
        // {
        //     key: "/subscribers/current",
        //     icon: <FontAwesomeIcon icon={faUsers} />,
        //     label: <Link to="/subscribers/current">Subscribers</Link>,
        // },
    ];

    return <Menu items={items} />;
};

export const adminSideMenu = [
    {
        title: "Department Portal",
        path: "/department-portal",
        icon: <FontAwesomeIcon icon={faBuilding} />,
        moduleCode: "page_department_portal",
    },
    {
        title: "Dashboard",
        path: "/dashboard",
        icon: <FontAwesomeIcon icon={faHome} />,
        moduleCode: "page_dashboard",
    },
    {
        title: "Canvassing & RFQ",
        path: "/canvassing",
        icon: <FontAwesomeIcon icon={faListCheck} />,
        moduleCode: "page_canvassing",
    },
    {
        title: "Finance Approval",
        path: "/finance-approval",
        icon: <FontAwesomeIcon icon={faMoneyBillWave} />,
        moduleCode: "page_finance_approval",
    },
    {
        title: "VPASA Authorization",
        path: "/vpasa",
        icon: <FontAwesomeIcon icon={faUserShield} />,
        moduleCode: "page_vpasa_approval",
    },
    {
        title: "Purchase Order (Kanban)",
        path: "/purchase-orders",
        icon: <FontAwesomeIcon icon={faBoxesStacked} />,
        moduleCode: "page_purchase_order",
    },
    {
        title: "Purchase Request",
        path: "/purchase-request",
        icon: <FontAwesomeIcon icon={faCodePullRequest} />,
        moduleCode: "page_purchase_request",
    },
    {
        title: "Budget Allocation",
        path: "/budget-allocation",
        icon: <FontAwesomeIcon icon={faMoneyBillWave} />,
        moduleCode: "page_budget_allocation",
    },
    {
        title: "Departments",
        path: "/departments",
        icon: <FontAwesomeIcon icon={faBuilding} />,
        moduleCode: "page_departments",
    },
    {
        title: "Purchase Order",
        path: "/purchase-order",
        icon: <FontAwesomeIcon icon={faListCheck} />,
        moduleCode: "page_purchase",
    },
    {
        title: "Release Item",
        path: "/release-item",
        icon: <FontAwesomeIcon icon={faChartMixedUpCircleDollar} />,
        moduleCode: "page_sales",
    },
    {
        title: "Product Canvas Price",
        path: "/product",
        icon: <FontAwesomeIcon icon={faBoxOpenFull} />,
        moduleCode: "page_product",
    },
    {
        title: "Inventory",
        path: "/inventory",
        icon: <FontAwesomeIcon icon={faBoxesStacked} />,
        moduleCode: "page_inventory",
    },

    {
        title: "Transfer",
        path: "/transfer",
        icon: <FontAwesomeIcon icon={faRightLeftLarge} />,
        moduleCode: "page_transfer",
    },
    {
        title: "Warehouse",
        path: "/warehouse",
        icon: <FontAwesomeIcon icon={faWarehouseFull} />,
        moduleCode: "page_warehouse",
    },
    {
        title: "Users",
        path: "/users",
        icon: <FontAwesomeIcon icon={faUsers} />,
        moduleCode: "page_users",
    },
    {
        title: "Reports",
        path: "/reports",
        icon: <FontAwesomeIcon icon={faChartPie} />,
        moduleCode: "page_reports",
        children: [
            {
                title: "General",
                path: "/reports/general",
                moduleCode: "page_reports",
            },
            {
                title: "Ledger",
                path: "/reports/ledger",
                moduleCode: "page_reports",
            },
            {
                title: "Inventory",
                path: "/reports/inventory",
                moduleCode: "page_reports",
            },
            {
                title: "Budget",
                path: "/reports/budget",
                moduleCode: "page_reports",
            },
        ],
    },
    {
        title: "System Settings",
        path: "/system-settings",
        icon: <FontAwesomeIcon icon={faCogs} />,
        moduleCode: "page_system_settings",
        children: [
            {
                title: "Admin Settings",
                path: "/admin-setting",
                icon: <FontAwesomeIcon icon={faCogs} />,
                moduleCode: "page_admin_setting",
            },
            {
                title: "Department Settings",
                path: "/admin-setting/departments",
                icon: <FontAwesomeIcon icon={faBuilding} />,
                moduleCode: "page_departments",
            },
            {
                title: "User Permissions",
                path: "/user-permissions",
                icon: <FontAwesomeIcon icon={faUserShield} />,
                moduleCode: "page_user_permissions",
            },
        ],
    },
    {
        title: "Video FAQs",
        path: "/video-faqs",
        icon: <FontAwesomeIcon icon={faVideo} />,
        moduleCode: "page_video_faq",
    },
];

export const departmentUserSideMenu = [
    {
        title: "Department Portal",
        path: "/department-portal",
        icon: <FontAwesomeIcon icon={faBuilding} />,
        moduleCode: "page_department_portal",
    },
    {
        title: "My Canvasses & RFQs",
        path: "/canvassing",
        icon: <FontAwesomeIcon icon={faListCheck} />,
        moduleCode: "page_canvassing",
    },
    {
        title: "Purchase Requests",
        path: "/purchase-request",
        icon: <FontAwesomeIcon icon={faCodePullRequest} />,
        moduleCode: "page_purchase_request",
    },
    {
        title: "Department Budget",
        path: "/budget-allocation",
        icon: <FontAwesomeIcon icon={faMoneyBillWave} />,
        moduleCode: "page_budget_allocation",
    },
    {
        title: "Video FAQs",
        path: "/video-faqs",
        icon: <FontAwesomeIcon icon={faVideo} />,
        moduleCode: "page_video_faq",
    },
];

export const financeSideMenu = [
    {
        title: "Finance Approval",
        path: "/finance-approval",
        icon: <FontAwesomeIcon icon={faMoneyBillWave} />,
        moduleCode: "page_finance_approval",
    },
    {
        title: "Budget Allocation",
        path: "/budget-allocation",
        icon: <FontAwesomeIcon icon={faMoneyBillWave} />,
        moduleCode: "page_budget_allocation",
    },
    {
        title: "Purchase Requests",
        path: "/purchase-request",
        icon: <FontAwesomeIcon icon={faCodePullRequest} />,
        moduleCode: "page_purchase_request",
    },
    {
        title: "Purchase Order (Kanban)",
        path: "/purchase-orders",
        icon: <FontAwesomeIcon icon={faBoxesStacked} />,
        moduleCode: "page_purchase_order",
    },
    {
        title: "Canvassing & RFQ",
        path: "/canvassing",
        icon: <FontAwesomeIcon icon={faListCheck} />,
        moduleCode: "page_canvassing",
    },
    {
        title: "Departments",
        path: "/departments",
        icon: <FontAwesomeIcon icon={faBuilding} />,
        moduleCode: "page_departments",
    },
    {
        title: "Reports",
        path: "/reports",
        icon: <FontAwesomeIcon icon={faChartPie} />,
        moduleCode: "page_reports",
        children: [
            {
                title: "Budget Report",
                path: "/reports/budget",
                moduleCode: "page_reports",
            },
            {
                title: "Ledger",
                path: "/reports/ledger",
                moduleCode: "page_reports",
            },
        ],
    },
];

export const filterMenuItemsByPermissions = (menuList, permissions, role) => {
    if (!menuList || !Array.isArray(menuList)) return [];

    const canView = (moduleCode) => {
        if (!moduleCode) return true;

        // Permissions page is strictly for Super Admin or Admin
        if (moduleCode === "page_user_permissions" || moduleCode === "page_permissions") {
            const roleStr = String(role || "");
            const isAdmin =
                roleStr.includes("Admin") ||
                roleStr.includes("Super Admin") ||
                roleStr.includes("PMO") ||
                roleStr.includes("VPASA");
            if (!isAdmin) return false;
        }

        if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
            return true;
        }

        const found = permissions.find((p) => p.module_code === moduleCode);
        if (found) {
            if (typeof found.can_view === "boolean") {
                return found.can_view;
            }
            if (found.module_buttons && Array.isArray(found.module_buttons)) {
                return found.module_buttons.some(
                    (b) =>
                        (b.mod_button_code === "view_page" || b.mod_button_code === "btn_view") &&
                        parseInt(b.status) === 1
                );
            }
        }
        return false;
    };

    return menuList.reduce((acc, item) => {
        if (item.children && Array.isArray(item.children)) {
            const visibleChildren = item.children.filter((child) => canView(child.moduleCode));
            if (visibleChildren.length > 0) {
                acc.push({
                    ...item,
                    children: visibleChildren,
                });
            }
        } else if (canView(item.moduleCode)) {
            acc.push(item);
        }
        return acc;
    }, []);
};

export const getSideMenuByRole = (role, permissions = null) => {
    let baseMenu = adminSideMenu;
    if (role === "Department User") {
        baseMenu = departmentUserSideMenu;
    } else if (role === "Finance Office") {
        baseMenu = financeSideMenu;
    }

    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        return filterMenuItemsByPermissions(baseMenu, permissions, role);
    }
    return baseMenu;
};
