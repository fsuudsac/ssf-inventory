import { useContext } from "react";
import { Table, Tooltip, Switch, Button, Select, Flex, Divider } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPencil, faTimes } from "@fortawesome/pro-regular-svg-icons";

import PageTransferContext from "./PageTransferContext";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";

export default function TableTransfer() {
    const {
        dataSource,
        setToggleModalFormTransfer,
        setSelectedRowKeys,
        selectedRowKeys,
        onChangeTable,
        location,
        handleChangeStatus,
        isLoadingChangeStatus,
    } = useContext(PageTransferContext);

    useTableScrollOnTop("table-transfer", location.pathname);

    return (
        <Table
            id="table-transfer"
            className="ant-table-default ant-table-striped"
            dataSource={dataSource?.data?.data || []}
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            onChange={onChangeTable}
            scroll={{ x: "max-content" }}
            rowSelection={{
                selectedRowKeys,
                onChange: (selectedRowKeys) => {
                    setSelectedRowKeys(selectedRowKeys);
                },
            }}
            sticky
        >
            <Table.Column
                title="Action"
                key="action"
                dataIndex="action"
                align="center"
                width={50}
                render={(text, record) => {
                    return (
                        <Flex justify="center">
                            <Tooltip title={"Edit"}>
                                <Button
                                    type="link"
                                    className="color-1"
                                    onClick={() =>
                                        setToggleModalFormTransfer({
                                            open: true,
                                            data: record,
                                        })
                                    }
                                    icon={<FontAwesomeIcon icon={faPencil} />}
                                    name="btn_edit"
                                />
                            </Tooltip>

                            <Tooltip title={"View"}>
                                <Button
                                    type="link"
                                    className="color-1"
                                    onClick={() =>
                                        setToggleModalFormTransfer({
                                            open: true,
                                            data: record,
                                            disabled: true,
                                        })
                                    }
                                    icon={<FontAwesomeIcon icon={faEye} />}
                                    name="btn_view"
                                />
                            </Tooltip>
                        </Flex>
                    );
                }}
            />

            <Table.Column
                width={150}
                title="Reference Number"
                key="reference_no"
                dataIndex="reference_no"
            />

            <Table.Column
                width={150}
                title="From Warehouse"
                key="from_warehouse_name"
                dataIndex="from_warehouse_name"
            />

            <Table.Column
                width={150}
                title="To Warehouse"
                key="to_warehouse_name"
                dataIndex="to_warehouse_name"
            />

            <Table.Column
                width={150}
                title="Date Transferred"
                key="date_transfer_formatted"
                dataIndex="date_transfer_formatted"
            />

            {/* <Table.Column
                width={200}
                title="Products"
                key="transfer_details"
                render={(_, record) => {
                    let transfer_details = record.transfer_details.map(
                        (item, index) => {
                            return (
                                <>
                                    <Flex key={index} align="center">
                                        <div>
                                            {
                                                item.product_detail?.product
                                                    ?.product_name
                                            }
                                        </div>
                                    </Flex>

                                    {index !==
                                        record.transfer_details.length - 1 && (
                                        <Divider
                                            className="mt-0 mb-0"
                                            key={`divider-index`}
                                        />
                                    )}
                                </>
                            );
                        }
                    );

                    return transfer_details;
                }}
            />

            <Table.Column
                width={200}
                title="Type"
                key="transfer_details"
                render={(_, record) => {
                    let transfer_details = record.transfer_details.map(
                        (item, index) => {
                            return (
                                <>
                                    <Flex key={index} align="center">
                                        <div>
                                            {
                                                item.product_detail
                                                    ?.product_type?.product_type
                                            }
                                        </div>
                                    </Flex>

                                    {index !==
                                        record.transfer_details.length - 1 && (
                                        <Divider
                                            className="mt-0 mb-0"
                                            key={`divider-index`}
                                        />
                                    )}
                                </>
                            );
                        }
                    );

                    return transfer_details;
                }}
            />

            <Table.Column
                width={200}
                title="Size"
                key="transfer_details"
                render={(_, record) => {
                    let transfer_details = record.transfer_details.map(
                        (item, index) => {
                            return (
                                <>
                                    <Flex key={index} align="center">
                                        <div>
                                            {
                                                item.product_detail
                                                    ?.product_size?.product_size
                                            }
                                        </div>
                                    </Flex>

                                    {index !==
                                        record.transfer_details.length - 1 && (
                                        <Divider
                                            className="mt-0 mb-0"
                                            key={`divider-index`}
                                        />
                                    )}
                                </>
                            );
                        }
                    );

                    return transfer_details;
                }}
            />

            <Table.Column
                width={100}
                title="Quantity"
                key="transfer_details"
                render={(_, record) => {
                    let transfer_details = record.transfer_details.map(
                        (item, index) => {
                            return (
                                <>
                                    <Flex key={index} align="center">
                                        <div>
                                            <strong>{item.quantity}</strong>
                                        </div>
                                    </Flex>

                                    {index !==
                                        record.transfer_details.length - 1 && (
                                        <Divider
                                            className="mt-0 mb-0"
                                            key={`divider-index`}
                                        />
                                    )}
                                </>
                            );
                        }
                    );

                    return transfer_details;
                }}
            /> */}

            <Table.Column
                width={120}
                title="Status"
                key="status"
                align="center"
                dataIndex="status"
                // render={(_, record) => {
                //     return (
                //         <Select
                //             placeholder="Select Status"
                //             options={[
                //                 { label: "Pending", value: "pending" },
                //                 { label: "Completed", value: "Completed" },
                //                 { label: "Canceled", value: "Canceled" },
                //             ]}
                //             value={record.status}
                //             style={{ width: "100%" }}
                //             loading={isLoadingChangeStatus}
                //             onChange={(value) => {
                //                 handleChangeStatus(record.id, value);
                //             }}
                //         />
                //     );
                // }}
            />
        </Table>
    );
}
