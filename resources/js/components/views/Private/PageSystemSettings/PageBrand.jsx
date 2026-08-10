import { useEffect, useState } from "react";
import { Button, Col, Flex, Popconfirm, Row, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInboxArrowDown, faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../providers/CustomTableFilter";
import TableBrand from "./components/TableBrand";
import notificationErrors from "../../../providers/notificationErrors";
import ModalFormBrand from "./components/ModalFormBrand";
import ModalImportBrand from "./components/ModalImportBrand";

export default function PageBrand() {
    const [toggleModalFormBrand, setToggleModalFormBrand] = useState({
        open: false,
        data: null,
    });

    const [toggleModalImportBrand, setToggleModalImportBrand] = useState({
        open: false,
        data: null,
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_order: "asc",
        sort_field: "date_formatted",
        status: "Active",
    });

    const { data: dataSourceBrand, refetch: refetchSource } = GET(
        `api/brand?${new URLSearchParams(tableFilter)}`,
        "brand_list"
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

    const { mutate: mutateDeleteBrand, isLoading: isLoadingDeleteBrand } = POST(
        `api/brand_archived`,
        "brand_list"
    );

    const handleSelectedArchived = (status) => {
        let data = {
            status: status === "Active" ? "Archived" : "Active",
            ids: selectedRowKeys,
        };
        mutateDeleteBrand(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Brand",
                        description: res.message,
                    });
                    setSelectedRowKeys([]);
                } else {
                    notification.error({
                        message: "Brand",
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
        <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                {/* <Button
                    icon={<FontAwesomeIcon icon={faInboxArrowDown} />}
                    className="btn-main-primary mr-10"
                    onClick={() =>
                        setToggleModalImportBrand({
                            open: true,
                            data: null,
                        })
                    }
                >
                    Import File
                </Button> */}

                <Button
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    className="btn-main-primary"
                    onClick={() =>
                        setToggleModalFormBrand({
                            open: true,
                            data: null,
                        })
                    }
                >
                    Add Brand
                </Button>
            </Col>

            <Col xs={24} sm={24} md={24}>
                <div className="tbl-top-filter">
                    <Flex gap={10}>
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
                                            ? "Brands"
                                            : "Brand"}
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
                                    loading={isLoadingDeleteBrand}
                                >
                                    {tableFilter.status === "Active"
                                        ? "ARCHIVE"
                                        : "ACTIVATE"}{" "}
                                    SELECTED
                                </Button>
                            </Popconfirm>
                        )}
                    </Flex>

                    <Flex gap={10}>
                        <TableShowingEntriesV2 />

                        <TablePageSize
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    </Flex>
                </div>
            </Col>

            <Col xs={24} sm={24} md={24}>
                <TableBrand
                    dataSourceBrand={dataSourceBrand}
                    setToggleModalFormBrand={setToggleModalFormBrand}
                    selectedRowKeys={selectedRowKeys}
                    setSelectedRowKeys={setSelectedRowKeys}
                    onChangeTable={onChangeTable}
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
                            total={dataSourceBrand?.data.total}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper="tbl_wrapper"
                        />
                    </Flex>
                </div>
            </Col>

            <ModalFormBrand
                toggleModalFormBrand={toggleModalFormBrand}
                setToggleModalFormBrand={setToggleModalFormBrand}
            />

            <ModalImportBrand
                toggleModalImportBrand={toggleModalImportBrand}
                setToggleModalImportBrand={setToggleModalImportBrand}
            />
        </Row>
    );
}
