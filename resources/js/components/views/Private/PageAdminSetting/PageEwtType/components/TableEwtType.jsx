import { useContext } from "react";
import { Button, Flex, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/pro-regular-svg-icons";

import PageEwtTypeContext from "./PageEwtTypeContext";

export default function TableEwtType() {
    const {
        dataSource,
        setToggleModalFormEwtType,
        setSelectedRowKeys,
        selectedRowKeys,
        onChangeTable,
    } = useContext(PageEwtTypeContext);

    return (
        <Table
            id="tbl_ewt_type"
            className="ant-table-default ant-table-striped"
            dataSource={dataSource && dataSource.data.data}
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
                width={80}
                render={(text, record) => {
                    return (
                        <Flex justify="center">
                            <Tooltip title="Edit">
                                <Button
                                    type="link"
                                    className="color-1"
                                    onClick={() =>
                                        setToggleModalFormEwtType({
                                            open: true,
                                            data: record,
                                        })
                                    }
                                    icon={<FontAwesomeIcon icon={faPencil} />}
                                    name="btn_edit"
                                />
                            </Tooltip>
                        </Flex>
                    );
                }}
            />

            <Table.Column
                title="EWT Type"
                key="ewt_type"
                dataIndex="ewt_type"
                sorter={true}
            />
            <Table.Column
                title="Created At"
                key="date_formatted"
                dataIndex="date_formatted"
                sorter={true}
            />
        </Table>
    );
}
