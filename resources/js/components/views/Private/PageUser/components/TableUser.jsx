import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, notification, Popconfirm, Flex, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPencil,
    faTrash,
    faTrashUndo,
    faUserGear,
} from "@fortawesome/pro-regular-svg-icons";

import { POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";

export default function TableUser(props) {
    const { dataSource, onChangeTable, location, tableFilter } = props;

    const navigate = useNavigate();

    const { mutate: mutateDeactivateUser, isLoading: isLoadingDeactivateUser } =
        POST(`api/user_archived`, "users_list");

    const handleDeactivate = (record) => {
        delete record.status;

        let data = {
            ...record,
            status: tableFilter.status,
        };
        mutateDeactivateUser(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "User",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "User",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const RenderAddress = ({ record }) => {
        const [showMore, setShowMore] = useState(false);
        const profileAddresses = record.profile.profile_addresses;
        const filteredAddresses = profileAddresses.filter(
            (item) => item.status === 1,
        );

        return (
            <Flex vertical>
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
            className="ant-table-default ant-table-striped"
            dataSource={dataSource && dataSource.data.data}
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            onChange={onChangeTable}
            scroll={{ x: "max-content" }}
            sticky
        >
            <Table.Column
                title="Action"
                key="action"
                dataIndex="action"
                align="center"
                width={100}
                render={(text, record) => {
                    return (
                        <Flex justify="center" gap={15}>
                            {location.pathname === "/users" ? (
                                <Button
                                    type="link"
                                    className="btn-info p-0 w-auto h-auto"
                                    onClick={() => {
                                        navigate(
                                            `${location.pathname}/permission/${record.id}`,
                                        );
                                    }}
                                    name="btn_edit_permission"
                                    title="Edit Permission"
                                    icon={<FontAwesomeIcon icon={faUserGear} />}
                                />
                            ) : null}

                            <Button
                                type="link"
                                className="text-primary p-0 w-auto h-auto"
                                onClick={() => {
                                    navigate(
                                        `${location.pathname}/edit/${record.id}`,
                                    );
                                }}
                                name="btn_edit"
                                icon={<FontAwesomeIcon icon={faPencil} />}
                            />
                            <Popconfirm
                                title={
                                    <>
                                        Are you sure you want to
                                        <br />
                                        {tableFilter.status === "Active"
                                            ? "archive"
                                            : "restore"}{" "}
                                        this user?
                                    </>
                                }
                                onConfirm={() => {
                                    handleDeactivate(record);
                                }}
                                onCancel={() => {
                                    notification.error({
                                        message: "User",
                                        description: "Data not deactivated",
                                    });
                                }}
                                okText="Yes"
                                cancelText="No"
                                name="btn_delete"
                            >
                                <Button
                                    type="link"
                                    className={`p-0 w-auto h-auto ${
                                        tableFilter.status === "Active"
                                            ? "text-danger"
                                            : "text-success"
                                    }`}
                                    loading={isLoadingDeactivateUser}
                                    name="btn_delete"
                                    icon={
                                        <FontAwesomeIcon
                                            icon={
                                                tableFilter.status === "Active"
                                                    ? faTrash
                                                    : faTrashUndo
                                            }
                                        />
                                    }
                                />
                            </Popconfirm>
                        </Flex>
                    );
                }}
            />

            <Table.Column
                title="Email"
                key="email"
                dataIndex="email"
                sorter
                width={180}
            />
            {location.pathname === "/users" ? (
                <Table.Column
                    title="Username"
                    key="username"
                    dataIndex="username"
                    width={180}
                    sorter
                />
            ) : null}

            <Table.Column
                title="Full Name"
                key="fullname"
                dataIndex="fullname"
                width={180}
                sorter
            />
            <Table.Column
                title="Gender"
                key="gender"
                dataIndex="gender"
                width={180}
                sorter
            />
            <Table.Column
                title="Contact No"
                key="contact_no"
                dataIndex="contact_no"
                width={180}
                sorter
            />
            {location.pathname !== "/users" && (
                <>
                    <Table.Column
                        title="Address"
                        key="address"
                        dataIndex="address"
                        width={180}
                        sorter
                        render={(text, record) => {
                            return <RenderAddress record={record} />;
                        }}
                    />
                    <Table.Column
                        title="Taxpayers Identification"
                        key="taxpayer_identification"
                        dataIndex="taxpayer_identification"
                        width={250}
                        sorter
                    />
                </>
            )}

            {location.pathname === "/users" ? (
                <Table.Column
                    title="Role"
                    key="role"
                    dataIndex="role"
                    width={150}
                    sorter
                />
            ) : null}

            <Table.Column
                title="Status"
                key="status"
                dataIndex="status"
                width={100}
                align="center"
                sorter
            />
            <Table.Column
                title="Date Created"
                key="created_at_formatted"
                dataIndex="created_at_formatted"
                width={150}
                sorter
            />
        </Table>
    );
}
