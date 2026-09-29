import { useContext } from "react";
import { Table, Tooltip, Switch, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTimes } from "@fortawesome/pro-regular-svg-icons";

import PageWarehouseContext from "./PageWarehouseContext";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";

export default function TableWarehouse() {
    const {
        dataSource,
        setToggleModalFormWarehouse,
        setSelectedRowKeys,
        selectedRowKeys,
        onChangeTable,
        handleChangeStatus,
        isLoadingChangeStatus,
        location,
    } = useContext(PageWarehouseContext);

    useTableScrollOnTop("table-warehouse", location.pathname);

    return (
        <Table
            id="table-warehouse"
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
                        <Tooltip title={"Edit"}>
                            <Button
                                type="link"
                                className="color-1"
                                onClick={() =>
                                    setToggleModalFormWarehouse({
                                        open: true,
                                        data: record,
                                    })
                                }
                                icon={<FontAwesomeIcon icon={faPencil} />}
                                name="btn_edit"
                            />
                        </Tooltip>
                    );
                }}
            />

            <Table.Column
                width={50}
                title="Status"
                key="status"
                dataIndex="status"
                render={(text, record) => (
                    <Switch
                        checked={record.status === 1}
                        checkedChildren={"Main"}
                        unCheckedChildren={<FontAwesomeIcon icon={faTimes} />}
                        loading={isLoadingChangeStatus}
                        onChange={(checked) => {
                            handleChangeStatus(checked, record);
                        }}
                        name="btn_status"
                    />
                )}
            />

            <Table.Column
                width={180}
                title="Warehouse"
                key="warehouse_name"
                dataIndex="warehouse_name"
            />

            <Table.Column
                width={220}
                title="Description"
                key="description"
                dataIndex="description"
            />

            <Table.Column
                width={220}
                title="Address"
                key="address"
                dataIndex="address"
            />

            <Table.Column
                width={120}
                title="Created At"
                key="date_formatted"
                dataIndex="date_formatted"
            />
        </Table>
    );
}
