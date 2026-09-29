import { Button, Table } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/pro-regular-svg-icons";

export default function TableBrand(props) {
    const {
        dataSourceBrand,
        setToggleModalFormBrand,
        setSelectedRowKeys,
        selectedRowKeys,
        onChangeTable,
    } = props;

    return (
        <Table
            className="ant-table-default ant-table-striped"
            dataSource={dataSourceBrand && dataSourceBrand.data.data}
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
                        <>
                            <Button
                                type="link"
                                className="color-1"
                                onClick={() =>
                                    setToggleModalFormBrand({
                                        open: true,
                                        data: record,
                                    })
                                }
                            >
                                <FontAwesomeIcon icon={faPencil} />
                            </Button>
                        </>
                    );
                }}
            />

            <Table.Column
                title="Brand Name"
                key="brand_name"
                dataIndex="brand_name"
                sorter={true}
            />
        </Table>
    );
}
