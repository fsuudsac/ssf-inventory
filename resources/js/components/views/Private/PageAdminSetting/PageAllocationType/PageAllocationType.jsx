import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Col, Flex, notification, Popconfirm, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import PageAllocationTypeContext from "./components/PageAllocationTypeContext";
import useWindowDimensions from "../../../../providers/useWindowDimensions";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";
import { GET, POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";
import TableAllocationType from "./components/TableAllocationType";
import ModalFormAllocationType from "./components/ModalFormAllocationType";

export default function PageAllocationType() {
    const location = useLocation();
    const { width } = useWindowDimensions();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [toggleModalFormAllocationType, setToggleModalFormAllocationType] =
        useState({
            open: false,
            data: null,
        });
    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "allocation_type",
        sort_order: "asc",
        isTrash: 0,
    });

    const {
        data: dataSource,
        refetch: refetchSource,
        isLoading: isLoadingSource,
        isFetching: isFetchingSource,
    } = GET(
        `api/allocation_type?${new URLSearchParams(tableFilter)}`,
        "allocation_type_list",
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
        mutate: mutateDeleteAllocationType,
        isLoading: isLoadingDeleteAllocationType,
    } = POST(`api/allocation_type_archived`, "allocation_type_list");

    const handleSelectedArchived = () => {
        let data = {
            isTrash: tableFilter.isTrash,
            ids: selectedRowKeys,
        };

        mutateDeleteAllocationType(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Allocation Type",
                        description: res.message,
                    });
                    setSelectedRowKeys([]);
                } else {
                    notification.error({
                        message: "Allocation Type",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useTableScrollOnTop("tbl_allocation_type", location);

    return (
        <PageAllocationTypeContext.Provider
            value={{
                dataSource,
                isLoadingSource,
                isFetchingSource,
                setTableFilter,
                toggleModalFormAllocationType,
                setToggleModalFormAllocationType,
                onChangeTable,
                selectedRowKeys,
                setSelectedRowKeys,
            }}
        >
            <Row gutter={[20, 20]} id="tbl_wrapper_allocation_type">
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Button
                        name="btn_add"
                        type="primary"
                        className={width < 576 ? "w-full" : "min-w-[150px]"}
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() => {
                            setToggleModalFormAllocationType({
                                open: true,
                                data: null,
                            });
                        }}
                    >
                        Allocation Type
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
                                                            ? "allocation types"
                                                            : "allocation type"}
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
                                                        isLoadingDeleteAllocationType
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
                                tblIdWrapper="tbl_wrapper_allocation_type"
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
                                        ? "allocation types"
                                        : "allocation type"}
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
                                loading={isLoadingDeleteAllocationType}
                            >
                                {!tableFilter.isTrash ? "ARCHIVE" : "ACTIVATE"}{" "}
                                SELECTED
                            </Button>
                        </Popconfirm>
                    </Col>
                ) : null}

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <TableAllocationType />
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
                                tblIdWrapper="tbl_wrapper_allocation_type"
                            />
                        </Flex>
                    </Flex>
                </Col>
            </Row>

            <ModalFormAllocationType />
        </PageAllocationTypeContext.Provider>
    );
}
