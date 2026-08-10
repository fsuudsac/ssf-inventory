import { useEffect, useState } from "react";
import {
    Button,
    Col,
    Collapse,
    DatePicker,
    Flex,
    Form,
    Row,
    Typography,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { GET } from "../../../../providers/useAxiosQuery";
import formatToCurrency from "../../../../providers/formatToCurrency";
import ModalGeneralReportPdf from "./ModalGeneralReportPdf";

export default function ReportStatementOfProfitOrLoss() {
    const [toggleModalGeneralReportPdf, setToggleModalGeneralReportPdf] =
        useState({
            open: false,
            data: null,
        });

    const [filter, setFilter] = useState({
        start_date: "",
        end_date: "",
        product_detail_id: "",
    });

    const [total, setTotal] = useState({
        revenue: 0,
        discount: 0,
        net_sales: 0,
        cost_of_goods_sold: 0,
        gross_margin: 0,
    });

    const {
        refetch: refetchRevenue,
        isLoading: isLoadingRevenue,
        isFetching: isFetchingRevenue,
    } = GET(
        `api/revenue_snap_shot?${new URLSearchParams(filter)}`,
        `revenue_snap_shot`,
        (res) => {
            if (res.data) {
                let data = res.data;

                let revenue = data.reduce((acc, curr) => {
                    return acc + Number(curr.total_amount_payable);
                }, 0);

                let discount = data.reduce((acc, curr) => {
                    return acc + Number(curr.discount);
                }, 0);

                let net_sales = revenue - discount;

                let cost_of_goods_sold = data.reduce((acc, curr) => {
                    let total = 0;

                    curr.sales_order_details.forEach((item) => {
                        total += Number(item.quantity) * Number(item.orig_cost);
                    });

                    return acc + total;
                }, 0);

                let gross_margin = net_sales - cost_of_goods_sold;

                setTotal({
                    revenue: revenue,
                    discount: discount,
                    net_sales: net_sales,
                    cost_of_goods_sold: cost_of_goods_sold,
                    gross_margin: gross_margin,
                });
            }
        }
    );

    useEffect(() => {
        refetchRevenue();

        return () => {};
    }, [filter]);

    const onFinish = (values) => {
        let transaction_date = values;

        let data = {
            start_date: dayjs(transaction_date[0]).format("YYYY-MM-DD"),
            end_date: dayjs(transaction_date[1]).format("YYYY-MM-DD"),
            product_detail_id: values.product_detail_id ?? "",
        };

        setFilter(data);
    };

    const handlePrint = () => {
        setToggleModalGeneralReportPdf({
            open: true,
            data: filter,
        });
    };

    return (
        <Collapse
            className="collapse-main-primary"
            defaultActiveKey={["1", "2", "3"]}
            size="large"
            expandIconPosition="end"
            expandIcon={({ isActive }) => (
                <FontAwesomeIcon icon={isActive ? faAngleUp : faAngleDown} />
            )}
            items={[
                {
                    key: "1",
                    label: "Statement of Profit or Loss",
                    children: (
                        <Row gutter={[20, 20]}>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                <DatePicker.RangePicker
                                    className="w-100"
                                    placeholder={["Start Date", "End Date"]}
                                    onChange={(value) => {
                                        onFinish(value);
                                    }}
                                />
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                <Flex justify="space-between">
                                    <Typography.Text strong>
                                        Revenue:
                                    </Typography.Text>

                                    <Typography.Text strong>
                                        <span
                                            style={{
                                                color: "#4988fa",
                                                marginRight: 10,
                                            }}
                                        >
                                            ₱ {formatToCurrency(total.revenue)}
                                        </span>
                                    </Typography.Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Typography.Text strong>
                                        Less: Discount
                                    </Typography.Text>

                                    <Typography.Text strong>
                                        <span
                                            style={{
                                                color: "#4988fa",
                                                marginRight: 10,
                                            }}
                                        >
                                            ₱ {formatToCurrency(total.discount)}
                                        </span>
                                    </Typography.Text>
                                </Flex>
                                <Flex
                                    justify="space-between"
                                    className="bb-2 bg-grey "
                                >
                                    <Typography.Text strong>
                                        Net Sales:
                                    </Typography.Text>

                                    <Typography.Text strong>
                                        {"( "}
                                        <span
                                            style={{
                                                color: "#4988fa",
                                            }}
                                        >
                                            ₱{" "}
                                            {formatToCurrency(total.net_sales)}
                                        </span>
                                        {" )"}
                                    </Typography.Text>
                                </Flex>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                <Flex justify="space-between">
                                    <Typography.Text strong>
                                        Cost of Goods Sold:
                                    </Typography.Text>

                                    <Typography.Text strong>
                                        <span
                                            style={{
                                                color: "#4988fa",
                                                marginRight: 10,
                                            }}
                                        >
                                            ₱{" "}
                                            {formatToCurrency(
                                                total.cost_of_goods_sold
                                            )}
                                        </span>
                                    </Typography.Text>
                                </Flex>
                                <Flex
                                    justify="space-between"
                                    className="bb-2 bg-grey"
                                >
                                    <Typography.Text strong>
                                        GROSS MARGIN:
                                    </Typography.Text>

                                    <Typography.Text strong>
                                        {"( "}
                                        <span
                                            style={{
                                                color: "#4988fa",
                                            }}
                                        >
                                            ₱{" "}
                                            {formatToCurrency(
                                                total.gross_margin
                                            )}
                                        </span>
                                        {" )"}
                                    </Typography.Text>
                                </Flex>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                <Button
                                    type="primary"
                                    loading={
                                        isLoadingRevenue || isFetchingRevenue
                                    }
                                    onClick={handlePrint}
                                    disabled={filter.start_date === ""}
                                >
                                    Print
                                </Button>
                            </Col>

                            <ModalGeneralReportPdf
                                toggleModalGeneralReportPdf={
                                    toggleModalGeneralReportPdf
                                }
                                setToggleModalGeneralReportPdf={
                                    setToggleModalGeneralReportPdf
                                }
                            />
                        </Row>
                    ),
                },
            ]}
        />
    );
}
