import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Col, Popconfirm, Row, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../providers/CustomTableFilter";
import TableStudents from "./components/TableSystemLink";
import ModalSystemLink from "./components/ModalSystemLink";
import notificationErrors from "../../../providers/notificationErrors";
import useTableScrollOnTop from "../../../providers/useTableScrollOnTop";

export default function PageSystemLink() {
    const location = useLocation();

    const [toggleModalSystemLink, setToggleModalSystemLink] = useState({
        open: false,
        data: null,
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        status: "Active",
        from: location.pathname,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/system_link?${new URLSearchParams(tableFilter)}`,
        "system_link_list"
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
        mutate: mutateSystemLinkDeactivate,
        isLoading: loadingSystemLinkDeactivate,
    } = POST(`api/system_link_archived`, "system_link_list");

    const handleSelectedArchived = (status) => {
        let data = {
            ids: selectedRowKeys,
            status: status === "Active" ? "Archived" : "Active",
        };
        mutateSystemLinkDeactivate(data, {
            onSuccess: (res) => {
                console.log("res", res);
                if (res.success) {
                    notification.success({
                        message: "Department",
                        description: res.message,
                    });
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

    useTableScrollOnTop("table-system-link", location);

    return (
        <Row gutter={[12, 12]} id="tbl_wrapper">
            <Col xs={24} sm={24} md={24}>
                <Button
                    className="btn-main-primary min-w-150"
                    onClick={() =>
                        setToggleModalSystemLink({
                            open: true,
                            data: null,
                        })
                    }
                    name="btn_add"
                    icon={<FontAwesomeIcon icon={faPlus} />}
                >
                    Add System Link
                </Button>
            </Col>

            <Col xs={24} sm={24} md={24}>
                <div className="tbl-top-filter">
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                        }}
                    >
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

                        <TableGlobalSearchAnimated
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />

                        {selectedRowKeys.length > 0 && (
                            <Popconfirm
                                title={
                                    <>
                                        Are you sure you want to
                                        <br />
                                        {tableFilter.status === "Active"
                                            ? "archive"
                                            : "active"}{" "}
                                        the selected{" "}
                                        {selectedRowKeys.length > 1
                                            ? "faculties"
                                            : "faculty"}
                                        ?
                                    </>
                                }
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => {
                                    handleSelectedArchived(tableFilter.status);
                                }}
                            >
                                <Button
                                    className="btn-main-secondary"
                                    name="btn_active_archive"
                                    loading={loadingSystemLinkDeactivate}
                                >
                                    {tableFilter.status === "Active"
                                        ? "ARCHIVE"
                                        : "ACTIVATE"}{" "}
                                    SELECTED
                                </Button>
                            </Popconfirm>
                        )}
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
                <TableStudents
                    selectedRowKeys={selectedRowKeys}
                    setSelectedRowKeys={setSelectedRowKeys}
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    dataSource={dataSource}
                    onChangeTable={onChangeTable}
                    setToggleModalSystemLink={setToggleModalSystemLink}
                />
            </Col>

            <Col xs={24} sm={24} md={24}>
                <div className="tbl-bottom-filter">
                    <TableShowingEntriesV2 />
                    <TablePagination
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                        total={dataSource?.data.total}
                        showLessItems={true}
                        showSizeChanger={false}
                        tblIdWrapper="tbl_wrapper"
                    />
                </div>
            </Col>

            <ModalSystemLink
                toggleModalForm={toggleModalSystemLink}
                setToggleModalForm={setToggleModalSystemLink}
            />
        </Row>
    );
}
