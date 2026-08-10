import { useContext } from "react";
import { Button, Flex, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/pro-regular-svg-icons";

import PageProductTypeContext from "./PageProductTypeContext";

export default function TableProductType() {
    const {
        dataSource,
        setToggleModalFormProductType,
        setSelectedRowKeys,
        selectedRowKeys,
        onChangeTable,
    } = useContext(PageProductTypeContext);

    return (
        <Table
            id="tbl_product_type"
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
                                        setToggleModalFormProductType({
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
                title="Product Type"
                key="product_type"
                dataIndex="product_type"
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
