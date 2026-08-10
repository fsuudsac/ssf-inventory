import { Collapse, Flex, Table } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../../providers/useAxiosQuery";
import dayjs from "dayjs";
import formatToCurrency from "../../../../providers/formatToCurrency";

export default function SalesDueList() {
    const { data: dataPaymentDueSales } = GET(
        `api/sales?from=DashboardPaymentDueList&sort_field=date_due&sort_order=asc&limit=5`,
        "sales_due_list",
        (res) => {
            if (res.data) {
                console.log("purchases: ", res.data);
            }
        },
        false,
    );

    return (
        <Collapse
            className="collapse-main-primary collapse-payment-due-list"
            defaultActiveKey={["0", "1"]}
            size="large"
            expandIcon={({ isActive }) => (
                <FontAwesomeIcon icon={isActive ? faAngleUp : faAngleDown} />
            )}
            items={[
                {
                    key: "0",
                    label: "SALES DUE",
                    children: (
                        <Table
                            className="ant-table-default ant-table-striped"
                            dataSource={
                                dataPaymentDueSales
                                    ? dataPaymentDueSales.data
                                    : []
                            }
                            rowKey={(record) => record.id}
                            pagination={false}
                            bordered={false}
                            scroll={{ x: "max-content" }}
                            rowClassName={(record, index) => {
                                let dateDueColor = "";

                                if (
                                    record.date_due <=
                                    dayjs().format("YYYY-MM-DD")
                                ) {
                                    dateDueColor = "tr-due-date";
                                }

                                return dateDueColor;
                            }}
                            onRow={(record, rowIndex) => {
                                return {
                                    onClick: (event) => {
                                        console.log("record: ", record);
                                    },
                                };
                            }}
                        >
                            <Table.Column
                                width={150}
                                title="Release Item Info"
                                key="sales_info"
                                render={(text, record) => {
                                    return (
                                        <Flex vertical={true}>
                                            <span>{record.invoice_no}</span>
                                            <span>{record.customer_name}</span>
                                        </Flex>
                                    );
                                }}
                            />

                            <Table.Column
                                width={150}
                                title="Due Date"
                                key="date_due_format"
                                dataIndex="date_due_format"
                            />

                            <Table.Column
                                width={150}
                                title="Amount Due"
                                key="net_amount_due"
                                dataIndex="net_amount_due"
                                align="center"
                                render={(text, _) =>
                                    `₱ ${formatToCurrency(text)}`
                                }
                            />
                        </Table>
                    ),
                },
            ]}
        />
    );
}
