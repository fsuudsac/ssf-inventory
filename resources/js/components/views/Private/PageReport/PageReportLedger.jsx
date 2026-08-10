import { Col, Row, Tabs } from "antd";

import TabItemSupplier from "./components/TabItemSupplier";
import TabItemCustomer from "./components/TabItemCustomer";

export default function PageReportLedger() {
    const items = [
        {
            key: "1",
            label: "Supplier",
            children: <TabItemSupplier />,
        },
        {
            key: "2",
            label: "Customer",
            children: <TabItemCustomer />,
        },
    ];

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Tabs defaultActiveKey="1" items={items} />
            </Col>
        </Row>
    );
}
