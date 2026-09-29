import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Col, Flex, notification, Popconfirm, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../providers/CustomTableFilter";
import ModalFormEwtType from "./components/ModalFormEwtType";
import TableEwtType from "./components/TableEwtType";
import notificationErrors from "../../../providers/notificationErrors";
import PageEwtTypeContext from "./components/PageEwtTypeContext";
import useTableScrollOnTop from "../../../providers/useTableScrollOnTop";

export default function PageEwtType() {
    const location = useLocation();

    const [toggleModalFormEwtType, setToggleModalFormEwtType] = useState({
        open: false,
        data: null,
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_order: "desc",
        sort_field: "date_formatted",
        isTrash: 0,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/ewt_type?${new URLSearchParams(tableFilter)}`,
        "ewt_type_list",
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

    const { mutate: mutateDeleteEwtType, isLoading: isLoadingDeleteEwtType } =
        POST(`api/ewt_type_archived`, "ewt_type_list");

    const handleSelectedArchived = () => {
        let data = {
            isTrash: tableFilter.isTrash,
            ids: selectedRowKeys,
        };
        mutateDeleteEwtType(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "EWT Type",
                        description: res.message,
                    });
                    setSelectedRowKeys([]);
                } else {
                    notification.error({
                        message: "EWT Type",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useTableScrollOnTop("tbl_ewt_type", location);

    return (
        <PageEwtTypeContext.Provider
            value={{
                dataSource,
                toggleModalFormEwtType,
                setToggleModalFormEwtType,
                selectedRowKeys,
                setSelectedRowKeys,
                onChangeTable,
            }}
        >
            <Row gutter={[12, 12]} id="tbl_wrapper_ewt_type">
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Button
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        type="primary"
                        onClick={() =>
                            setToggleModalFormEwtType({
                                open: true,
                                data: null,
                            })
                        }
                        name="btn_add"
                    >
                        Add EWT Type
                    </Button>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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
                        </Flex>

                        <TablePageSize
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    </div>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <div className="tbl-top-filter">
                        <Flex gap={10}>
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
                                            {!tableFilter.isTrash
                                                ? "archive"
                                                : "restore"}{" "}
                                            the selected{" "}
                                            {selectedRowKeys.length > 1
                                                ? "ewt types"
                                                : "ewt type"}
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
                                        loading={isLoadingDeleteEwtType}
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

                        <Flex gap={10}>
                            <TableShowingEntriesV2 />

                            <TablePagination
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                                total={dataSource?.data.total}
                                showLessItems={true}
                                showSizeChanger={false}
                                tblIdWrapper="tbl_wrapper_product_type"
                            />
                        </Flex>
                    </div>
                </Col>

                <Col xs={24} sm={24} md={24}>
                    <TableEwtType />
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

                <ModalFormEwtType />
            </Row>
        </PageEwtTypeContext.Provider>
    );
}
