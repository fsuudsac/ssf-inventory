import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown, Image, Layout, Typography, Select, App } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPowerOff } from "@fortawesome/pro-light-svg-icons";

import {
    apiUrl,
    clearLocalStorage,
    defaultProfile,
    role,
    userData,
} from "../../providers/appConfig";
import NotificationPopover from "./components/NotificationPopover";

export default function Header(props) {
    const { width, sideMenuCollapse, setSideMenuCollapse } = props;
    const { message } = App.useApp();

    const navigate = useNavigate();
    const userdata = userData();

    const [profilePicture, setProfilePicture] = useState(defaultProfile);
    const [currentRole, setCurrentRole] = useState(
        localStorage.getItem("simulated_role") || "PMO/VPASA (Admin)"
    );

    useEffect(() => {
        const handleRoleChangedEvent = (e) => {
            const newRole =
                e?.detail ||
                localStorage.getItem("simulated_role") ||
                "PMO/VPASA (Admin)";
            setCurrentRole(newRole);
        };
        window.addEventListener("role_changed", handleRoleChangedEvent);
        return () => window.removeEventListener("role_changed", handleRoleChangedEvent);
    }, []);

    const handleRoleChange = (newRole) => {
        localStorage.setItem("simulated_role", newRole);
        setCurrentRole(newRole);
        window.dispatchEvent(new CustomEvent("role_changed", { detail: newRole }));
        message.success(`Switched role view to: ${newRole}`);
        if (newRole === "Department User") {
            navigate("/department-portal");
        } else if (newRole === "Finance Office") {
            navigate("/finance-approval");
        } else {
            navigate("/canvassing");
        }
    };

    useEffect(() => {
        if (userdata.profile_picture) {
            let profile_picture = userdata.profile_picture.split("//");

            if (
                profile_picture[0] === "http:" ||
                profile_picture[0] === "https:"
            ) {
                setProfilePicture(userdata.profile_picture);
            } else {
                setProfilePicture(apiUrl(userdata.profile_picture));
            }
        }

        return () => {};
    }, []);

    const handleLogout = () => {
        clearLocalStorage();
        navigate("/", { replace: true });
    };

    const menuNotification = () => {
        const items = [
            {
                label: "Notifications",
                key: "0",
            },

            {
                type: "divider",
            },

            {
                label: "No notification",
                key: "1",
            },
        ];

        return { items };
    };

    const menuProfile = () => {
        const items = [
            {
                key: "/account/details",
                className: "menu-item-profile-details",
                label: (
                    <div className="menu-item-details-wrapper">
                        <Image
                            preview={false}
                            src={profilePicture}
                            alt={userdata.username}
                        />

                        <div className="info-wrapper">
                            <Typography.Text className="info-username">
                                {userdata.firstname} {userdata.lastname}
                            </Typography.Text>

                            <br />

                            <Typography.Text className="info-role">
                                {role()}
                            </Typography.Text>
                        </div>
                    </div>
                ),
            }, // remember to pass the key prop
            {
                key: "/edit-profile",
                icon: <FontAwesomeIcon icon={faEdit} />,
                label: <Link to="/edit-profile">Edit Account Profile</Link>,
            }, // which is required
        ];

        items.push({
            key: "/signout",
            className: "ant-menu-item-logout",
            icon: <FontAwesomeIcon icon={faPowerOff} />,
            label: (
                <Typography.Link onClick={handleLogout}>
                    Sign Out
                </Typography.Link>
            ),
        });

        return { items };
    };

    return (
        <Layout.Header>
            <div className="header-left-menu">
                {width < 768 ? (
                    <div
                        className="menu-left-icon menu-left-icon-menu-collapse-on-close"
                        onClick={() => {
                            setSideMenuCollapse(
                                !sideMenuCollapse ? true : false,
                            );
                        }}
                    >
                        <div
                            className={`menu-left-icon-collpase ${
                                !sideMenuCollapse ? "is-collapse" : ""
                            }`}
                        >
                            <span className="line1" />
                            <span className="line2" />
                            <span className="line3" />
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="header-right-menu flex items-center gap-3">
                {/* Role Simulator Dropdown */}
                <div className="flex items-center gap-1.5 bg-blue-50/90 border border-blue-200/90 px-2 py-1 rounded-lg shadow-2xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 hidden sm:inline">
                        Role:
                    </span>
                    <Select
                        size="small"
                        value={currentRole}
                        onChange={handleRoleChange}
                        variant="borderless"
                        className="text-xs font-semibold text-blue-800 min-w-[170px]"
                        options={[
                            { value: "PMO/VPASA (Admin)", label: "🛡️ PMO/VPASA (Admin)" },
                            { value: "Department User", label: "🏢 Department User" },
                            { value: "Finance Office", label: "💰 Finance Office" },
                        ]}
                    />
                </div>

                <NotificationPopover userdata={userdata} />

                <Dropdown
                    menu={menuProfile()}
                    placement="bottomRight"
                    overlayClassName="menu-submenu-profile-popup"
                    trigger={["click"]}
                >
                    <span className="cursor-pointer inline-flex items-center">
                        <Image
                            preview={false}
                            rootClassName="menu-submenu-profile"
                            src={profilePicture}
                            alt={userdata?.firstname}
                        />
                    </span>
                </Dropdown>
            </div>
        </Layout.Header>
    );
}
