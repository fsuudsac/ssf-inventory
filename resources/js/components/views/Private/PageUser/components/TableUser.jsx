import { useNavigate } from "react-router-dom";
import { Table, Button, notification, Popconfirm, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faPencil,
    faTrash,
    faUserGear,
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";

export default function TableUser(props) {
    const {
        dataSource,
        tableFilter,
        setTableFilter,
        selectedRowKeys,
        setSelectedRowKeys,
    } = props;

    const navigate = useNavigate();

    const { mutate: mutateDeactivateUser, loading: loadingDeactivateUser } =
        POST(`api/user_deactivate`, "users_active_list");

    const handleDeactivate = (record) => {
        mutateDeactivateUser(record, {
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

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((ps) => ({
            ...ps,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
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
                render={(text, record) => {
                    return (
                        <Flex gap={10} justify="center">
                            <Button
                                type="link"
                                className="w-auto h-auto p-0 text-blue-500!"
                                onClick={() => {
                                    navigate(
                                        `${location.pathname}/permission/${record.id}`
                                    );
                                }}
                                name="btn_edit_permission"
                                title="Edit Permission"
                                icon={<FontAwesomeIcon icon={faUserGear} />}
                            />
                            <Button
                                type="link"
                                className="w-auto h-auto p-0 text-blue-500!"
                                onClick={() => {
                                    navigate(
                                        `${location.pathname}/edit/${record.id}`
                                    );
                                }}
                                name="btn_edit"
                                icon={<FontAwesomeIcon icon={faPencil} />}
                            />
                            <Popconfirm
                                title="Are you sure to deactivate this data?"
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
                            >
                                <Button
                                    type="link"
                                    className="w-auto h-auto p-0 text-red-500!"
                                    loading={loadingDeactivateUser}
                                    name="btn_delete"
                                    icon={<FontAwesomeIcon icon={faTrash} />}
                                />
                            </Popconfirm>
                        </Flex>
                    );
                }}
                width={150}
            />
            <Table.Column
                title="Start Date"
                key="created_at"
                dataIndex="created_at"
                render={(text, _) =>
                    text ? dayjs(text).format("MM/DD/YYYY") : ""
                }
                sorter
                width={150}
            />
            <Table.Column
                title="Full Name"
                key="fullname"
                dataIndex="fullname"
                sorter={true}
                render={(text, record) =>
                    text ? (
                        <Button
                            type="link"
                            className="p-0 w-auto h-auto"
                            onClick={() => {
                                navigate(
                                    `${location.pathname}/edit/${record.id}`
                                );
                            }}
                        >
                            {text}
                        </Button>
                    ) : null
                }
                width={220}
            />
            <Table.Column
                title="Email"
                key="email"
                dataIndex="email"
                sorter={true}
                align="center"
                render={(text, _) =>
                    text ? (
                        <Button
                            type="link"
                            className="p-0 w-auto h-auto"
                            icon={<FontAwesomeIcon icon={faEnvelope} />}
                            href={`mailto:${text}`}
                        />
                    ) : null
                }
                width={220}
            />
            <Table.Column
                title="Type"
                key="type"
                dataIndex="type"
                sorter
                width={150}
            />
            <Table.Column
                title="Role"
                key="role"
                dataIndex="role"
                sorter={true}
                width={150}
            />
            <Table.Column
                title="Status"
                key="status"
                dataIndex="status"
                sorter={true}
                align="center"
                width={150}
            />
        </Table>
    );
}
