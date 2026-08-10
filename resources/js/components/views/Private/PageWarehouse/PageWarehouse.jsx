import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Col, Flex, Form, Popconfirm, Row, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../providers/CustomTableFilter";
import PageWarehouseContext from "./components/PageWarehouseContext";
import TableWarehouse from "./components/TableWarehouse";
import ModalFormWarehouse from "./components/ModalFormWarehouse";
import notificationErrors from "../../../providers/notificationErrors";

export default function PageWarehouse() {
    const location = useLocation();
    const [form] = Form.useForm();

    const [toggleModalFormWarehouse, setToggleModalFormWarehouse] = useState({
        open: false,
        data: null,
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "date_formatted",
        sort_order: "desc",
        isTrash: 0,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/warehouse?${new URLSearchParams(tableFilter)}`,
        "warehouse_list",
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
        mutate: mutateDeleteWarehouse,
        isLoading: isLoadingArchivedSchedule,
    } = POST(`api/multiple_archived_warehouse`, "warehouse_list");

    const handleSelectedArchived = () => {
        let data = {
            isTrash: tableFilter.isTrash,
            ids: selectedRowKeys,
        };
        mutateDeleteWarehouse(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Warehouse",
                        description: res.message,
                    });
                    setSelectedRowKeys([]);
                } else {
                    notification.error({
                        message: "Warehouse",
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
        POST(`api/warehouse_change_status`, "warehouse_list");

    const handleChangeStatus = (checked, record) => {
        let data = {
            id: record.id,
            status: checked ? 1 : 0,
        };

        mutateChangeStatus(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Warehouse",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Warehouse",
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
        <PageWarehouseContext.Provider
            value={{
                location,
                dataSource,
                setSelectedRowKeys,
                selectedRowKeys,
                onChangeTable,
                handleChangeStatus,
                isLoadingChangeStatus,
                toggleModalFormWarehouse,
                setToggleModalFormWarehouse,
            }}
        >
            <Row gutter={[12, 12]} id="tbl_wrapper">
                <Col xs={24} sm={24} md={24}>
                    <Button
                        className="btn-main-primary btn-main-invert-outline b-r-none"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() =>
                            setToggleModalFormWarehouse({
                                open: true,
                            })
                        }
                        name="btn_add"
                    >
                        Add Warehouse
                    </Button>
                </Col>

                <Col xs={24} sm={24} md={24}>
                    <div className="tbl-top-filter">
                        <Flex gap={10}>
                            <Button
                                className={`btn-main-primary min-w-150 ${
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
                                className={`btn-main-primary min-w-150 ${
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
                                                ? "warehouses"
                                                : "warehouse"}
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
                                        className={`${
                                            tableFilter.isTrash
                                                ? "btn-success"
                                                : "btn-main-secondary"
                                        } `}
                                        loading={isLoadingArchivedSchedule}
                                        name="btn_delete"
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
                    </div>
                </Col>

                <Col xs={24} sm={24} md={24}>
                    <div className="tbl-top-filter">
                        <TableGlobalSearchAnimated
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />

                        <TableShowingEntriesV2 />
                    </div>
                </Col>

                <Col xs={24} sm={24} md={24}>
                    <TableWarehouse />
                </Col>

                <Col xs={24} sm={24} md={24}>
                    <div className="tbl-bottom-filter">
                        <div />

                        <Flex>
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
                    </div>
                </Col>

                <ModalFormWarehouse />
            </Row>
        </PageWarehouseContext.Provider>
    );
}
