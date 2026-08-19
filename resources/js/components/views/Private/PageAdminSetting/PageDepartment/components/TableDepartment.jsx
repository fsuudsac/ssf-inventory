import { useContext } from "react";
import { Button, Flex, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/pro-regular-svg-icons";

import PageDepartmentContext from "./PageDepartmentContext";

export default function TableDepartment() {
    const {
        dataSource,
        isLoadingSource,
        isFetchingSource,
        setToggleModalFormDepartment,
        setSelectedRowKeys,
        selectedRowKeys,
        onChangeTable,
    } = useContext(PageDepartmentContext);

    return (
        <Table
            id="tbl_department"
            className="ant-table-default ant-table-striped"
            dataSource={dataSource?.data?.data || []}
            loading={isLoadingSource || isFetchingSource}
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
                width={100}
                render={(_, record) => {
                    return (
                        <Flex justify="center">
                            <div name="btn_edit">
                                <Tooltip title="Edit">
                                    <Button
                                        type="link"
                                        className="color-1"
                                        onClick={() =>
                                            setToggleModalFormDepartment({
                                                open: true,
                                                data: record,
                                            })
                                        }
                                        icon={
                                            <FontAwesomeIcon icon={faPencil} />
                                        }
                                    />
                                </Tooltip>
                            </div>
                        </Flex>
                    );
                }}
            />

            <Table.Column
                title="Abbreviation"
                key="abbr"
                dataIndex="abbr"
                width={150}
            />
            <Table.Column
                title="Department"
                key="department_name"
                dataIndex="department_name"
                sorter={true}
                width={300}
                defaultSortOrder="ascend"
            />
            <Table.Column
                title="Department Type"
                key="department_type"
                dataIndex="department_type"
                sorter={true}
                width={250}
            />
            <Table.Column
                title="Created At"
                key="date_formatted"
                dataIndex="date_formatted"
                width={100}
            />
        </Table>
    );
}
