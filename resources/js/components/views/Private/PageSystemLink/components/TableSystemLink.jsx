import { Button, Image, Table } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/pro-regular-svg-icons";

import { apiUrl } from "../../../../providers/appConfig";

export default function TableSystemLink(props) {
    const {
        selectedRowKeys,
        setSelectedRowKeys,
        dataSource,
        onChangeTable,
        setToggleModalSystemLink,
    } = props;

    return (
        <Table
            id="table-system-link"
            className="ant-table-default ant-table-striped"
            dataSource={
                dataSource && dataSource.data ? dataSource.data.data : []
            }
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
                align="center"
                width={100}
                render={(text, record) => {
                    return (
                        <>
                            <Button
                                type="link"
                                className="p-0 w-auto h-auto"
                                onClick={() => {
                                    setToggleModalSystemLink({
                                        open: true,
                                        data: record,
                                    });
                                }}
                                icon={<FontAwesomeIcon icon={faEdit} />}
                            />
                        </>
                    );
                }}
            />
            <Table.Column
                title="Created At"
                key="created_at_formatted"
                dataIndex="created_at_formatted"
                width={100}
                sorter
            />
            <Table.Column
                title="Logo"
                key="logo"
                width={120}
                sorter
                render={(_, record) => {
                    let attachments = record.attachments.filter(
                        (x) => x.file_description === "System Logo"
                    );
                    let logo_url = "/images/logo.png";

                    if (attachments && attachments.length > 0) {
                        let logo =
                            attachments[attachments.length - 1].file_path;

                        if (logo) {
                            logo_url = apiUrl(logo);
                        }
                    }

                    return <Image src={logo_url} width={100} />;
                }}
            />
            <Table.Column
                title="Name"
                key="name"
                dataIndex="name"
                width={120}
                sorter
            />
            <Table.Column
                title="Description"
                key="description"
                dataIndex="description"
                width={120}
                sorter
                render={(text, _) => (
                    <div dangerouslySetInnerHTML={{ __html: text }} />
                )}
            />
            <Table.Column
                title="URL"
                key="url"
                dataIndex="url"
                width={200}
                sorter
            />
        </Table>
    );
}
