import { useState } from "react";
import { Table, Button, Flex, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/pro-regular-svg-icons";

export default function TableSupplier(props) {
    const {
        dataSource,
        onChangeTable,
        setToggleModalFormSupplier,
        selectedRowKeys,
        setSelectedRowKeys,
    } = props;

    const RenderAddress = ({ record }) => {
        const [showMore, setShowMore] = useState(false);
        const profileAddresses = record.profile.profile_addresses;
        const filteredAddresses = profileAddresses.filter(
            (item) => item.status === 1
        );

        return (
            <Flex justify="flex-start" vertical>
                {filteredAddresses
                    .slice(0, showMore ? filteredAddresses.length : 1)
                    .map((item, index) => (
                        <Tag key={index}>{item.address}</Tag>
                    ))}
                {filteredAddresses.length > 1 && (
                    <Button type="link" onClick={() => setShowMore(!showMore)}>
                        {showMore ? "Show Less" : "Show More"}
                    </Button>
                )}
            </Flex>
        );
    };

    return (
        <Table
            id="tbl_user"
            className="ant-table-default ant-table-striped w-0 auto h-0 p-0"
            dataSource={dataSource && dataSource.data}
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
        >
            <Table.Column
                title="Action"
                key="action"
                dataIndex="action"
                align="center"
                width={100}
                render={(_, record) => {
                    return (
                        <Flex gap={15} justify="center">
                            <Button
                                type="link"
                                className="text-primary p-0 w-auto h-auto"
                                onClick={() => {
                                    setToggleModalFormSupplier({
                                        open: true,
                                        data: record,
                                    });
                                }}
                                name="btn_edit"
                                icon={<FontAwesomeIcon icon={faPencil} />}
                            />
                        </Flex>
                    );
                }}
            />

            <Table.Column
                title="Supplier"
                key="fullname"
                dataIndex="fullname"
                render={(text, record) => {
                    // console.log("record TableSupplier: ", record);
                    return <>{record.fullname}</>;
                }}
                width={180}
                sorter
            />

            <Table.Column
                title="Company"
                key="company"
                dataIndex="company"
                sorter={true}
            />

            <Table.Column
                title="Address"
                key="address"
                dataIndex="address"
                sorter={true}
                align="left"
                render={(text, record) => {
                    return <RenderAddress record={record} />;
                }}
            />

            <Table.Column
                title="Contact Number"
                key="contact_no"
                dataIndex="contact_no"
                align="center"
                sorter
            />

            <Table.Column
                title="Ledger"
                key="ledger"
                dataIndex="ledger"
                width={100}
                align="center"
                sorter
            />
        </Table>
    );
}
