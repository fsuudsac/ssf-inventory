import { useContext, useEffect, useState } from "react";
import { Button, Col, DatePicker, Form, Row, Select, Typography } from "antd";
import dayjs from "dayjs";

import { POST } from "../../../../providers/useAxiosQuery";
import formatToCurrency from "../../../../providers/formatToCurrency";
import PageReportContext from "./PageReportContext";

export default function RevenueSnapShot() {
    const { dataProductDetails } = useContext(PageReportContext);

    const [filter, setFilter] = useState({
        start_date: "",
        end_date: "",
        product_detail_id: "",
    });
    const { data: dataRevenue, refetch: refetchRevenue } = GET(
        `api/revenue_snap_shot`,
        `revenue_snap_shot`,
    );

    useEffect(() => {
        refetchRevenue();

        return () => {};
    }, [filter]);

    const onFinish = (values) => {
        let transaction_date = values.transaction_date;

        let data = {
            start_date: dayjs(transaction_date[0]).format("YYYY-MM-DD"),
            end_date: dayjs(transaction_date[1]).format("YYYY-MM-DD"),
            product_detail_id: values.product_detail_id,
        };

        setFilter(data);
    };

    return (
        <Form onFinish={onFinish}>
            <Row gutter={[20, 0]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item name="transaction_date">
                        <DatePicker.RangePicker
                            className="w-100"
                            placeholder={["Start Date", "End Date"]}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item name="product_detail_id">
                        <Select
                            className="w-100"
                            options={dataProductDetails.map((item) => {
                                let product_type = item.product_type
                                    ? ` - (${item.product_type})`
                                    : "";
                                let product_size = item.product_size
                                    ? ` - (${item.product_size})`
                                    : "";

                                return {
                                    label: `${item.product_name}${product_type}${product_size}`,
                                    value: item.id,
                                };
                            })}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Button
                        htmlType="submit"
                        loading={isLoadingRevenueSnapShot}
                    >
                        Submit
                    </Button>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <div className="mt-20">
                        <Typography.Text strong>
                            Total Revenue:{" "}
                            <span style={{ color: "#0026A0" }}>
                                ₱{" "}
                                {dataRevenue && dataRevenue.data
                                    ? formatToCurrency(
                                          dataRevenue && dataRevenue.data
                                              ? dataRevenue.data.reduce(
                                                    (acc, curr) => {
                                                        let total = 0;

                                                        curr.sales_order_details.forEach(
                                                            (item) => {
                                                                total +=
                                                                    Number(
                                                                        item.quantity,
                                                                    ) *
                                                                    Number(
                                                                        item.price,
                                                                    );
                                                            },
                                                        );

                                                        return acc + total;
                                                    },
                                                )
                                              : 0,
                                      )
                                    : "0.00"}
                            </span>
                        </Typography.Text>
                    </div>
                </Col>
            </Row>
        </Form>
    );
}
