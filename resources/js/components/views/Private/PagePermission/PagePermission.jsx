import { Row, Col, Tabs } from "antd";

import TabPermissionModule from "./components/TabPermissionModule";
import TabPermissionUserRole from "./components/TabPermissionUserRole";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrochip } from "@fortawesome/pro-regular-svg-icons";

export default function PagePermission() {
    return (
        <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24}>
                <Tabs
                    defaultActiveKey="0"
                    type="card"
                    items={[
                        {
                            key: "0",
                            label: "Module",
                            icon: <FontAwesomeIcon icon={faMicrochip} />,
                            children: <TabPermissionModule />,
                        },
                        {
                            key: "1",
                            label: "User Role",
                            icon: <FontAwesomeIcon icon={faMicrochip} />,
                            children: <TabPermissionUserRole />,
                        },
                    ]}
                />
            </Col>
        </Row>
    );
}
