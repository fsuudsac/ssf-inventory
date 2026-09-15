import { useState } from "react";
import { Col, Row, Tabs } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrochip } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../providers/useAxiosQuery";
import TabPermissionUserRole from "./components/TabPermissionUserRole";
import TabPermissionUser from "./components/TabPermissionUser";
import CustomTabs from "../../../providers/CustomTabs";

export default function PagePermission() {
    const [tabParentActive, setTabParentActive] = useState("0");
    const [selectedUserRole, setSelectedUserRole] = useState("1");

    const [optionUserType, setOptionUserType] = useState([]);

    GET(
        `api/user_role?sort_field=id&sort_order=asc`,
        "user_role_dropdown",
        (res) => {
            if (res.data) {
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

    const items = [
        {
            key: "0",
            label: "User Role",
            icon: <FontAwesomeIcon icon={faMicrochip} />,
            iconSize: 25,
            children: (
                <Tabs
                    defaultActiveKey="1"
                    onTabClick={(key) => setSelectedUserRole(key)}
                    items={optionUserType.map((item) => ({
                        key: item.value,
                        label: item.label,
                        children: (
                            <TabPermissionUserRole
                                tabParentActive="UserRole"
                                userRole={selectedUserRole}
                            />
                        ),
                    }))}
                />
            ),
        },
        {
            key: "1",
            label: "Users",
            icon: <FontAwesomeIcon icon={faMicrochip} />,
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
        <Row>
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
                {items[tabParentActive].children}
            </Col>
        </Row>
    );
}
