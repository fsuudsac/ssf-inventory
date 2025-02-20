import { Menu } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome,
    faUsers,
    faShieldKeyhole,
    faCog,
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
        moduleCode: "M-01",
    },
    {
        title: "Students",
        path: "/students",
        icon: <FontAwesomeIcon icon={faUsers} />,
    },
    {
        title: "Employees",
        path: "/employees",
        icon: <FontAwesomeIcon icon={faUsers} />,
        children: [
            {
                title: "Full Time",
                path: "/employees/full-time",
                // moduleCode: "M-06",
            },

            {
                title: "Part Time",
                path: "/employees/part-time",
                // moduleCode: "M-06",
            },
        ],
    },
    {
        title: "Users",
        path: "/users",
        icon: <FontAwesomeIcon icon={faUsers} />,
    },
    {
        title: "System Settings",
        path: "/system-settings",
        icon: <FontAwesomeIcon icon={faCog} />,
        children: [
            {
                title: "Email Templates",
                path: "/system-settings/email-templates",
                // moduleCode: "M-06",
            },

            {
                title: "Admin Settings",
                path: "/system-settings/admin-settings",
                // moduleCode: "M-06",
            },
            {
                title: "System Link",
                path: "/system-settings/system-link",
            },
        ],
    },
    {
        title: "Permissions",
        path: "/permission",
        icon: <FontAwesomeIcon icon={faShieldKeyhole} />,
    },
];
