import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Dropdown, Image, Layout, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPowerOff } from "@fortawesome/pro-light-svg-icons";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { faBell } from "@fortawesome/pro-regular-svg-icons";

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

    const navigate = useNavigate();
    const userdata = userData();

    const [profilePicture, setProfilePicture] = useState(defaultProfile);

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

            <div className="header-right-menu">
                <NotificationPopover userdata={userdata} />

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
                        alt={userdata?.firstname}
                    />
                </Dropdown>
            </div>
        </Layout.Header>
    );
}
