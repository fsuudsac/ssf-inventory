import { useLocation } from "react-router-dom";
import { Row, Col, Table, Switch, notification, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/pro-regular-svg-icons";

import { POST } from "../../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";
import notificationErrors from "../../../../providers/notificationErrors";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";

export default function TableUserRolePermission(props) {
    const { dataSource, tableFilter, setTableFilter, user_role_id } = props;

    const location = useLocation();

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((ps) => ({
            ...ps,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    const { mutate: mutateChangeStatus, isLoading: isLoadingChangeStatus } =
        POST(`api/user_role_permission`, "user_role_permission_list");

    const handleChangeStatus = (e, values) => {
        if (tableFilter.role) {
            let data = {
                role: tableFilter.role,
                mod_button_id: values.id,
                status: e ? "1" : "0",
            };

            mutateChangeStatus(data, {
                onSuccess: (res) => {
                    if (res.success) {
                        notification.success({
                            message: "User Role Permission",
                            description: res.message,
                        });
                    } else {
                        notification.error({
                            message: "User Role Permission",
                            description: res.message,
                        });
                    }
                },
                onError: (err) => {
                    notificationErrors(err);
                },
            });
        } else {
            notification.error({
                message: "User Role Permission",
                description: "Please select Role",
            });
        }
    };

    useTableScrollOnTop(`tbl1_${user_role_id}`, location);

    return (
        <Row
            gutter={[20, 20]}
            id={`tbl_wrapper_user_role_permission_${user_role_id}`}
        >
            <Col xs={24} sm={24} md={24}>
                <Flex justify="space-between" align="center" gap={15}>
                    <div />

                    <TablePageSize
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />
                </Flex>
            </Col>
            <Col xs={24} sm={24} md={24}>
                <Flex
                    justify="space-between"
                    align="center"
                    className="tbl-top-filter"
                >
                    <Flex align="center" gap={15}>
                        <TableGlobalSearchAnimated
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    </Flex>

                    <Flex align="center" gap={15}>
                        <TableShowingEntriesV2 />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={dataSource?.data.total}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper={`tbl_wrapper_user_role_permission_${user_role_id}`}
                        />
                    </Flex>
                </Flex>
            </Col>
            <Col xs={24} sm={24} md={24}>
                <Table
                    id={`tbl1_${user_role_id}`}
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
                        title="Module Name"
                        key="module_name"
                        dataIndex="module_name"
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
                        title="Buttons"
                        key="buttons"
                        width={150}
                        render={(_, record) => {
                            return (
                                <Flex gap={10} vertical="vertical">
                                    {record.module_buttons.map(
                                        (item, index) => {
                                            let status = false;
                                            if (
                                                item.user_role_permissions
                                                    .length
                                            ) {
                                                let user_role_permissions =
                                                    item
                                                        .user_role_permissions[0]
                                                        .status;
                                                status =
                                                    parseInt(
                                                        user_role_permissions,
                                                    ) === 1
                                                        ? true
                                                        : false;
                                            }
                                            return (
                                                <span key={index}>
                                                    <Switch
                                                        checkedChildren={
                                                            <FontAwesomeIcon
                                                                icon={faCheck}
                                                            />
                                                        }
                                                        unCheckedChildren={
                                                            <FontAwesomeIcon
                                                                icon={faXmark}
                                                            />
                                                        }
                                                        checked={status}
                                                        onChange={(e) =>
                                                            handleChangeStatus(
                                                                e,
                                                                item,
                                                            )
                                                        }
                                                        loading={
                                                            isLoadingChangeStatus
                                                        }
                                                    />{" "}
                                                    {item.mod_button_name}
                                                </span>
                                            );
                                        },
                                    )}
                                </Flex>
                            );
                        }}
                    />
                </Table>
            </Col>
            <Col xs={24} sm={24} md={24}>
                <Flex
                    justify="space-between"
                    align="center"
                    className="tbl-bottom-filter"
                >
                    <div />

                    <Flex align="center" gap={15}>
                        <TableShowingEntriesV2 />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={dataSource?.data.total}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper={`tbl_wrapper_user_role_permission_${user_role_id}`}
                        />
                    </Flex>
                </Flex>
            </Col>
        </Row>
    );
}
