import { Card, Col, Row } from "antd";

import RevenueSnapShot from "./RevenueSnapShot";

export default function ReportCollapseItemSnapShot() {
    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={12} lg={6} xl={6}>
                <Card title="Revenue Snap Shot">
                    <RevenueSnapShot />
                </Card>
            </Col>
            <Col xs={24} sm={24} md={12} lg={6} xl={6}></Col>
            <Col xs={24} sm={24} md={12} lg={6} xl={6}></Col>
        </Row>
    );
}
