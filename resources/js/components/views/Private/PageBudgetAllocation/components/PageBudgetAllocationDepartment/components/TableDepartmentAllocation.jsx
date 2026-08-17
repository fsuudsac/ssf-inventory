import { useContext } from "react";
import {
    Button,
    Flex,
    notification,
    Popconfirm,
    Table,
    Tooltip,
    Typography,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBroomWide,
    faPencil,
    faTrash,
} from "@fortawesome/pro-regular-svg-icons";

import PageBudgetAllocationDepartmentContext from "../PageBudgetAllocationDepartmentContext";
import { POST } from "../../../../../../providers/useAxiosQuery";
import useTableScrollOnTop from "../../../../../../providers/useTableScrollOnTop";
import formatToCurrency from "../../../../../../providers/formatToCurrency";
import notificationErrors from "../../../../../../providers/notificationErrors";

export default function TableDepartmentAllocation(props) {
    const { location } = useContext(PageBudgetAllocationDepartmentContext);
    const {
        dataSource,
        isLoadingSource,
        isFetchingSource,
        onChangeTable,
        tableFilter,
        queryKey,
        setToggleModalFormAllocation,
        allowedButtons,
    } = props;

    const {
        mutate: mutateDeleteDepartmentAllocation,
        isLoading: isLoadingDeleteDepartmentAllocation,
    } = POST(`api/department_allocation_archived`, queryKey);

    const handleArchive = (record) => {
        let data = {
            isTrash: tableFilter.isTrash,
            id: record.id,
        };

        mutateDeleteDepartmentAllocation(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Department Allocation",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Department Allocation",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const { mutate: mutateBudgetSweep, isLoading: isLoadingBudgetSweep } = POST(
        `api/budget_sweep`,
        queryKey,
    );

    const handleBudgetSweep = (record) => {
        let data = {
            id: record.id,
        };

        mutateBudgetSweep(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Department Allocation",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Department Allocation",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const hasActions =
        allowedButtons?.btn_edit ||
        allowedButtons?.btn_delete ||
        allowedButtons?.btn_sweep;

    useTableScrollOnTop("tbl_department_allocation", location);

    console.log("allowedButtons: ", allowedButtons);

    return (
        <>
            <Table
                id="tbl_department_allocation"
                className="ant-table-default ant-table-striped"
                dataSource={dataSource?.data?.data || []}
                loading={isLoadingSource || isFetchingSource}
                rowKey={(record) => record.id}
                pagination={false}
                bordered={false}
                onChange={onChangeTable}
                scroll={{ x: "max-content" }}
                sticky
                summary={() => {
                    // parseFloat ensures string values from the API are treated as numbers
                    const totalAllocatedAmount = dataSource?.data?.data?.reduce(
                        (acc, curr) => acc + parseFloat(curr.base_amount || 0),
                        0,
                    );
                    const totalRemainingBalance =
                        dataSource?.data?.data?.reduce(
                            (acc, curr) =>
                                acc + parseFloat(curr.remaining_amount || 0),
                            0,
                        );

                    return (
                        <Table.Summary fixed>
                            <Table.Summary.Row>
                                <Table.Summary.Cell
                                    index={0}
                                    colSpan={3}
                                    align="right"
                                >
                                    <Typography.Text strong>
                                        Total
                                    </Typography.Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1}>
                                    {formatToCurrency(
                                        totalAllocatedAmount,
                                        "PHP",
                                        "currency",
                                    )}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2}>
                                    {formatToCurrency(
                                        totalRemainingBalance,
                                        "PHP",
                                        "currency",
                                    )}
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    );
                }}
            >
                {hasActions && (
                    <Table.Column
                        title="Action"
                        key="action"
                        dataIndex="action"
                        align="center"
                        width={100}
                        fixed="left"
                        render={(text, record) => (
                            <Flex justify="center" gap={15}>
                                <div name="btn_edit">
                                    <Tooltip title="Edit">
                                        <Button
                                            type="link"
                                            className="p-0 w-auto h-auto"
                                            icon={
                                                <FontAwesomeIcon
                                                    icon={faPencil}
                                                />
                                            }
                                            onClick={() => {
                                                setToggleModalFormAllocation({
                                                    open: true,
                                                    data: record,
                                                });
                                            }}
                                        />
                                    </Tooltip>
                                </div>
                                <div name="btn_delete">
                                    <Tooltip
                                        title={
                                            tableFilter.isTrash
                                                ? "Restore"
                                                : "Delete"
                                        }
                                    >
                                        <Popconfirm
                                            title={`Are you sure to ${tableFilter.isTrash ? "restore" : "archive"} this department allocation?`}
                                            onConfirm={() =>
                                                handleArchive(record)
                                            }
                                            onCancel={() => {}}
                                            okText="Yes"
                                            cancelText="No"
                                            okButtonProps={{
                                                className: "btn-main-invert",
                                            }}
                                            disabled={
                                                isLoadingDeleteDepartmentAllocation
                                            }
                                        >
                                            <Button
                                                type="link"
                                                className="p-0 w-auto h-auto"
                                                icon={
                                                    <FontAwesomeIcon
                                                        icon={faTrash}
                                                    />
                                                }
                                                loading={
                                                    isLoadingDeleteDepartmentAllocation
                                                }
                                                danger={!tableFilter.isTrash}
                                            />
                                        </Popconfirm>
                                    </Tooltip>
                                </div>
                                <div name="btn_sweep">
                                    <Tooltip title="Sweep Budget">
                                        <Popconfirm
                                            title="Are you sure to sweep the remaining balance of this department allocation?"
                                            onConfirm={() =>
                                                handleBudgetSweep(record)
                                            }
                                            onCancel={() => {}}
                                            okText="Yes"
                                            cancelText="No"
                                            okButtonProps={{
                                                className: "btn-main-invert",
                                            }}
                                            disabled={isLoadingBudgetSweep}
                                        >
                                            <Button
                                                type="link"
                                                className="p-0 w-auto h-auto"
                                                icon={
                                                    <FontAwesomeIcon
                                                        icon={faBroomWide}
                                                    />
                                                }
                                                loading={isLoadingBudgetSweep}
                                                disabled={
                                                    Number(
                                                        record.remaining_amount,
                                                    ) === 0
                                                }
                                            />
                                        </Popconfirm>
                                    </Tooltip>
                                </div>
                            </Flex>
                        )}
                    />
                )}
                <Table.Column
                    title="Allocation Type"
                    key="allocation_type"
                    dataIndex="allocation_type"
                    width={170}
                />
                <Table.Column
                    title="Allocation Name"
                    key="allocation_name"
                    dataIndex="allocation_name"
                />
                <Table.Column
                    title="Allocated Amount"
                    key="base_amount"
                    dataIndex="base_amount"
                    width={170}
                    render={(text) => formatToCurrency(text, "PHP", "currency")}
                />
                <Table.Column
                    title="Remaining Balance"
                    key="remaining_amount"
                    dataIndex="remaining_amount"
                    width={170}
                    render={(text) => formatToCurrency(text, "PHP", "currency")}
                />
                <Table.Column
                    title="Date Given"
                    key="date_given_formatted"
                    dataIndex="date_given_formatted"
                    width={170}
                />
                <Table.Column
                    title="Date Swept"
                    key="date_swept_formatted"
                    dataIndex="date_swept_formatted"
                    width={170}
                />
            </Table>
        </>
    );
}
