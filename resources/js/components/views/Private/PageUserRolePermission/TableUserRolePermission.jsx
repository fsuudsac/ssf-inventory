import { Row, Col, Table, Space, Switch, notification, Flex } from "antd";
import {
    TableGlobalSearch,
    TablePageSize,
    TablePagination,
    TableShowingEntries,
} from "../../../providers/CustomTableFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/pro-regular-svg-icons";
import { POST } from "../../../providers/useAxiosQuery";

export default function TableUserRolePermission(props) {
    const { dataSource, tableFilter, setTableFilter } = props;

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((ps) => ({
            ...ps,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    const { mutate: mutateChangeStatus, loading: loadingChangeStatus } = POST(
        `api/user_role_permission`,
        "user_role_permission_list"
    );

    // Bulk toggle — same endpoint, called once per button in the module
    const {
        mutate: mutateMultiChangeStatus,
        isLoading: isLoadingMultiChangeStatus,
    } = POST(`api/user_role_permission`, "user_role_permission_list");

    const handleChangeStatus = (e, values) => {
        if (tableFilter.user_role_id) {
            let data = {
                user_role_id: tableFilter.user_role_id,
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
                onError: () => {
                    notification.error({
                        message: "User Role Permission",
                        description: "Something went wrong",
                    });
                },
            });
        } else {
            notification.error({
                message: "User Role Permission",
                description: "Please select Role",
            });
        }
    };

    // Toggle ALL buttons in a module on/off at once
    const handleMultiChangeStatus = (e, moduleButtons) => {
        if (!tableFilter.user_role_id) {
            notification.error({
                message: "User Role Permission",
                description: "Please select Role",
            });
            return;
        }

        moduleButtons.forEach((item) => {
            mutateMultiChangeStatus(
                {
                    user_role_id: tableFilter.user_role_id,
                    mod_button_id: item.id,
                    status: e ? "1" : "0",
                },
                {
                    onError: () => {
                        notification.error({
                            message: "User Role Permission",
                            description: "Something went wrong",
                        });
                    },
                }
            );
        });
    };

    return (
        <Row
            gutter={[12, 12]}
            id={`tbl_wrapper_user_role_permission_${tableFilter.user_role_id}`}
        >
            <Col xs={24} sm={24} md={24}>
                <div className="tbl-top-filter">
                    <TablePageSize
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />
                    <TableGlobalSearch
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />
                </div>
            </Col>
            <Col xs={24} sm={24} md={24}>
                <Table
                    className="ant-table-default ant-table-striped"
                    dataSource={dataSource && dataSource.data.data}
                    rowKey={(record) => record.id}
                    pagination={false}
                    bordered={false}
                    onChange={onChangeTable}
                    scroll={{ x: "max-content" }}
                >
                    <Table.Column
                        title="Module Code"
                        key="module_code"
                        dataIndex="module_code"
                        sorter={true}
                    />

                    <Table.Column
                        title="Module Name"
                        key="module_name"
                        dataIndex="module_name"
                        sorter={true}
                    />

                    <Table.Column
                        title="Description"
                        key="description"
                        dataIndex="description"
                        sorter={true}
                    />

                    <Table.Column
                        title="Buttons"
                        key="buttons"
                        render={(_, record) => {
                            if (!record.module_buttons.length) return null;

                            // Derive per-button status from user_role_permissions
                            const buttonsWithStatus = record.module_buttons.map(
                                (item) => ({
                                    ...item,
                                    status:
                                        item.user_role_permissions.length &&
                                        parseInt(
                                            item.user_role_permissions[0].status
                                        ) === 1,
                                })
                            );

                            // ALL is checked only when every button in the module is enabled
                            const allChecked =
                                buttonsWithStatus.length > 0 &&
                                buttonsWithStatus.every((item) => item.status);

                            return (
                                <Space direction="vertical">
                                    {/* ALL toggle — enables/disables every button in this module at once */}
                                    <Flex gap={10} align="center">
                                        <Switch
                                            checkedChildren={
                                                <FontAwesomeIcon icon={faCheck} />
                                            }
                                            unCheckedChildren={
                                                <FontAwesomeIcon icon={faXmark} />
                                            }
                                            checked={allChecked}
                                            onChange={(e) =>
                                                handleMultiChangeStatus(
                                                    e,
                                                    record.module_buttons
                                                )
                                            }
                                            loading={
                                                loadingChangeStatus ||
                                                isLoadingMultiChangeStatus
                                            }
                                        />
                                        <span>ALL</span>
                                    </Flex>

                                    {/* Individual button toggles */}
                                    {buttonsWithStatus.map((item, index) => (
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
                                                checked={item.status}
                                                onChange={(e) =>
                                                    handleChangeStatus(e, item)
                                                }
                                                loading={
                                                    loadingChangeStatus ||
                                                    isLoadingMultiChangeStatus
                                                }
                                            />{" "}
                                            {item.mod_button_name}
                                        </span>
                                    ))}
                                </Space>
                            );
                        }}
                    />
                </Table>
            </Col>
            <Col xs={24} sm={24} md={24}>
                <div className="tbl-bottom-filter">
                    <div />

                    <Flex>
                        <TableShowingEntries />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={dataSource?.data.total}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper={`tbl_wrapper_user_role_permission_${tableFilter.user_role_id}`}
                        />
                    </Flex>
                </div>
            </Col>
        </Row>
    );
}
