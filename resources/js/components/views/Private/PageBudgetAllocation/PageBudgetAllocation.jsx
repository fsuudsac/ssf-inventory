import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Col, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClockRotateLeft,
    faMoneyBillWave,
} from "@fortawesome/pro-regular-svg-icons";

import CustomTabs from "../../../providers/CustomTabs";
import useWindowDimensions from "../../../providers/useWindowDimensions";
import HistoricalDataContent from "../PageHistoricalData/components/HistoricalDataContent";
import PageBudgetAllocationContent from "./components/PageBudgetAllocationContent";

export default function PageBudgetAllocation() {
    const location = useLocation();
    const { width } = useWindowDimensions();

    const [activeTab, setActiveTab] = useState("0");

    const items = [
        {
            key: "0",
            label: "Budget Allocation",
            icon: <FontAwesomeIcon icon={faMoneyBillWave} />,
            iconSize: 23,
            children: (
                <PageBudgetAllocationContent
                    width={width}
                    location={location}
                />
            ),
        },
        {
            key: "1",
            label: "Historical Data",
            icon: <FontAwesomeIcon icon={faClockRotateLeft} />,
            iconSize: 27,
            children: (
                <HistoricalDataContent
                    width={width}
                    historicalable_type={[
                        "App\\Models\\RefDepartmentAllocation",
                    ]}
                    from="PageBudgetAllocation"
                />
            ),
        },
    ];

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <CustomTabs
                    activeKey={activeTab}
                    items={items.map((item) => ({
                        ...item,
                        children: null,
                    }))}
                    onChange={(key) => {
                        setActiveTab(key);
                    }}
                />
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                {items[Number(activeTab)]?.children}
            </Col>
        </Row>
    );
}
