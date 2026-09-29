import { useEffect, useState } from "react";
import { Col, DatePicker, Row } from "antd";

import { GET } from "../../../../providers/useAxiosQuery";

export default function PageReportSalesRevenue() {
    const [filter, setFilter] = useState({
        date_range: [],
    });

    const { data: dataSalesRevenue, refetch: refetchSalesRevenue } = GET(
        `api/sales_revenue?${new URLSearchParams(filter)}`,
        "sales_revenue_list"
    );

    useEffect(() => {
        refetchSalesRevenue();

        return () => {};
    }, [filter]);

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={8} lg={6} xl={6}>
                <DatePicker.RangePicker
                    format="YYYY-MM-DD"
                    style={{ width: "100%" }}
                    onChange={(date, dateString) => {
                        setFilter((ps) => ({ ...ps, date_range: dateString }));
                    }}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}></Col>
        </Row>
    );
}
