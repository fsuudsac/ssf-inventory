import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Col, Flex, Popconfirm, Row, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";
import notificationErrors from "../../../../providers/notificationErrors";
import ModalFormDepartment from "./components/ModalFormDepartment";
import TableDepartment from "./components/TableDepartment";
import PageDepartmentContext from "./components/PageDepartmentContext";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";
import useWindowDimensions from "../../../../providers/useWindowDimensions";

export default function PageDepartment() {
    const location = useLocation();
    const { width } = useWindowDimensions();

    const [toggleModalFormDepartment, setToggleModalFormDepartment] = useState({
        open: false,
        data: null,
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "department_name",
        sort_order: "asc",
        isTrash: 0,
    });

    const {
        data: dataSource,
        refetch: refetchSource,
        isLoading: isLoadingSource,
        isFetching: isFetchingSource,
    } = GET(
        `api/department?${new URLSearchParams(tableFilter)}`,
        "department_list",
        () => {},
        false,
    );

    const { data: dataDepartmentType } = GET(
        `api/department_type`,
        "department_type_dropdown",
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
            page_size: "50",
        }));
    };

    const {
        mutate: mutateDeleteDepartment,
        isLoading: isLoadingDeleteDepartment,
    } = POST(`api/department_archived`, "department_list");

    const handleSelectedArchived = () => {
        let data = {
            isTrash: tableFilter.isTrash,
            ids: selectedRowKeys,
        };
        mutateDeleteDepartment(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Department",
                        description: res.message,
                    });
                    setSelectedRowKeys([]);
                } else {
                    notification.error({
                        message: "Department",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useTableScrollOnTop("tbl_department", location);

    return (
        <PageDepartmentContext.Provider
            value={{
                dataSource,
                isLoadingSource,
                isFetchingSource,
                setTableFilter,
                toggleModalFormDepartment,
                setToggleModalFormDepartment,
                selectedRowKeys,
                setSelectedRowKeys,
                onChangeTable,
                dataDepartmentType,
            }}
        >
            <Row gutter={[20, 20]} id="tbl_wrapper_department">
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Button
                        type="primary"
                        className={`${width < 576 ? "w-full" : "min-w-[150px]"}`}
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() =>
                            setToggleModalFormDepartment({
                                open: true,
                                data: null,
                            })
                        }
                        name="btn_add"
                    >
                        Department
                    </Button>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Flex
                        justify="space-between"
                        align="center"
                        className="tbl-top-filter"
                    >
                        <Flex
                            align="center"
                            gap={15}
                            className={width < 576 ? "w-full" : ""}
                        >
                            <Button
                                type="primary"
                                className={`${width < 576 ? "w-full" : "min-w-[150px]"} ${
                                    !tableFilter.isTrash ? "active" : "outlined"
                                }`}
                                onClick={() => {
                                    setTableFilter((ps) => ({
                                        ...ps,
                                        isTrash: 0,
                                    }));
                                    setSelectedRowKeys([]);
                                }}
                            >
                                Active
                            </Button>

                            <Button
                                type="primary"
                                className={`${width < 576 ? "w-full" : "min-w-[150px]"} ${
                                    tableFilter.isTrash ? "active" : "outlined"
                                }`}
                                onClick={() => {
                                    setTableFilter((ps) => ({
                                        ...ps,
                                        isTrash: 1,
                                    }));
                                    setSelectedRowKeys([]);
                                }}
                            >
                                Archived
                            </Button>
                        </Flex>

                        {width >= 576 && (
                            <TablePageSize
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />
                        )}
                    </Flex>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Flex
                        justify="space-between"
                        align="center"
                        className="tbl-top-filter"
                    >
                        <Flex
                            justify={
                                selectedRowKeys.length > 0
                                    ? "space-between"
                                    : "end"
                            }
                            align="center"
                            gap={15}
                            className={width < 576 ? "w-full" : ""}
                        >
                            {width >= 576 ? (
                                <TableGlobalSearchAnimated
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                />
                            ) : (
                                <>
                                    {width < 576 &&
                                        selectedRowKeys.length > 0 && (
                                            <Popconfirm
                                                title={
                                                    <>
                                                        Are you sure you want to
                                                        <br />
                                                        {!tableFilter.isTrash
                                                            ? "archive"
                                                            : "restore"}{" "}
                                                        the selected{" "}
                                                        {selectedRowKeys.length >
                                                        1
                                                            ? "departments"
                                                            : "department"}
                                                        ?
                                                    </>
                                                }
                                                okText="Yes"
                                                cancelText="No"
                                                onConfirm={() => {
                                                    handleSelectedArchived();
                                                }}
                                                name="btn_delete"
                                            >
                                                <Button
                                                    type="primary"
                                                    className={`${
                                                        tableFilter.isTrash
                                                            ? "btn-success"
                                                            : ""
                                                    } `}
                                                    danger={
                                                        !tableFilter.isTrash
                                                    }
                                                    name="btn_delete"
                                                    loading={
                                                        isLoadingDeleteDepartment
                                                    }
                                                >
                                                    {!tableFilter.isTrash
                                                        ? "ARCHIVE"
                                                        : "ACTIVATE"}{" "}
                                                    SELECTED
                                                </Button>
                                            </Popconfirm>
                                        )}

                                    <TablePageSize
                                        tableFilter={tableFilter}
                                        setTableFilter={setTableFilter}
                                    />
                                </>
                            )}
                        </Flex>

                        <Flex align="center" gap={15}>
                            <TableShowingEntriesV2 />

                            <TablePagination
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                                total={dataSource?.data.total}
                                showLessItems={true}
                                showSizeChanger={false}
                                tblIdWrapper="tbl_wrapper_department"
                            />
                        </Flex>
                    </Flex>
                </Col>

                {width >= 576 && selectedRowKeys.length > 0 ? (
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Popconfirm
                            title={
                                <>
                                    Are you sure you want to
                                    <br />
                                    {!tableFilter.isTrash
                                        ? "archive"
                                        : "restore"}{" "}
                                    the selected{" "}
                                    {selectedRowKeys.length > 1
                                        ? "departments"
                                        : "department"}
                                    ?
                                </>
                            }
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => {
                                handleSelectedArchived();
                            }}
                            name="btn_delete"
                        >
                            <Button
                                type="primary"
                                className={`${
                                    tableFilter.isTrash ? "btn-success" : ""
                                } `}
                                danger={!tableFilter.isTrash}
                                name="btn_delete"
                                loading={isLoadingDeleteDepartment}
                            >
                                {!tableFilter.isTrash ? "ARCHIVE" : "ACTIVATE"}{" "}
                                SELECTED
                            </Button>
                        </Popconfirm>
                    </Col>
                ) : null}

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <TableDepartment />
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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
                                tblIdWrapper="tbl_wrapper_department"
                            />
                        </Flex>
                    </Flex>
                </Col>

                <ModalFormDepartment />
            </Row>
        </PageDepartmentContext.Provider>
    );
}
