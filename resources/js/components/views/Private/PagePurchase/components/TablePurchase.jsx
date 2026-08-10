import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Flex, Popconfirm, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faMoneyBill,
    faPencil,
    faTrash,
} from "@fortawesome/pro-regular-svg-icons";

import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";
import formatToCurrency from "../../../../providers/formatToCurrency";
import PagePurchaseContext from "./PagePurchaseContext";

export default function TablePurchase() {
    const {
        dataPurchaseOrder,
        tableFilter,
        tabActive,
        setToggleModalPuchasePreview,
        setToggleModalPuchasePayment,
        handleArchived,
        isLoadingPurchaseArchive,
        tableColumns,
        onChangeTable,
    } = useContext(PagePurchaseContext);

    const navigate = useNavigate();

    useTableScrollOnTop(`tbl_${tabActive}`, `tbl_${tabActive}`);

    return (
        <Table
            id={`tbl_${tabActive}`}
            className="ant-table-default ant-table-striped"
            dataSource={dataPurchaseOrder ? dataPurchaseOrder.data.data : []}
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
                                            `/purchase-order/edit-${tabActive}/${record.id}`,
                                        )
                                    }
                                    icon={<FontAwesomeIcon icon={faPencil} />}
                                    name="btn_edit"
                                />
                            </Tooltip>
                            <Tooltip title="Preview">
                                <Button
                                    type="link"
                                    className="color-1 primary-color w-auto h-auto p-0"
                                    onClick={() => {
                                        setToggleModalPuchasePreview({
                                            open: true,
                                            data: record,
                                        });
                                    }}
                                    icon={<FontAwesomeIcon icon={faEye} />}
                                    name="btn_view"
                                />
                            </Tooltip>

                            <Tooltip
                                title={
                                    record.paid_status == "Paid"
                                        ? "Already Paid"
                                        : "Payment"
                                }
                            >
                                <Button
                                    type="link"
                                    className="color-1 primary-color w-auto h-auto p-0"
                                    onClick={() => {
                                        let total_payment = 0;
                                        if (record.purchase_payments) {
                                            total_payment =
                                                record.purchase_payments.reduce(
                                                    (a, b) => {
                                                        if (
                                                            b.type ===
                                                            "Purchased"
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
                                            Number(
                                                Number(
                                                    record.net_amount_due,
                                                ).toFixed(2),
                                            ) -
                                            Number(total_payment.toFixed(2));

                                        setToggleModalPuchasePayment({
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
                                    disabled={
                                        record.paid_status == "Paid" &&
                                        tableFilter.isTrash === 0
                                    }
                                    name="btn_payment"
                                />
                            </Tooltip>

                            <Popconfirm
                                title={`Are you sure to ${
                                    tableFilter.isTrash === 0
                                        ? "archive"
                                        : "restore"
                                } this data?`}
                                onConfirm={() => {
                                    handleArchived(record.id);
                                }}
                                onCancel={() => {
                                    notification.error({
                                        message: "Purchase Order",
                                        description: `Data is not ${
                                            tableFilter.isTrash === 0
                                                ? "archived"
                                                : "restored"
                                        }.`,
                                    });
                                }}
                                okText="Yes"
                                cancelText="No"
                                name="btn_delete"
                            >
                                <Button
                                    type="link"
                                    className={`p-0 w-auto h-auto ${
                                        tableFilter.isTrash === 0
                                            ? "text-danger"
                                            : "text-success"
                                    }`}
                                    loading={isLoadingPurchaseArchive}
                                    name="btn_delete"
                                    icon={<FontAwesomeIcon icon={faTrash} />}
                                />
                            </Popconfirm>
                        </Flex>
                    );
                }}
            />

            <Table.Column
                width={200}
                title="Date Purchased Order"
                key="date_purchased_format"
                dataIndex="date_purchased_format"
                // sorter={(a, b) => {
                //     a.date_purchased_format.localeCompare(
                //         b.date_purchased_format,
                //     );
                // }}
                sorter
            />

            <Table.Column
                width={150}
                title="Invoice No."
                key="invoice_no"
                dataIndex="invoice_no"
            />

            <Table.Column
                width={180}
                title="Warehouse Name"
                key="warehouse_name"
                dataIndex="warehouse_name"
            />

            <Table.Column
                width={180}
                title="Supplier Name"
                key="supplier_name"
                dataIndex="supplier_name"
            />

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
                    width={120}
                    title="EWT Type"
                    key="ewt_type"
                    dataIndex="ewt_type"
                />
            )}

            {tableColumns?.includes("terms") && (
                <Table.Column
                    width={120}
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
                    render={(text, _) => `₱${formatToCurrency(text)}`}
                />
            )}

            {tableColumns?.includes("total_gross_amount") && (
                <Table.Column
                    width={200}
                    title="Total Gross Amount"
                    key="total_gross_amount"
                    dataIndex="total_gross_amount"
                    render={(text, _) => `₱${formatToCurrency(text)}`}
                />
            )}

            {tableColumns?.includes("value_added_tax") && (
                <Table.Column
                    width={150}
                    title="Value Added Tax"
                    key="value_added_tax"
                    dataIndex="value_added_tax"
                    render={(text, _) => `₱${formatToCurrency(text)}`}
                />
            )}

            {tableColumns?.includes("total_amount_payable") && (
                <Table.Column
                    width={200}
                    title="Total Amount Payable"
                    key="total_amount_payable"
                    dataIndex="total_amount_payable"
                    render={(text, _) => `₱${formatToCurrency(text)}`}
                />
            )}

            {tableColumns?.includes("amount_due") && (
                <Table.Column
                    width={150}
                    title="Amount Due"
                    key="amount_due"
                    dataIndex="amount_due"
                    render={(text, _) => `₱${formatToCurrency(text)}`}
                />
            )}

            {tableColumns?.includes("net_amount_due") && (
                <Table.Column
                    width={150}
                    title="Net Amount Due"
                    key="net_amount_due"
                    dataIndex="net_amount_due"
                    render={(text, _) => `₱${formatToCurrency(text)}`}
                />
            )}

            {tableColumns?.includes("paid_status") && (
                <Table.Column
                    width={120}
                    title="Paid Status"
                    key="paid_status"
                    dataIndex="paid_status"
                />
            )}

            <Table.Column
                width={120}
                title="Date Created"
                key="created_at_format"
                dataIndex="created_at_format"
            />
        </Table>
    );
}
