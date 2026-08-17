import { Menu } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome,
    faUsers,
    faCogs,
    faWarehouseFull,
    faListCheck,
    faChartMixedUpCircleDollar,
    faUserGroup,
    faBoxesStacked,
    faChartPie,
    faBoxOpenFull,
    faVideo,
    faRightLeftLarge,
    faUserShield,
    faMoneyBillWave,
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
        title: "Dashboard",
        path: "/dashboard",
        icon: <FontAwesomeIcon icon={faHome} />,
        moduleCode: "page_dashboard",
    },
    {
        title: "Budget Allocation",
        path: "/budget-allocation",
        icon: <FontAwesomeIcon icon={faMoneyBillWave} />,
        moduleCode: "page_budget_allocation",
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
        title: "Suppliers",
        path: "/suppliers",
        icon: <FontAwesomeIcon icon={faUserGroup} />,
        moduleCode: "page_suppliers",
    },
    {
        title: "Customers",
        path: "/customers",
        icon: <FontAwesomeIcon icon={faUserGroup} />,
        moduleCode: "page_customers",
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
        title: "Admin Settings",
        path: "/admin-setting",
        icon: <FontAwesomeIcon icon={faCogs} />,
        moduleCode: "page_admin_setting",
    },
    {
        title: "User Permissions",
        path: "/user-permissions",
        icon: <FontAwesomeIcon icon={faUserShield} />,
        moduleCode: "page_user_permissions",
    },
    {
        title: "Video FAQs",
        path: "/video-faqs",
        icon: <FontAwesomeIcon icon={faVideo} />,
        moduleCode: "page_video_faq",
    },
];
