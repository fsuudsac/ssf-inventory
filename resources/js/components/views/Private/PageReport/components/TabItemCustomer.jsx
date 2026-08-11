import { useEffect, useState } from "react";
import { Button, Col, DatePicker, Flex, Row, Form, Table } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";
import formatToCurrency from "../../../../providers/formatToCurrency";
import FloatSelect from "../../../../providers/FloatSelect";
import ModalCustomerLedger from "./ModalCustomerLedger";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";
import FloatRangePicker from "../../../../providers/FloatRangePicker";

export default function TabItemCustomer(props) {
    const { width } = props;

    const [form] = Form.useForm();

    const [toggleModalCustomerLedger, setToggleModalCustomerLedger] = useState({
        open: false,
        data: null,
    });

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_order: "desc",
        sort_field: "date_transaction_format",
        customer_id: [],
        date_sales: [],
        date_sales_string: [],
    });

    const { data: dataCustomer } = GET(
        `api/users?roles=Customer`,
        "user_list_customer",
    );

    // console.log("dataCustomer: ", dataCustomer);

    const { data: dataLedger, refetch: refetchLedger } = GET(
        `api/report_ledger_customer?${new URLSearchParams(tableFilter)}`,
        "report_ledger_customer",
    );

    useEffect(() => {
        refetchLedger();

        return () => {};
    }, [tableFilter]);

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((prevState) => ({
            ...prevState,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    useTableScrollOnTop("tbl_ledger_customer", "tbl_ledger_customer");

    return (
        <Row gutter={[20, 20]} id="tbl_wrapper_ledger_customer">
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Row gutter={[12, 12]}>
                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                        <FloatSelect
                            label="Customer"
                            placeholder="Customer"
                            mode="multiple"
                            options={
                                dataCustomer && dataCustomer.data
                                    ? dataCustomer.data.map((item) => ({
                                          value: item.id,
                                          label: item.fullname,
                                      }))
                                    : []
                            }
                            value={
                                tableFilter.customer_id
                                    ? tableFilter.customer_id
                                    : null
                            }
                            onChange={(value) => {
                                setTableFilter((ps) => ({
                                    ...ps,
                                    customer_id: value,
                                }));
                            }}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                        <FloatRangePicker
                            label="Date Sales"
                            placeholder="Date Sales"
                            value={tableFilter.date_purchased}
                            onChange={(date, dateString) => {
                                setTableFilter((ps) => ({
                                    ...ps,
                                    date_sales: date,
                                    date_sales_string: dateString,
                                }));
                            }}
                        />
                    </Col>
                </Row>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Flex
                    justify="space-between"
                    align="center"
                    className="tbl-top-filter"
                >
                    <Flex align="center" gap={15}>
                        <Button
                            type="primary"
                            className={width < 576 ? "w-full" : "min-w-[150px]"}
                            icon={<FontAwesomeIcon icon={faDownload} />}
                            iconPosition="end"
                            onClick={() => {
                                setToggleModalCustomerLedger({
                                    open: true,
                                    data: {
                                        customer_id: tableFilter.customer_id,
                                        date_range:
                                            tableFilter.date_sales_string,
                                    },
                                });
                            }}
                        >
                            Export Pdf
                        </Button>
                        {/* <Button
                            type="primary"
                            icon={<FontAwesomeIcon icon={faDownload} />}
                            iconPosition="end"
                        >
                            Export Excel
                        </Button> */}
                    </Flex>

                    <TablePageSize
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Flex
                    justify="space-between"
                    align="center"
                    className="tbl-top-filter"
                >
                    <TableGlobalSearchAnimated
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />

                    <Flex align="center" gap={15}>
                        <TableShowingEntriesV2 />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={dataLedger ? dataLedger.data.total : 0}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper="tbl_wrapper_ledger_customer"
                        />
                    </Flex>
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Table
                    id="tbl_ledger_customer"
                    className="ant-table-default ant-table-striped"
                    dataSource={
                        dataLedger && dataLedger.data && dataLedger.data.data
                            ? [
                                  ...dataLedger.data.data,
                                  //   {
                                  //       id: -1,
                                  //       fullname: "",
                                  //       invoice_no: "",
                                  //       amount: dataLedger.data.data.reduce(
                                  //           (acc, curr) =>
                                  //               acc + Number(curr.amount),
                                  //           0
                                  //       ),
                                  //       created_at_formatted: "",
                                  //   },
                              ]
                            : []
                    }
                    rowKey={(record) => record.id}
                    pagination={false}
                    bordered={false}
                    onChange={onChangeTable}
                    scroll={{ x: "max-content" }}
                    sticky
                >
                    <Table.Column
                        width={150}
                        title="Invoice No"
                        key="invoice_no"
                        dataIndex="invoice_no"
                    />

                    <Table.Column
                        width={180}
                        title="Customer Name"
                        key="customer_name"
                        dataIndex="customer_name"
                    />

                    <Table.Column
                        width={200}
                        title="Date of Transaction"
                        key="date_transaction_format"
                        dataIndex="date_transaction_format"
                    />

                    <Table.Column
                        width={150}
                        title="Customer Type"
                        key="customer_type"
                        dataIndex="customer_type"
                    />

                    <Table.Column
                        width={120}
                        title="Terms"
                        key="terms"
                        dataIndex="terms"
                    />
                    <Table.Column
                        width={150}
                        title="Amount Receivable"
                        key="net_amount_due"
                        dataIndex="net_amount_due"
                        render={(text) => `₱ ${formatToCurrency(text)}`}
                    />
                    <Table.Column
                        width={150}
                        title="Amount Collected"
                        key="amount"
                        dataIndex="amount"
                        render={(text, record) => {
                            let amount = 0;

                            if (record.terms === "Cash") {
                                amount = record.net_amount_due;
                            } else {
                                amount =
                                    record.sales_payments &&
                                    record.sales_payments.reduce(
                                        (acc, payment) =>
                                            acc + Number(payment.amount),
                                        0,
                                    );
                            }

                            return `₱ ${formatToCurrency(amount)}`;
                        }}
                    />
                    <Table.Column
                        width={150}
                        title="Balance"
                        key="balance"
                        dataIndex="balance"
                        render={(text, record) => {
                            let amount = 0;

                            if (record.terms === "Credit") {
                                let sales_payments =
                                    record.sales_payments &&
                                    record.sales_payments.reduce(
                                        (acc, payment) =>
                                            acc + Number(payment.amount),
                                        0,
                                    );

                                amount = record.net_amount_due - sales_payments;
                            }

                            return `₱ ${formatToCurrency(amount)}`;
                        }}
                    />
                </Table>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Flex
                    justify="space-between"
                    align="center"
                    className="tbl-bottom-filter"
                >
                    <div />

                    <Flex align="center" gap={15}>
                        <TableShowingEntriesV2 />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={dataLedger ? dataLedger.data.total : 0}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper="tbl_wrapper_ledger_customer"
                        />
                    </Flex>
                </Flex>
            </Col>

            <ModalCustomerLedger
                toggleModalCustomerLedger={toggleModalCustomerLedger}
                setToggleModalCustomerLedger={setToggleModalCustomerLedger}
            />
        </Row>
    );
}
