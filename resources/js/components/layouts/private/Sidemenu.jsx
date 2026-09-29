import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout, Menu, Typography } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

import { appName, appLogoFullWidth } from "../../providers/appConfig";
import { adminSideMenu, getSideMenuByRole } from "./components/SideMenuList";

export default function Sidemenu(props) {
    const {
        location,
        sideMenuCollapse,
        setSideMenuCollapse,
        width,
        dataPermissions,
        refetchPermissions,
    } = props;

    const [openKeys, setOpenKeys] = useState();

    let pathname = location.pathname;
    pathname = pathname.split("/");
    pathname = "/" + pathname[1];

    const [currentRole, setCurrentRole] = useState(
        localStorage.getItem("simulated_role") || "PMO/VPASA (Admin)"
    );
    const [menuItems, setMenuItems] = useState(
        getSideMenuByRole(localStorage.getItem("simulated_role") || "PMO/VPASA (Admin)")
    );

    useEffect(() => {
        const updateMenuForRole = (roleName) => {
            const roleToUse =
                roleName ||
                localStorage.getItem("simulated_role") ||
                "PMO/VPASA (Admin)";
            setCurrentRole(roleToUse);
            setMenuItems(getSideMenuByRole(roleToUse));
        };

        updateMenuForRole(currentRole);

        const handleRoleChange = (e) => {
            const newRole =
                e?.detail ||
                localStorage.getItem("simulated_role") ||
                "PMO/VPASA (Admin)";
            updateMenuForRole(newRole);
            if (typeof refetchPermissions === "function") {
                refetchPermissions();
            }
        };

        const handlePermissionsUpdated = () => {
            if (typeof refetchPermissions === "function") {
                refetchPermissions();
            }
        };

        window.addEventListener("role_changed", handleRoleChange);
        window.addEventListener("permissions_updated", handlePermissionsUpdated);
        return () => {
            window.removeEventListener("role_changed", handleRoleChange);
            window.removeEventListener("permissions_updated", handlePermissionsUpdated);
        };
    }, [refetchPermissions]);

    useEffect(() => {
        setOpenKeys(
            menuItems
                .filter((item) => item.path === pathname)
                .map((item) => item.path),
        );
    }, [pathname, menuItems]);

    const onOpenChange = (keys) => {
        const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
        const menuItemsFilter = menuItems
            .filter((item) => item.path === latestOpenKey)
            .map((item) => item.path);

        if (menuItemsFilter.indexOf(latestOpenKey) === -1) {
            setOpenKeys(menuItemsFilter);
        } else {
            setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
        }
    };

    const handleCheckPermission = (moduleCode) => {
        if (!moduleCode) return true;

        // Restriction: Only Super Admin and Admin can access permissions page
        if (moduleCode === "page_user_permissions" || moduleCode === "page_permissions") {
            const roleStr = String(currentRole || "");
            const isAdmin =
                roleStr.includes("Admin") ||
                roleStr.includes("Super Admin") ||
                roleStr.includes("PMO") ||
                roleStr.includes("VPASA");
            if (!isAdmin) return false;
        }

        if (!dataPermissions || !Array.isArray(dataPermissions) || dataPermissions.length === 0) {
            return true;
        }

        const found = dataPermissions.find((f) => f.module_code === moduleCode);
        if (found) {
            if (typeof found.can_view === "boolean") {
                return found.can_view;
            }
            if (found.module_buttons && Array.isArray(found.module_buttons)) {
                return found.module_buttons.some(
                    (f2) =>
                        (f2.mod_button_code === "view_page" || f2.mod_button_code === "btn_view") &&
                        parseInt(f2.status) === 1
                );
            }
        }
        return false;
    };

    const activeRoute = (routeName) => {
        const pathname = location.pathname;
        return pathname === routeName ? "ant-menu-item-selected" : "";
    };

    const activeSubRoute = (routeName) => {
        const pathname1 = location.pathname.split("/");
        const pathname2 = routeName.split("/");
        return "/" + pathname1[1] + "/" + pathname1[2] ===
            "/" + pathname2[1] + "/" + pathname2[2]
            ? "ant-menu-item-selected"
            : "";
    };

    const handleMenuRender = () => {
        let items = [];
        const seenKeys = new Set();

        menuItems.forEach((item, index) => {
            if (item.children && item.children.length > 0) {
                let children_list = [];

                item.children.forEach((item2, childIdx) => {
                    let link = "";

                    if (item2.targetNew === 1) {
                        link = (
                            <Typography.Link
                                target="new"
                                href={window.location.origin + item2.path}
                            >
                                {item2.title ?? item2.permission}
                            </Typography.Link>
                        );
                    } else {
                        link = (
                            <Link to={item2.path}>
                                {item2.title ?? item2.permission}
                            </Link>
                        );
                    }

                    if (handleCheckPermission(item2.moduleCode)) {
                        let childKey = item2.path;
                        if (seenKeys.has(childKey)) {
                            childKey = `${item.path}${item2.path}_${childIdx}`;
                        }
                        seenKeys.add(childKey);

                        children_list.push({
                            key: childKey,
                            className: activeSubRoute(item2.path),
                            label: link,
                            onClick: () => {
                                if (width < 768) {
                                    setSideMenuCollapse(true);
                                }
                            },
                        });
                    }

                    return "";
                });

                if (children_list.length > 0) {
                    let parentKey = item.path || `parent_${index}`;
                    if (seenKeys.has(parentKey)) {
                        parentKey = `${parentKey}_${index}`;
                    }
                    seenKeys.add(parentKey);

                    items.push({
                        key: parentKey,
                        icon: item.icon,
                        label: item.title,
                        className: item.className ?? "",
                        children: children_list,
                    });
                    return "";
                }
            } else {
                let link = "";

                if (item.targetNew === 1) {
                    link = (
                        <Typography.Link
                            target="new"
                            href={window.location.origin + item.path}
                        >
                            {item.title ?? item.permission}
                        </Typography.Link>
                    );
                } else {
                    link = (
                        <Link
                            onClick={() => {
                                setOpenKeys([]);
                            }}
                            to={item.path}
                        >
                            {item.title ?? item.permission}
                        </Link>
                    );
                }

                if (handleCheckPermission(item.moduleCode)) {
                    let rootKey = item.path || `item_${index}`;
                    if (seenKeys.has(rootKey)) {
                        rootKey = `${rootKey}_${index}`;
                    }
                    seenKeys.add(rootKey);

                    items.push({
                        key: rootKey,
                        icon: item.icon,
                        label: link,
                        className:
                            activeRoute(item.path) +
                            " " +
                            (item.className ?? ""),
                        id: item.id,
                        onClick: () => {
                            if (width < 768) {
                                setSideMenuCollapse(true);
                            }
                        },
                    });
                }
            }
        });

        return items;
    };

    return (
        <Layout.Sider trigger={null} collapsible collapsed={sideMenuCollapse}>
            <div className="ant-side-header">
                <MenuUnfoldOutlined
                    id="btn_sidemenu_collapse_unfold"
                    onClick={() => {
                        setSideMenuCollapse(false);
                        setTimeout(() => {
                            setOpenKeys(
                                menuItems
                                    .filter((item) => item.path === pathname)
                                    .map((item) => item.path),
                            );
                        }, 200);
                    }}
                    style={{ display: sideMenuCollapse ? "block" : "none" }}
                />
                <MenuFoldOutlined
                    id="btn_sidemenu_collapse_fold"
                    onClick={() => {
                        setSideMenuCollapse(true);
                    }}
                    style={{ display: !sideMenuCollapse ? "block" : "none" }}
                />

                <div className="logo_wrapper">
                    {!sideMenuCollapse && (
                        <>
                            <img
                                src={appLogoFullWidth}
                                alt={appName}
                                width="150px"
                            />
                            <div className="mt-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-center">
                                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                                    Simulated Role
                                </span>
                                <span className="text-xs font-semibold text-blue-700 block truncate">
                                    {currentRole}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Menu
                theme="light"
                mode="inline"
                openKeys={openKeys}
                selectedKeys={[pathname]}
                onOpenChange={onOpenChange}
                items={handleMenuRender()}
            />
        </Layout.Sider>
    );
}
