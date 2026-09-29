import { useContext } from "react";
import { Button, Flex, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/pro-regular-svg-icons";

import PageVideoFaqContext from "./PageVideoFaqContext";

export default function TableVideoFaqs() {
    const {
        dataSource,
        setToggleModalFormVideoFaq,
        setSelectedRowKeys,
        selectedRowKeys,
        onChangeTable,
    } = useContext(PageVideoFaqContext);

    return (
        <Table
            id="tbl_video_faq"
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
                                        setToggleModalFormVideoFaq({
                                            open: true,
                                            data: record,
                                        })
                                    }
                                    icon={<FontAwesomeIcon icon={faPencil} />}
                                />
                            </Tooltip>
                        </Flex>
                    );
                }}
            />

            <Table.Column
                title="Title"
                key="title"
                dataIndex="title"
                sorter={true}
                width={150}
            />
            <Table.Column
                title="Description"
                key="description"
                dataIndex="description"
                sorter={true}
                width={200}
            />
            <Table.Column
                title="Module Name"
                key="module_name"
                dataIndex="module_name"
                sorter={true}
                width={150}
            />
            <Table.Column
                title="URL"
                key="file_path"
                dataIndex="file_path"
                sorter={true}
                width={150}
            />
            <Table.Column
                title="Created At"
                key="date_formatted"
                dataIndex="date_formatted"
                sorter={true}
                width={150}
            />
        </Table>
    );
}
