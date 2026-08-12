import { useEffect, useState } from "react";
import { Button, Col, DatePicker, Flex, Form, Row, Table } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";
import formatToCurrency from "../../../../providers/formatToCurrency";
import FloatSelect from "../../../../providers/FloatSelect";
import ModalSupplierLedger from "./ModalSupplierLedger";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";
import FloatRangePicker from "../../../../providers/FloatRangePicker";

export default function TabItemSupplier(props) {
    const { width } = props;

    const [form] = Form.useForm();

    const [toggleModalSupplierLedger, setToggleModalSupplierLedger] = useState({
        open: false,
        data: null,
    });

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_order: "desc",
        sort_field: "date_purchased_formatted",
        supplier_id: [],
        date_purchased: [],
        date_purchased_string: [],
    });

    const { data: dataSupplier } = GET(
        `api/users?roles=Supplier`,
        "user_list_supplier",
    );

    const { data: dataLedger, refetch: refetchLedger } = GET(
        `api/report_ledger_supplier?${new URLSearchParams(tableFilter)}`,
        "report_ledger_supplier",
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

    useTableScrollOnTop("tbl_ledger_supplier", "tbl_ledger_supplier");

    return (
        <Row gutter={[20, 20]} id="tbl_wrapper_ledger_supplier">
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Row gutter={[12, 12]}>
                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                        <FloatSelect
                            label="Supplier"
                            placeholder="Supplier"
                            mode="multiple"
                            allowClear
                            options={
                                dataSupplier?.data?.map((item) => ({
                                    value: item.id,
                                    label: item.fullname,
                                })) || []
                            }
                            value={tableFilter.supplier_id || null}
                            onChange={(value) => {
                                setTableFilter((prev) => ({
                                    ...prev,
                                    supplier_id: value,
                                }));
                            }}
                        />
                    </Col>

                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                        <FloatRangePicker
                            label="Date Purchased"
                            placeholder="Date Purchased"
                            value={tableFilter.date_purchased}
                            onChange={(date, dateString) => {
                                setTableFilter((prev) => ({
                                    ...prev,
                                    date_purchased: date,
                                    date_purchased_string: dateString,
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
                                setToggleModalSupplierLedger({
                                    open: true,
                                    data: {
                                        supplier_id: tableFilter.supplier_id,
                                        date_range:
                                            tableFilter.date_purchased_string,
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
                            tblIdWrapper="tbl_wrapper_ledger_supplier"
                        />
                    </Flex>
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Table
                    id="tbl_ledger_supplier"
                    className="ant-table-default ant-table-striped"
                    dataSource={
                        dataLedger && dataLedger.data.data
                            ? [
                                  ...dataLedger.data.data.map((item) => {
                                      let balance = item.net_amount_due;

                                      return {
                                          ...item,
                                          balance: balance,
                                      };
                                  }),
                                  //   {
                                  //       id: -1,
                                  //       supplier_name: "",
                                  //       invoice_no: "",
                                  //       payment_date: "",
                                  //       terms: "TOTAL:",
                                  //       net_amount_due: 0,
                                  //       balance: 0,
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
                        title="Invoice No."
                        key="invoice_no"
                        dataIndex="invoice_no"
                    />

                    <Table.Column
                        width={180}
                        title="Supplier Name"
                        key="supplier_name"
                        dataIndex="supplier_name"
                    />

                    <Table.Column
                        width={150}
                        title="Date Payment"
                        key="payment_date"
                        dataIndex="payment_date"
                        render={(text, record) => {
                            if (record.terms === "Cash") {
                                return record.date_purchased_formatted;
                            } else {
                                return record.purchase_payments &&
                                    record.purchase_payments.length > 0
                                    ? dayjs(
                                          record.purchase_payments[0]
                                              .created_at,
                                      ).format("MM/DD/YYYY")
                                    : "";
                            }
                        }}
                    />

                    <Table.Column
                        width={150}
                        title="Terms"
                        key="terms"
                        dataIndex="terms"
                    />

                    <Table.Column
                        width={150}
                        title="Amount Payable"
                        key="net_amount_due"
                        dataIndex="net_amount_due"
                        render={(text) => `₱ ${formatToCurrency(text)}`}
                    />

                    <Table.Column
                        width={150}
                        title="Amount Paid"
                        key="amount"
                        render={(text, record) => {
                            let amount = 0;

                            if (record.terms === "Cash") {
                                amount = record.net_amount_due;
                            } else {
                                amount =
                                    record.purchase_payments &&
                                    record.purchase_payments.reduce(
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
                        render={(text, record) => {
                            let amount = 0;

                            if (record.terms === "Credit") {
                                let purchase_payments =
                                    record.purchase_payments &&
                                    record.purchase_payments.reduce(
                                        (acc, payment) =>
                                            acc + Number(payment.amount),
                                        0,
                                    );

                                amount =
                                    record.net_amount_due - purchase_payments;
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
                            tblIdWrapper="tbl_wrapper_ledger_supplier"
                        />
                    </Flex>
                </Flex>
            </Col>

            <ModalSupplierLedger
                toggleModalSupplierLedger={toggleModalSupplierLedger}
                setToggleModalSupplierLedger={setToggleModalSupplierLedger}
            />
        </Row>
    );
}
