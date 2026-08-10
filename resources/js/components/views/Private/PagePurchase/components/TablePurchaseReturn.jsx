import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Flex, Popconfirm, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/pro-regular-svg-icons";

import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";
import PagePurchaseContext from "./PagePurchaseContext";

export default function TablePurchaseReturn() {
    const {
        dataSource,
        tableFilter,
        onChangeTable,
        tabActive,
        handleArchived,
        isLoadingPurchaseArchive,
    } = useContext(PagePurchaseContext);

    const navigate = useNavigate();

    useTableScrollOnTop(`tbl_${tabActive}`, `tbl_${tabActive}`);

    return (
        <Table
            id={`tbl_${tabActive}`}
            className="ant-table-default ant-table-striped"
            dataSource={dataSource}
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
                                />
                            </Tooltip>
                            {/* <Tooltip title="Preview">
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
                                />
                            </Tooltip> */}

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
                width={150}
                title="Date Purchase Order Return"
                key="date_return"
                dataIndex="date_return"
            />

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
                title="Status"
                key="status"
                dataIndex="status"
            />
            <Table.Column
                width={200}
                title="Remarks"
                key="remarks"
                dataIndex="remarks"
            />
        </Table>
    );
}
