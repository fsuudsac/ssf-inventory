import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Col, Flex, notification, Row, Select } from "antd";

import { GET, POST } from "../../../providers/useAxiosQuery";
import notificationErrors from "../../../providers/notificationErrors";
import TableInventory from "./components/TableInventory";
import PageInventoryContext from "./components/PageInventoryContext";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../providers/CustomTableFilter";
import useWindowDimensions from "../../../providers/useWindowDimensions";
import FloatSelect from "../../../providers/FloatSelect";

export default function PageInventory() {
    const location = useLocation();
    const { width } = useWindowDimensions();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "available_stock",
        sort_order: "desc",
        isTrash: 0,
        from: location.pathname,
        warehouse_ids: "",
    });

    const { data: dataWarehouse } = GET(
        `api/warehouse`,
        "warehouse_dropdown_list",
        (res) => {},
        false,
    );

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/product_inventory?${new URLSearchParams(tableFilter)}`,
        "product_inventory_list",
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
        mutate: mutateDeleteProduct,
        isLoading: isLoadingInventoryArchive,
    } = POST(`api/product_detail_delete`, "product_inventory_list");

    const handleSelectedArchived = (record) => {
        let data = {
            isTrash: tableFilter.isTrash,
            id: record.id,
        };

        mutateDeleteProduct(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Product",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Product",
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
        <PageInventoryContext.Provider
            value={{
                dataSource,
                tableFilter,
                onChangeTable,
                handleSelectedArchived,
                isLoadingInventoryArchive,
                location,
            }}
        >
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Row gutter={[12, 12]}>
                        <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                            <FloatSelect
                                label="Warehouse"
                                placeholder="Warehouse"
                                allowClear
                                value={
                                    tableFilter.warehouse_ids
                                        ? tableFilter.warehouse_ids
                                        : null
                                }
                                options={
                                    dataWarehouse && dataWarehouse.data
                                        ? dataWarehouse.data.map((item) => ({
                                              label: item.warehouse_name,
                                              value: item.id,
                                          }))
                                        : []
                                }
                                onChange={(value) => {
                                    setTableFilter((ps) => ({
                                        ...ps,
                                        warehouse_ids:
                                            value !== undefined ? value : "",
                                    }));
                                }}
                            />
                        </Col>
                    </Row>
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
                                className={`${width < 576 ? "w-full" : "min-w-[150px]"} ${tableFilter.isTrash ? "outlined" : "active"}`}
                                onClick={() =>
                                    setTableFilter((ps) => ({
                                        ...ps,
                                        isTrash: 0,
                                    }))
                                }
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
                        <Flex align="center" gap={15}>
                            <TableGlobalSearchAnimated
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />
                        </Flex>

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
                                            ? "stored products"
                                            : "stored product"}
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

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <TableInventory />
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
            </Row>
        </PageInventoryContext.Provider>
    );
}
