import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, Col, Row, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faClockRotateLeft,
    faMoneyBillWave,
} from "@fortawesome/pro-regular-svg-icons";

import PageBudgetAllocationDepartmentContext from "./PageBudgetAllocationDepartmentContext";
import { GET } from "../../../../../providers/useAxiosQuery";
import useWindowDimensions from "../../../../../providers/useWindowDimensions";
import CustomTabs from "../../../../../providers/CustomTabs";
import HistoricalDataContent from "../../../PageHistoricalData/components/HistoricalDataContent";
import PageBudgetAllocationDepartmentContent from "./components/PageBudgetAllocationDepartmentContent";

export default function PageBudgetAllocationDepartment(props) {
    const { dataPermissions, moduleCode } = props;
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { width } = useWindowDimensions();

    const [activeTab, setActiveTab] = useState("0");

    const { data: dataDepartment } = GET(
        `api/department/${params.id}`,
        "department",
    );

    const allowedButtons = {};
    if (Array.isArray(dataPermissions) && moduleCode) {
        const mod = dataPermissions.find((f) => f.module_code === moduleCode);
        if (mod && Array.isArray(mod.module_buttons)) {
            mod.module_buttons.forEach((btn) => {
                allowedButtons[btn.mod_button_code] =
                    parseInt(btn.status) === 1;
            });
        }
    }

    const items = [
        {
            key: "0",
            label: "Department Allocation",
            icon: <FontAwesomeIcon icon={faMoneyBillWave} />,
            iconSize: 23,
            children: <PageBudgetAllocationDepartmentContent />,
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
                    department_id={params.id}
                />
            ),
        },
    ];

    const department = dataDepartment?.data;

    return (
        <PageBudgetAllocationDepartmentContext.Provider
            value={{
                location,
                width,
                department: department,
                allowedButtons: allowedButtons,
            }}
        >
            <Card>
                <Row gutter={[20, 20]}>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Button
                            type="default"
                            icon={<FontAwesomeIcon icon={faArrowLeft} />}
                            onClick={() => navigate("/budget-allocation")}
                        >
                            Back
                        </Button>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Typography.Title level={3}>
                            {department?.abbr} - {department?.department_name}
                        </Typography.Title>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24}>
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

                    <Col xs={24} sm={24} md={24} lg={24}>
                        {items[Number(activeTab)]?.children}
                    </Col>
                </Row>
            </Card>
        </PageBudgetAllocationDepartmentContext.Provider>
    );
}
