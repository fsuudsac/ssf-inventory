import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Button, Flex, Popconfirm, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faMoneyBill,
    faPencil,
    faTrash,
} from "@fortawesome/pro-regular-svg-icons";

import PageFormSalesContext from "./PageFormSalesContext";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";

export default function TableSales() {
    const {
        dataSource,
        tableFilter,
        onChangeTable,
        tabActive,
        setToggleModalSalesPreview,
        setToggleModalSalesPayment,
        handleArhived,
        isLoadingDeleteSales,
        tableColumns,
    } = useContext(PageFormSalesContext);

    const navigate = useNavigate();

    useTableScrollOnTop(`tbl_sales_${tabActive}`, `tbl_sales_${tabActive}`);

    return (
        <Table
            id={`tbl_sales_${tabActive}`}
            className="ant-table-default ant-table-striped"
            dataSource={
                dataSource && dataSource.data && dataSource.data.data
                    ? dataSource.data.data
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
                title="Action"
                key="action"
                dataIndex="action"
                align="center"
                width={130}
                fixed="left"
                render={(text, record) => {
                    return (
                        <Flex gap={15} justify="center">
                            <Tooltip title="Edit">
                                <Button
                                    type="link"
                                    className="color-1 primary-color w-auto h-auto p-0"
                                    onClick={() =>
                                        navigate(
                                            "/release-item/edit-sales/" +
                                                record.id,
                                        )
                                    }
                                >
                                    <FontAwesomeIcon icon={faPencil} />
                                </Button>
                            </Tooltip>

                            <Button
                                type="link"
                                className="color-1 primary-color w-auto h-auto p-0"
                                onClick={() =>
                                    setToggleModalSalesPreview({
                                        open: true,
                                        data: record,
                                    })
                                }
                            >
                                <FontAwesomeIcon icon={faEye} />
                            </Button>

                            {/* Payment button: only for Credit terms and not yet fully paid */}
                            <Tooltip
                                title={
                                    record.paid_status === "Paid"
                                        ? "Already Paid"
                                        : record.terms !== "Credit"
                                          ? "Cash — no payment needed"
                                          : "Payment"
                                }
                            >
                                <Button
                                    type="link"
                                    className="color-1 primary-color w-auto h-auto p-0"
                                    disabled={
                                        record.paid_status === "Paid" ||
                                        record.terms !== "Credit"
                                    }
                                    onClick={() => {
                                        let total_payment = 0;

                                        if (record.sales_payments) {
                                            total_payment =
                                                record.sales_payments.reduce(
                                                    (a, b) => {
                                                        if (
                                                            b.type ===
                                                            "Release Item"
                                                        ) {
                                                            a += Number(
                                                                b.amount,
                                                            );
                                                        }
                                                        return a;
                                                    },
                                                    0,
                                                );
                                        }

                                        let total_balance =
                                            Number(record.net_amount_due) -
                                            total_payment;

                                        setToggleModalSalesPayment({
                                            open: true,
                                            data: {
                                                ...record,
                                                total_balance:
                                                    total_balance.toFixed(2),
                                            },
                                        });
                                    }}
                                    icon={
                                        <FontAwesomeIcon icon={faMoneyBill} />
                                    }
                                />
                            </Tooltip>

                            <Popconfirm
                                title="Are you sure to delete this data?"
                                onConfirm={() => {
                                    handleArhived(record);
                                }}
                                onCancel={() => {
                                    notification.error({
                                        message: "Release Item",
                                        description: "Data not deleted",
                                    });
                                }}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button
                                    type="link"
                                    className={`${
                                        tableFilter.isTrash
                                            ? "text-success"
                                            : "text-danger"
                                    } p-0 w-auto h-auto`}
                                    loading={isLoadingDeleteSales}
                                    name="btn_delete"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </Popconfirm>
                        </Flex>
                    );
                }}
            />

            <Table.Column
                width={180}
                title="Date of Transaction"
                key="date_transaction_format"
                dataIndex="date_transaction_format"
            />

            <Table.Column
                width={150}
                title="Invoice No."
                key="invoice_no"
                dataIndex="invoice_no"
            />

            <Table.Column
                width={180}
                title="Fullname"
                key="customer_name"
                dataIndex="customer_name"
            />

            <Table.Column
                width={180}
                title="Department"
                key="company_name"
                dataIndex="company_name"
            />

            {tableColumns?.includes("customer_type") && (
                <Table.Column
                    width={150}
                    title="Type"
                    key="customer_type"
                    dataIndex="customer_type"
                />
            )}

            <Table.Column
                width={150}
                title="Date Due"
                key="date_due_format"
                dataIndex="date_due_format"
            />

            <Table.Column
                width={150}
                title="Date Returned"
                key="date_returned_format"
                dataIndex="date_returned_format"
            />

            {tableColumns?.includes("vat_type") && (
                <Table.Column
                    width={150}
                    title="VAT Type"
                    key="vat_type"
                    dataIndex="vat_type"
                />
            )}

            {tableColumns?.includes("ewt_type") && (
                <Table.Column
                    width={150}
                    title="EWT Type"
                    key="ewt_type"
                    dataIndex="ewt_type"
                />
            )}

            {tableColumns?.includes("terms") && (
                <Table.Column
                    width={150}
                    title="Terms"
                    key="terms"
                    dataIndex="terms"
                />
            )}

            {tableColumns?.includes("discount") && (
                <Table.Column
                    width={150}
                    title="Discount"
                    key="discount"
                    dataIndex="discount"
                />
            )}

            <Table.Column
                width={150}
                title="Date Created"
                key="date_transaction_format"
                dataIndex="date_transaction_format"
            />
        </Table>
    );
}
