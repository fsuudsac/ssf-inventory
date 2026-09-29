import { useState } from "react";
import { Col, Row, Tabs } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faUser } from "@fortawesome/pro-regular-svg-icons";

import TabItemSupplier from "./components/TabItemSupplier";
import TabItemCustomer from "./components/TabItemCustomer";
import CustomTabs from "../../../providers/CustomTabs";
import useWindowDimensions from "../../../providers/useWindowDimensions";

export default function PageReportLedger() {
    const { width } = useWindowDimensions();

    const [activeTab, setActiveTab] = useState("0");

    const items = [
        {
            key: "0",
            label: "Supplier",
            icon: <FontAwesomeIcon icon={faBuilding} />,
            iconSize: 25,
            children: <TabItemSupplier width={width} />,
        },
        {
            key: "1",
            label: "Customer",
            icon: <FontAwesomeIcon icon={faUser} />,
            iconSize: 25,
            children: <TabItemCustomer width={width} />,
        },
    ];

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <CustomTabs
                    activeKey={activeTab}
                    onChange={(key) => {
                        setActiveTab(key);
                    }}
                    items={items.map((item) => ({
                        ...item,
                        children: null,
                    }))}
                />
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                {items[Number(activeTab)]?.children}
            </Col>
        </Row>
    );
}
