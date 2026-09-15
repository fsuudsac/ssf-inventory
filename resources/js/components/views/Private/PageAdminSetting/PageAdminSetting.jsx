import { useState } from "react";
import { Col, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBox,
    faBuilding,
    faCalendarDays,
    faClockRotateLeft,
    faDollarSign,
    faMoneyBillWave,
} from "@fortawesome/pro-regular-svg-icons";

import PageProductType from "./PageProductType/PageProductType";
import PageProductCategory from "./PageProductCategory/PageProductCategory";
import PageProductSize from "./PageProductSize/PageProductSize";
import PageCreditTerms from "./PageCreditTerms/PageCreditTerms";
import PageEwtType from "./PageEwtType/PageEwtType";
import PageDepartment from "./PageDepartment/PageDepartment";
import HistoricalDataContent from "../PageHistoricalData/components/HistoricalDataContent";
import useWindowDimensions from "../../../providers/useWindowDimensions";
import CustomTabs from "../../../providers/CustomTabs";
import PageAllocationType from "./PageAllocationType/PageAllocationType";

export default function PageAdminSetting() {
    const { width } = useWindowDimensions();

    const [activeKey, setActiveKey] = useState("0");

    const items = [
        {
            key: "0",
            label: "Department",
            icon: <FontAwesomeIcon icon={faBuilding} />,
            iconSize: 23,
            children: <PageDepartment />,
        },
        {
            key: "1",
            label: "Product Type",
            icon: <FontAwesomeIcon icon={faBox} />,
            iconSize: 23,
            children: <PageProductType />,
        },
        {
            key: "2",
            label: "Product Category",
            icon: <FontAwesomeIcon icon={faBox} />,
            iconSize: 23,
            children: <PageProductCategory />,
        },
        {
            key: "3",
            label: "Product Size",
            icon: <FontAwesomeIcon icon={faBox} />,
            iconSize: 23,
            children: <PageProductSize />,
        },
        {
            key: "4",
            label: "Credit Terms",
            icon: <FontAwesomeIcon icon={faCalendarDays} />,
            iconSize: 23,
            children: <PageCreditTerms />,
        },
        {
            key: "5",
            label: "EWT Type",
            icon: <FontAwesomeIcon icon={faDollarSign} />,
            iconSize: 23,
            children: <PageEwtType />,
        },
        {
            key: "6",
            label: "Allocation Type",
            icon: <FontAwesomeIcon icon={faMoneyBillWave} />,
            iconSize: 23,
            children: <PageAllocationType />,
        },
        {
            key: "7",
            label: "Historical Data",
            icon: <FontAwesomeIcon icon={faClockRotateLeft} />,
            iconSize: 27,
            children: (
                <HistoricalDataContent
                    width={width}
                    historicalable_type={[
                        "App\\Models\\RefDepartment",
                        "App\\Models\\ProductType",
                        "App\\Models\\ProductCategory",
                        "App\\Models\\ProductSize",
                        "App\\Models\\CreditTerm",
                        "App\\Models\\EwtType",
                    ]}
                />
            ),
        },
    ];

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24}>
                <CustomTabs
                    activeKey={activeKey}
                    onChange={(key) => setActiveKey(key)}
                    items={items.map((item) => ({
                        ...item,
                        children: null,
                    }))}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24}>
                {items[Number(activeKey)]?.children}
            </Col>
        </Row>
    );
}
