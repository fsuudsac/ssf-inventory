import { useEffect, useState } from "react";
import { Button, Col, Result, Row, Tabs, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrochip, faShieldHalved } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../providers/useAxiosQuery";
import TabPermissionUserRole from "./components/TabPermissionUserRole";
import TabPermissionUser from "./components/TabPermissionUser";
import CustomTabs from "../../../providers/CustomTabs";

const DEFAULT_ROLES = [
    { value: "1", label: "Super Admin" },
    { value: "2", label: "Admin" },
    { value: "3", label: "Staff" },
    { value: "4", label: "Department User" },
    { value: "5", label: "Finance Office" },
];

export default function PagePermission() {
    const navigate = useNavigate();
    const [tabParentActive, setTabParentActive] = useState("0");
    const [selectedUserRole, setSelectedUserRole] = useState("1");
    const [currentSimulatedRole, setCurrentSimulatedRole] = useState(
        localStorage.getItem("simulated_role") || "PMO/VPASA (Admin)"
    );

    useEffect(() => {
        const handleRoleChange = (e) => {
            setCurrentSimulatedRole(e?.detail || localStorage.getItem("simulated_role") || "PMO/VPASA (Admin)");
        };
        window.addEventListener("role_changed", handleRoleChange);
        return () => window.removeEventListener("role_changed", handleRoleChange);
    }, []);

    // Access control: Only Super Admin and Admin roles are authorized
    const isAuthorized =
        currentSimulatedRole.includes("Admin") ||
        currentSimulatedRole.includes("Super Admin") ||
        currentSimulatedRole.includes("PMO") ||
        currentSimulatedRole.includes("VPASA");

    const [optionUserType, setOptionUserType] = useState(DEFAULT_ROLES);

    GET(
        `api/user_role?sort_field=id&sort_order=asc`,
        "user_role_dropdown",
        (res) => {
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                setOptionUserType(
                    res.data.map((item) => ({
                        value: `${item.id}`,
                        label: item.role,
                    })),
                );
            }
        },
        false,
    );

    if (!isAuthorized) {
        return (
            <Row justify="center" align="middle" style={{ minHeight: "60vh" }}>
                <Col xs={24} sm={20} md={16} lg={12}>
                    <Result
                        status="403"
                        title="Access Denied"
                        subTitle={`Your current active role (${currentSimulatedRole}) does not have permission to view or modify system permissions. Only Super Admin and Admin roles are authorized to access this module.`}
                        extra={
                            <Button
                                type="primary"
                                onClick={() => navigate("/dashboard")}
                            >
                                Back to Dashboard
                            </Button>
                        }
                    />
                </Col>
            </Row>
        );
    }

    const items = [
        {
            key: "0",
            label: "User Role",
            icon: <FontAwesomeIcon icon={faMicrochip} />,
            iconSize: 25,
            children: (
                <Tabs
                    activeKey={selectedUserRole}
                    onChange={(key) => setSelectedUserRole(key)}
                    items={optionUserType.map((item) => ({
                        key: item.value,
                        label: item.label,
                        children: (
                            <TabPermissionUserRole
                                tabParentActive="UserRole"
                                userRole={item.value}
                                userRoleName={item.label}
                            />
                        ),
                    }))}
                />
            ),
        },
        {
            key: "1",
            label: "Users",
            icon: <FontAwesomeIcon icon={faShieldHalved} />,
            iconSize: 25,
            children: (
                <TabPermissionUser
                    tabParentActive="Users"
                    userRole={selectedUserRole}
                />
            ),
        },
    ];

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <CustomTabs
                    activeKey={tabParentActive}
                    onTabClick={(key) => {
                        setTabParentActive(key);
                    }}
                    items={items.map((item) => ({
                        ...item,
                        children: null,
                    }))}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                {items[parseInt(tabParentActive, 10)]?.children}
            </Col>
        </Row>
    );
}
