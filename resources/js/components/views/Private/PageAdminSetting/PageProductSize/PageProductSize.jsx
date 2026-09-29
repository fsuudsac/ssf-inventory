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
import ModalFormProductSize from "./components/ModalFormProductSize";
import TableProductSize from "./components/TableProductSize";
import PageProductSizeContext from "./components/PageProductSizeContext";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";
import useWindowDimensions from "../../../../providers/useWindowDimensions";

export default function PageProductSize() {
    const location = useLocation();
    const { width } = useWindowDimensions();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [toggleModalFormProductSize, setToggleModalFormProductSize] =
        useState({
            open: false,
            data: null,
        });
    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "date_formatted",
        sort_order: "desc",
        isTrash: 0,
    });

    const {
        data: dataSource,
        refetch: refetchSource,
        isLoading: isLoadingSource,
        isFetching: isFetchingSource,
    } = GET(
        `api/product_size?${new URLSearchParams(tableFilter)}`,
        "product_size_list",
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
        mutate: mutateDeleteProductSize,
        isLoading: isLoadingDeleteProductSize,
    } = POST(`api/product_size_archived`, "product_size_list");

    const handleSelectedArchived = () => {
        let data = {
            isTrash: tableFilter.isTrash,
            ids: selectedRowKeys,
        };
        mutateDeleteProductSize(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Product Size",
                        description: res.message,
                    });
                    setSelectedRowKeys([]);
                } else {
                    notification.error({
                        message: "Product Size",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useTableScrollOnTop("tbl_product_size", location);

    return (
        <PageProductSizeContext.Provider
            value={{
                dataSource,
                isLoadingSource,
                isFetchingSource,
                toggleModalFormProductSize,
                setToggleModalFormProductSize,
                selectedRowKeys,
                setSelectedRowKeys,
                onChangeTable,
            }}
        >
            <Row gutter={[20, 20]} id="tbl_wrapper_product_size">
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Button
                        type="primary"
                        className={width < 576 ? "w-full" : "min-w-[150px]"}
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() =>
                            setToggleModalFormProductSize({
                                open: true,
                                data: null,
                            })
                        }
                        name="btn_add"
                    >
                        Product Size
                    </Button>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Flex
                        justify="space-between"
                        align="center"
                        className="tbl-top-filter"
                    >
                        <Flex align="center" gap={15}>
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
                                                            ? "product sizes"
                                                            : "product size"}
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
                                                    className={`${width < 576 ? "w-full" : "min-w-[150px]"} ${
                                                        tableFilter.isTrash
                                                            ? "btn-success"
                                                            : ""
                                                    } `}
                                                    danger={
                                                        !tableFilter.isTrash
                                                    }
                                                    name="btn_delete"
                                                    loading={
                                                        isLoadingDeleteProductSize
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
                                tblIdWrapper="tbl_wrapper_product_size"
                            />
                        </Flex>
                    </Flex>
                </Col>

                {width >= 576 && selectedRowKeys.length > 0 && (
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
                                    ? "product sizes"
                                    : "product size"}
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
                            className={`${width < 576 ? "w-full" : "min-w-[150px]"} ${
                                tableFilter.isTrash ? "btn-success" : ""
                            } `}
                            danger={!tableFilter.isTrash}
                            name="btn_delete"
                            loading={isLoadingDeleteProductSize}
                        >
                            {!tableFilter.isTrash ? "ARCHIVE" : "ACTIVATE"}{" "}
                            SELECTED
                        </Button>
                    </Popconfirm>
                )}

                <Col xs={24} sm={24} md={24}>
                    <TableProductSize />
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
                                tblIdWrapper="tbl_wrapper"
                            />
                        </Flex>
                    </Flex>
                </Col>

                <ModalFormProductSize />
            </Row>
        </PageProductSizeContext.Provider>
    );
}
