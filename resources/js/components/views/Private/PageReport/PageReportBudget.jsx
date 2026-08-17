import { Col, Row } from "antd";
import FloatRangePicker from "../../../providers/FloatRangePicker";

export default function PageReportBudget() {
    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24}>
                <Row gutter={[12, 12]}>
                    <Col xs={24} sm={24} md={6}>
                        <FloatRangePicker
                            label="Date Range"
                            placeholder="Date Range"
                            picker="date"
                            format="MM/DD/YYYY"
                        />
                    </Col>
                </Row>
            </Col>
        </Row>
    );
}
