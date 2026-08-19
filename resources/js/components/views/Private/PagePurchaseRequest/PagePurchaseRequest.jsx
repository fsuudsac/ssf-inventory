import { useState } from "react";
import { Col, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClockRotateLeft,
    faShoppingCart,
} from "@fortawesome/pro-regular-svg-icons";

import useWindowDimensions from "../../../providers/useWindowDimensions";
import HistoricalDataContent from "../PageHistoricalData/components/HistoricalDataContent";
import CustomTabs from "../../../providers/CustomTabs";

export default function PagePurchaseRequest() {
    const { width } = useWindowDimensions();

    const [activeKey, setActiveKey] = useState("0");

    const items = [
        {
            key: "0",
            label: "Purchase Requests",
            icon: <FontAwesomeIcon icon={faShoppingCart} />,
            iconSize: 25,
            // children:
        },
        {
            key: "1",
            label: "Historical Data",
            icon: <FontAwesomeIcon icon={faClockRotateLeft} />,
            iconSize: 27,
            children: (
                <HistoricalDataContent
                    width={width}
                    historicalable_type={["App\\Models\\PurchaseRequest"]}
                />
            ),
        },
    ];

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24}>
                <CustomTabs
                    activeKey={activeKey}
                    items={items.map((item) => ({
                        ...item,
                        children: null,
                    }))}
                    onChange={(key) => {
                        setActiveKey(key);
                    }}
                />
            </Col>

            <Col xs={24} sm={24} md={24} lg={24}>
                {items[Number(activeKey)]?.children}
            </Col>
        </Row>
    );
}
