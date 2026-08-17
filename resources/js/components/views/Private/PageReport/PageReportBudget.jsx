import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Col, Row } from "antd";

import CustomCollapse from "../../../providers/CustomCollapse";
import useWindowDimensions from "../../../providers/useWindowDimensions";
import CollapseItemBudgetPerformance from "./PageReportBudget/CollapseItemBudgetPerformance";

export default function PageReportBudget() {
    const { width } = useWindowDimensions();
    const location = useLocation();

    const [activeKey, setActiveKey] = useState(["1"]);

    const sharedProps = {
        width,
        location,
    };

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24}>
                <CustomCollapse
                    activeKey={activeKey}
                    onChange={setActiveKey}
                    items={[
                        {
                            key: "1",
                            label: "Budget Performance",
                            children: (
                                <CollapseItemBudgetPerformance
                                    {...sharedProps}
                                />
                            ),
                        },
                    ]}
                />
            </Col>
        </Row>
    );
}
