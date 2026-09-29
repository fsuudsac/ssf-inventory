import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Flex, Popconfirm, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/pro-regular-svg-icons";

import PageFormSalesContext from "./PageFormSalesContext";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";

export default function TableSalesReturn(props) {
    const {
        dataSource,
        tableFilter,
        onChangeTable,
        tabActive,
        setToggleModalSalesPreview,
        handleArhived,
        isLoadingDeleteSalesReturn,
    } = useContext(PageFormSalesContext);

    const navigate = useNavigate();

    useTableScrollOnTop(
        `tbl_sales_return_${tabActive}`,
        `tbl_sales_return_${tabActive}`,
    );

    return (
        <Table
            id={`tbl_sales_return_${tabActive}`}
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
                                            "/release-item/edit-sales-return/" +
                                                record.id,
                                        )
                                    }
                                    icon={<FontAwesomeIcon icon={faPencil} />}
                                    name="btn_edit"
                                />
                            </Tooltip>

                            {/* <Button
                                type="link"
                                className="color-1 primary-color w-auto h-auto p-0"
                                onClick={() =>
                                    setToggleModalSalesPreview({
                                        open: true,
                                        data: record,
                                    })
                                }
                                icon={<FontAwesomeIcon icon={faEye} />}
                                name="btn_view"
                            /> */}

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
                                    loading={isLoadingDeleteSalesReturn}
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
                width={150}
                title="Date Return"
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
                title="Customer"
                key="customer_name"
                dataIndex="customer_name"
            />

            <Table.Column
                width={120}
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
