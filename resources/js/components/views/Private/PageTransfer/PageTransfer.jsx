import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Col, Flex, Popconfirm, Row, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../providers/useAxiosQuery";
import PageTransferContext from "./components/PageTransferContext";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../providers/CustomTableFilter";
import TableTransfer from "./components/TableTransfer";
import notificationErrors from "../../../providers/notificationErrors";
import ModalFormTransfer from "./components/ModalFormTransfer";
import useWindowDimensions from "../../../providers/useWindowDimensions";

export default function PageTransfer() {
    const location = useLocation();
    const { width } = useWindowDimensions();

    const [toggleModalFormTransfer, setToggleModalFormTransfer] = useState({
        open: false,
        data: null,
        disabled: false,
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "date_transfer_formatted",
        sort_order: "desc",
        isTrash: 0,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/transfers?${new URLSearchParams(tableFilter)}`,
        "transfer_list",
    );

    useEffect(() => {
        refetchSource();
        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    const { data: dataWareHouse } = GET(
        `api/warehouse`,
        "warehouse_dropdown",
        () => {},
        false,
    );

    const [productDetailFilter, setProductDetailFilter] = useState({
        from_warehouse_id: "",
    });

    const [productCategoryFilter, setProductCategoryFilter] = useState();

    const { data: dataProductDetails, refetch: refetchProductDetail } = GET(
        `api/product_details?${new URLSearchParams(productDetailFilter)}`,
        "product_details_dropdown",
        () => {},
        false,
    );

    const { data: dataProductCategory } = GET(
        `api/product_category`,
        "product_category_dropdown",
        () => {},
        false,
    );

    useEffect(() => {
        refetchProductDetail();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productDetailFilter]);

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
        mutate: mutateDeleteWarehouse,
        isLoading: isLoadingArchivedTransfer,
    } = POST(`api/transfer_multi_archived`, "transfer_list");

    const handleSelectedArchived = () => {
        let data = {
            isTrash: tableFilter.isTrash,
            ids: selectedRowKeys,
        };
        mutateDeleteWarehouse(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Transfer",
                        description: res.message,
                    });
                    setSelectedRowKeys([]);
                } else {
                    notification.error({
                        message: "Transfer",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const { mutate: mutateChangeStatus, isLoading: isLoadingChangeStatus } =
        POST(`api/transfer_change_status`, "transfer_list");

    const handleChangeStatus = (id, status) => {
        let data = {
            id: id,
            status: status,
        };
        mutateChangeStatus(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Transfer",
                        description: res.message,
                    });
                    setSelectedRowKeys([]);
                } else {
                    notification.error({
                        message: "Transfer",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    return (
        <PageTransferContext.Provider
            value={{
                dataSource,
                setSelectedRowKeys,
                selectedRowKeys,
                onChangeTable,
                toggleModalFormTransfer,
                setToggleModalFormTransfer,
                location,
                dataWareHouse,
                dataProductDetails,
                setProductDetailFilter,
                dataProductCategory,
                productCategoryFilter,
                setProductCategoryFilter,
                handleChangeStatus,
                isLoadingChangeStatus,
            }}
        >
            <Row gutter={[20, 20]} id="tbl_wrapper">
                <Col xs={24} sm={24} md={24}>
                    <Button
                        type="primary"
                        className={`${width < 576 ? "w-full" : "min-w-[150px]"}`}
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() =>
                            setToggleModalFormTransfer({
                                open: true,
                                data: null,
                                disabled: false,
                            })
                        }
                        name="btn_add"
                    >
                        Transfer
                    </Button>
                </Col>

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
                                    setSelectedRowKeys([]);
                                }}
                            >
                                Active
                            </Button>

                            <Button
                                type="primary"
                                className={`${width < 576 ? "w-full" : "min-w-[150px]"} ${tableFilter.isTrash ? "active" : "outlined"}`}
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

                            {selectedRowKeys.length > 0 && (
                                <Popconfirm
                                    title={
                                        <>
                                            Are you sure you want to
                                            <br />
                                            {!tableFilter.isTrash
                                                ? "archive"
                                                : "active"}{" "}
                                            the selected <br />
                                            {selectedRowKeys.length > 1
                                                ? "transfers"
                                                : "transfer"}
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
                                        className={`${width < 576 ? "w-full" : ""} ${tableFilter.isTrash ? "btn-success" : ""}`}
                                        danger={tableFilter.isTrash}
                                        name="btn_delete"
                                        loading={isLoadingArchivedTransfer}
                                    >
                                        {!tableFilter.isTrash
                                            ? "ARCHIVE"
                                            : "ACTIVATE"}{" "}
                                        SELECTED
                                    </Button>
                                </Popconfirm>
                            )}
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

                <Col xs={24} sm={24} md={24}>
                    <TableTransfer />
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

                <ModalFormTransfer />
            </Row>
        </PageTransferContext.Provider>
    );
}
