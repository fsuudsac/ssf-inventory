import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Col, Flex, Row, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../../providers/useAxiosQuery";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";
import FloatSelect from "../../../../providers/FloatSelect";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";
import formatToCurrency from "../../../../providers/formatToCurrency";

export default function PageBudgetAllocationContent(props) {
    const { location } = props;
    const navigate = useNavigate();

    const [tableFilter, setTableFilter] = useState({
        sort_field: "department_name",
        sort_order: "asc",
        page: 1,
        page_size: 25,
        search: "",
        department_type_id: "",
        school_year_id: "",
    });

    const { data: dataSchoolYear } = GET(
        `api/school_year?sort_field=id&sort_type=desc`,
        "school_year_dropdown",
        () => {},
        false,
    );
    const { data: dataDepartmentType } = GET(
        `api/department_type`,
        "department_type_dropdown",
        () => {},
        false,
    );

    const activeSchoolYearId =
        dataSchoolYear?.data?.find((item) => item.status === 1)?.id ||
        dataSchoolYear?.data?.[0]?.id ||
        "";

    const effectiveTableFilter = {
        ...tableFilter,
        school_year_id: tableFilter.school_year_id || activeSchoolYearId || "",
    };

    const {
        data: dataSource,
        refetch: refetchSource,
        isLoading: isLoadingSource,
        isFetching: isFetchingSource,
    } = GET(
        `api/department?${new URLSearchParams(effectiveTableFilter)}`,
        `department_${new URLSearchParams(effectiveTableFilter)}`,
        () => {},
        false,
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((prevState) => ({
            ...prevState,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "25",
        }));
    };

    useTableScrollOnTop("tbl_budget_allocation", location);

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Row gutter={[12, 12]}>
                    <Col xs={24} sm={24} md={6}>
                        <FloatSelect
                            label="School Year"
                            placeholder="School Year"
                            value={effectiveTableFilter.school_year_id || ""}
                            options={dataSchoolYear?.data?.map((item) => ({
                                label: `${item.sy_from} - ${item.sy_to}`,
                                value: item.id,
                            }))}
                            onChange={(value) => {
                                setTableFilter((prevState) => ({
                                    ...prevState,
                                    school_year_id: value ? value : "",
                                }));
                            }}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={6}>
                        <FloatSelect
                            label="Department Type"
                            placeholder="Department Type"
                            value={tableFilter.department_type_id || ""}
                            options={dataDepartmentType?.data?.map((item) => ({
                                label: item.department_type,
                                value: item.id,
                            }))}
                            onChange={(value) => {
                                setTableFilter((prevState) => ({
                                    ...prevState,
                                    department_type_id: value ? value : "",
                                }));
                            }}
                        />
                    </Col>
                </Row>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Row gutter={[12, 12]} id="tbl_wrapper_budget_allocation">
                    <Col xs={24} sm={24} md={24}>
                        <Flex
                            justify="space-between"
                            align="center"
                            className="tbl-top-filter"
                        >
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
                            <TableGlobalSearchAnimated
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />

                            <Flex align="center" gap={15}>
                                <TableShowingEntriesV2
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                />
                                <TablePagination
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                    total={dataSource?.data?.total || 0}
                                    showLessItems={true}
                                    showSizeChanger={false}
                                    tblIdWrapper="tbl_wrapper_budget_allocation"
                                />
                            </Flex>
                        </Flex>
                    </Col>

                    <Col xs={24} sm={24} md={24}>
                        <Table
                            id="tbl_budget_allocation"
                            className="ant-table-default ant-table-striped"
                            dataSource={dataSource?.data?.data || []}
                            loading={isLoadingSource || isFetchingSource}
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
                                fixed="left"
                                render={(text, record) => (
                                    <Flex justify="center" gap={15}>
                                        <div name="btn_view">
                                            <Tooltip title="View">
                                                <Button
                                                    type="link"
                                                    icon={
                                                        <FontAwesomeIcon
                                                            icon={faEye}
                                                        />
                                                    }
                                                    onClick={() => {
                                                        navigate(
                                                            `/budget-allocation/${record.id}`,
                                                        );
                                                    }}
                                                />
                                            </Tooltip>
                                        </div>
                                    </Flex>
                                )}
                            />
                            <Table.Column
                                title="Abbreviation"
                                key="abbr"
                                dataIndex="abbr"
                                width={150}
                            />
                            <Table.Column
                                title="Department"
                                key="department_name"
                                dataIndex="department_name"
                            />
                            <Table.Column
                                title="Department Type"
                                key="department_type"
                                dataIndex="department_type"
                                width={200}
                            />
                            <Table.Column
                                title="Allocated Amount"
                                key="allocated_amount"
                                dataIndex="allocated_amount"
                                width={170}
                                render={(_, record) => {
                                    const departmentAllocation =
                                        record.ref_department_allocations;
                                    const totalAllocatedAmount =
                                        departmentAllocation.reduce(
                                            (acc, curr) =>
                                                acc +
                                                parseFloat(
                                                    curr.base_amount || 0,
                                                ),
                                            0,
                                        );

                                    return formatToCurrency(
                                        totalAllocatedAmount,
                                        "PHP",
                                        "currency",
                                    );
                                }}
                            />
                            <Table.Column
                                title="Remaining Balance"
                                key="remaining_balance"
                                dataIndex="remaining_balance"
                                width={170}
                                render={(_, record) => {
                                    const departmentAllocation =
                                        record.ref_department_allocations;
                                    const totalRemainingBalance =
                                        departmentAllocation.reduce(
                                            (acc, curr) =>
                                                acc +
                                                parseFloat(
                                                    curr.remaining_amount || 0,
                                                ),
                                            0,
                                        );

                                    return formatToCurrency(
                                        totalRemainingBalance,
                                        "PHP",
                                        "currency",
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
                                <TableShowingEntriesV2
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                />
                                <TablePagination
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                    total={dataSource?.data?.total || 0}
                                    showLessItems={true}
                                    showSizeChanger={false}
                                    tblIdWrapper="tbl_wrapper_budget_allocation"
                                />
                            </Flex>
                        </Flex>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
}
