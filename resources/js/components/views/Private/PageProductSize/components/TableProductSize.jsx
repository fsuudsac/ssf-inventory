import { useContext } from "react";
import { Button, Flex, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/pro-regular-svg-icons";

import PageProductSizeContext from "./PageProductSizeContext";

export default function TableProductSize() {
    const {
        dataSource,
        setToggleModalFormProductSize,
        setSelectedRowKeys,
        selectedRowKeys,
        onChangeTable,
    } = useContext(PageProductSizeContext);

    return (
        <Table
            id="tbl_product_size"
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
                                        setToggleModalFormProductSize({
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
                title="Product Size"
                key="product_size"
                dataIndex="product_size"
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
