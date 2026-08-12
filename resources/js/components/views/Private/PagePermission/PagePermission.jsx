import { Row, Col, Tabs } from "antd";

import TabPermissionUserRole from "./components/TabPermissionUserRole";
import TabPermissionUser from "./components/TabPermissionUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldCheck, faUser } from "@fortawesome/pro-regular-svg-icons";

export default function PagePermission() {
    return (
        <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24}>
                <Tabs
                    defaultActiveKey="user_role"
                    type="card"
                    items={[
                        {
                            key: "user_role",
                            label: "User Role",
                            icon: <FontAwesomeIcon icon={faShieldCheck} />,
                            children: <TabPermissionUserRole />,
                        },
                        {
                            key: "users",
                            label: "Users",
                            icon: <FontAwesomeIcon icon={faUser} />,
                            children: <TabPermissionUser />,
                        },
                    ]}
                />
            </Col>
        </Row>
    );
}
