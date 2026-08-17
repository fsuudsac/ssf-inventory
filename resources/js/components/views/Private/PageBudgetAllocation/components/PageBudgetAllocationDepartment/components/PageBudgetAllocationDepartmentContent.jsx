import { useContext, useEffect, useState } from "react";
import { Button, Col, Flex, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import PageBudgetAllocationDepartmentContext from "../PageBudgetAllocationDepartmentContext";
import { GET } from "../../../../../../providers/useAxiosQuery";
import FloatSelect from "../../../../../../providers/FloatSelect";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../../../providers/CustomTableFilter";
import ModalFormAllocation from "./ModalFormAllocation";
import TableDepartmentAllocation from "./TableDepartmentAllocation";

export default function PageBudgetAllocationDepartmentContent() {
    const { width, department, allowedButtons } = useContext(
        PageBudgetAllocationDepartmentContext,
    );

    const [tableFilter, setTableFilter] = useState({
        sort_field: "created_at",
        sort_order: "asc",
        page: 1,
        page_size: 25,
        search: "",
        isTrash: 0,
        department_id: "",
        school_year_id: "",
        allocation_type_id: "",
    });

    const [toggleModalFormAllocation, setToggleModalFormAllocation] = useState({
        open: false,
        data: null,
    });

    const { data: dataSchoolYear } = GET(
        `api/school_year?sort_field=id&sort_order=desc`,
        "school_year_dropdown",
        () => {},
        false,
    );
    const { data: dataAllocationType } = GET(
        `api/allocation_type?sort_field=allocation_type&sort_order=asc`,
        "allocation_type_dropdown",
        () => {},
        false,
    );

    const activeSchoolYearId =
        dataSchoolYear?.data?.find((item) => item.status === 1)?.id ||
        dataSchoolYear?.data?.[0]?.id ||
        "";
    const activeDepartmentId = department?.id || "";

    const effectiveTableFilter = {
        ...tableFilter,
        school_year_id: tableFilter.school_year_id || activeSchoolYearId || "",
        department_id: tableFilter.department_id || activeDepartmentId || "",
    };

    const queryParams = `api/department_allocation?${new URLSearchParams(effectiveTableFilter)}`;
    const queryKey = `department_allocation_${new URLSearchParams(effectiveTableFilter)}`;

    const {
        data: dataSource,
        refetch: refetchSource,
        isLoading: isLoadingSource,
        isFetching: isFetchingSource,
    } = GET(queryParams, queryKey, () => {}, false);

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

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24}>
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
                            label="Allocation Type"
                            placeholder="Allocation Type"
                            value={tableFilter.allocation_type_id || ""}
                            options={dataAllocationType?.data?.map((item) => ({
                                label: item.allocation_type,
                                value: item.id,
                            }))}
                            onChange={(value) => {
                                setTableFilter((prevState) => ({
                                    ...prevState,
                                    allocation_type_id: value ? value : "",
                                }));
                            }}
                        />
                    </Col>
                </Row>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24}>
                <Flex align="center" gap={15}>
                    <Button
                        name="btn_add"
                        type="primary"
                        className={width < 576 ? "w-full" : "min-w-[150px]"}
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() => {
                            setToggleModalFormAllocation({
                                open: true,
                                data: null,
                            });
                        }}
                    >
                        Allocation
                    </Button>
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24}>
                <Row gutter={[12, 12]} id="tbl_wrapper_department_allocation">
                    <Col xs={24} sm={24} md={24}>
                        <Flex
                            justify="space-between"
                            align="center"
                            className="tbl-top-filter"
                        >
                            <Flex align="center" gap={15}>
                                <Button
                                    type="primary"
                                    className={`${width < 576 ? "w-full" : "min-w-[150px]"} ${tableFilter.isTrash ? "outlined" : "active"}`}
                                    onClick={() => {
                                        setTableFilter((ps) => ({
                                            ...ps,
                                            isTrash: 0,
                                        }));
                                    }}
                                >
                                    Active
                                </Button>
                                <Button
                                    type="primary"
                                    className={`${width < 576 ? "w-full" : "min-w-[150px]"} ${tableFilter.isTrash ? "active" : "outlined"}`}
                                    onClick={() =>
                                        setTableFilter((ps) => ({
                                            ...ps,
                                            isTrash: 1,
                                        }))
                                    }
                                >
                                    Archived
                                </Button>
                            </Flex>

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
                                    tblIdWrapper="tbl_wrapper_department_allocation"
                                />
                            </Flex>
                        </Flex>
                    </Col>

                    <Col xs={24} sm={24} md={24}>
                        <TableDepartmentAllocation
                            dataSource={dataSource}
                            isLoadingSource={isLoadingSource}
                            isFetchingSource={isFetchingSource}
                            onChangeTable={onChangeTable}
                            tableFilter={tableFilter}
                            queryKey={queryKey}
                            setToggleModalFormAllocation={
                                setToggleModalFormAllocation
                            }
                            allowedButtons={allowedButtons}
                        />
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
                                    tblIdWrapper="tbl_wrapper_department_allocation"
                                />
                            </Flex>
                        </Flex>
                    </Col>
                </Row>
            </Col>

            <ModalFormAllocation
                toggleModalFormAllocation={toggleModalFormAllocation}
                setToggleModalFormAllocation={setToggleModalFormAllocation}
                queryKey={queryKey}
                effectiveTableFilter={effectiveTableFilter}
                department={department}
                dataAllocationType={dataAllocationType}
            />
        </Row>
    );
}
