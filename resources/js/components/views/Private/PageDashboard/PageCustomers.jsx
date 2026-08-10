import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Col, Flex, Popconfirm, Row, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../providers/CustomTableFilter";
import TableCustomer from "../PageCustomers/components/TableCustomer";
import notificationErrors from "../../../providers/notificationErrors";

export default function PageCustomers() {
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        status: "Active",
        from: location.pathname,
        role: "Customer",
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/users?${new URLSearchParams(tableFilter)}`,
        "customer_list",
    );

    useEffect(() => {
        refetchSource();

        return () => {};
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
        mutate: mutateDeleteCustomer,
        isLoading: isLoadingArchivedSchedule,
    } = POST(`api/multiple_archived_customer`, "customer_list");

    const handleSelectedArchived = (status) => {
        let data = { status, ids: selectedRowKeys };
        mutateDeleteCustomer(data, {
            onSuccess: (res) => {
                notification[res.success ? "success" : "error"]({
                    message: "Customer",
                    description: res.message,
                });
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    return (
        <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24}>
                <Button
                    className="btn-main-primary btn-main-invert-outline b-r-none"
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    onClick={() => navigate(`/customers/add`)}
                    name="btn_add"
                >
                    Add Customer
                </Button>
            </Col>

            <Col xs={24} sm={24} md={24}>
                <div className="tbl-top-filter">
                    <div style={{ display: "flex", gap: 8 }}>
                        <Button
                            className={`btn-main-primary min-w-150 ${
                                tableFilter.status === "Active"
                                    ? "active"
                                    : "outlined"
                            }`}
                            onClick={() => {
                                setTableFilter((ps) => ({
                                    ...ps,
                                    status: "Active",
                                }));
                                setSelectedRowKeys([]);
                            }}
                        >
                            Active
                        </Button>

                        <Button
                            className={`btn-main-primary min-w-150 ${
                                tableFilter.status === "Archived"
                                    ? "active"
                                    : "outlined"
                            }`}
                            onClick={() => {
                                setTableFilter((ps) => ({
                                    ...ps,
                                    status: "Archived",
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
                                        {tableFilter.status === "Active"
                                            ? "archive"
                                            : "active"}{" "}
                                        the selected <br />
                                        {selectedRowKeys.length > 1
                                            ? "customers"
                                            : "customer"}
                                        ?
                                    </>
                                }
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => {
                                    handleSelectedArchived(
                                        tableFilter.status.includes("Active")
                                            ? "Active"
                                            : "Archived",
                                    );
                                }}
                            >
                                <Button
                                    className="btn-main-secondary"
                                    name="btn_active_archive"
                                    loading={isLoadingArchivedSchedule}
                                >
                                    {tableFilter.status.includes("Active")
                                        ? "ARCHIVE"
                                        : "ACTIVATE"}{" "}
                                    SELECTED
                                </Button>
                            </Popconfirm>
                        )}

                        <TableGlobalSearchAnimated
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                        }}
                    >
                        <TableShowingEntriesV2 />

                        <TablePageSize
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    </div>
                </div>
            </Col>

            <Col xs={24} sm={24} md={24}>
                <TableCustomer
                    dataSource={dataSource}
                    onChangeTable={onChangeTable}
                    selectedRowKeys={selectedRowKeys}
                    setSelectedRowKeys={setSelectedRowKeys}
                />
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
        </Row>
    );
}
