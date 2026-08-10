import { useContext } from "react";
import { Button, Flex, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/pro-regular-svg-icons";

import PageProductCategoryContext from "./PageProductCategoryContext";

export default function TableProductCategory() {
    const {
        dataSource,
        setToggleModalFormProductCategory,
        setSelectedRowKeys,
        selectedRowKeys,
        onChangeTable,
    } = useContext(PageProductCategoryContext);

    return (
        <Table
            id="tbl_product_category"
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
                                        setToggleModalFormProductCategory({
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
                title="Product Category"
                key="product_category"
                dataIndex="product_category"
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
