import { useContext } from "react";
import { Button, Flex, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/pro-regular-svg-icons";

import PageAllocationTypeContext from "./PageAllocationTypeContext";

export default function TableAllocationType() {
    const {
        dataSource,
        isLoadingSource,
        isFetchingSource,
        setToggleModalFormAllocationType,
        setSelectedRowKeys,
        selectedRowKeys,
        onChangeTable,
    } = useContext(PageAllocationTypeContext);

    return (
        <Table
            id="tbl_allocation_type"
            className="ant-table-default ant-table-striped"
            dataSource={dataSource?.data?.data || []}
            loading={isLoadingSource || isFetchingSource}
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            onChange={onChangeTable}
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
                width={100}
                render={(_, record) => (
                    <Flex justify="center">
                        <div name="btn_edit">
                            <Tooltip title="Edit">
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setToggleModalFormAllocationType({
                                            open: true,
                                            data: record,
                                        });
                                    }}
                                    icon={<FontAwesomeIcon icon={faPencil} />}
                                />
                            </Tooltip>
                        </div>
                    </Flex>
                )}
            />

            <Table.Column
                title="Allocation Type"
                key="allocation_type"
                dataIndex="allocation_type"
                sorter
            />
            <Table.Column
                title="Created At"
                key="date_formatted"
                dataIndex="date_formatted"
                width={170}
                sorter
                defaultSortOrder="ascend"
            />
        </Table>
    );
}
