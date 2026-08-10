import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Dropdown, Image, Layout, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPowerOff } from "@fortawesome/pro-light-svg-icons";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { faBell } from "@fortawesome/pro-regular-svg-icons";

import {
    apiUrl,
    defaultProfile,
    role,
    userData,
} from "../../providers/appConfig";

export default function Header(props) {
    const { width, sideMenuCollapse, setSideMenuCollapse } = props;

    const [profilePicture, setProfilePicture] = useState(defaultProfile);

    useEffect(() => {
        if (userData().profile_picture) {
            let profile_picture = userData().profile_picture.split("//");

            if (
                profile_picture[0] === "http:" ||
                profile_picture[0] === "https:"
            ) {
                setProfilePicture(userData().profile_picture);
            } else {
                setProfilePicture(apiUrl(userData().profile_picture));
            }
        }

        return () => {};
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userdata");
        window.location.reload();
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

    console.log("userdata: ", userData());

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
                            alt={userData().username}
                        />

                        <div className="info-wrapper">
                            <Typography.Text className="info-username">
                                {userData().firstname} {userData().lastname}
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
                    <div className="menu-left-icon menu-left-icon-menu-collapse-on-close">
                        {sideMenuCollapse ? (
                            <MenuUnfoldOutlined
                                onClick={() => setSideMenuCollapse(false)}
                                className="menuCollapseOnClose"
                            />
                        ) : (
                            <MenuFoldOutlined
                                onClick={() => setSideMenuCollapse(true)}
                                className="menuCollapseOnClose"
                            />
                        )}
                    </div>
                ) : null}
            </div>

            <div className="header-right-menu">
                <Dropdown
                    menu={menuProfile()}
                    placement="bottomRight"
                    overlayClassName="menu-submenu-profile-popup"
                    trigger={["click"]}
                >
                    <Image
                        preview={false}
                        rootClassName="menu-submenu-profile"
                        src={profilePicture}
                        alt={userData().username}
                    />
                </Dropdown>

                <Dropdown
                    menu={menuNotification()}
                    placement="bottomRight"
                    overlayClassName="menu-submenu-notification-popup"
                    trigger={["click"]}
                >
                    <FontAwesomeIcon
                        className="menu-submenu-notification"
                        icon={faBell}
                    />
                </Dropdown>
            </div>
        </Layout.Header>
    );
}
