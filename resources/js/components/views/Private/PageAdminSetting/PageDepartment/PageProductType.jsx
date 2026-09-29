import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Col, Flex, Popconfirm, Row, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

// Moved into PageAdminSetting/PageProductType/ — updated provider paths (one level deeper)
import { GET, POST } from "../../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
    useTableScrollOnTop,
} from "../../../../providers/CustomTableFilter";
import notificationErrors from "../../../../providers/notificationErrors";
import ModalFormProductType from "./components/ModalFormProductType";
import TableProductType from "./components/TableProductType";
import PageProductTypeContext from "./components/PageProductTypeContext";

export default function PageProductType() {
    const location = useLocation();

    const [toggleModalFormProductType, setToggleModalFormProductType] =
        useState({
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
        `api/product_type?${new URLSearchParams(tableFilter)}`,
        "product_type_list",
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
        mutate: mutateDeleteProductType,
        isLoading: isLoadingDeleteProductType,
    } = POST(`api/product_type_archived`, "product_type_list");

    const handleSelectedArchived = () => {
        let data = {
            isTrash: tableFilter.isTrash,
            ids: selectedRowKeys,
        };
        mutateDeleteProductType(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Product Type",
                        description: res.message,
                    });
                    setSelectedRowKeys([]);
                } else {
                    notification.error({
                        message: "Product Type",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useTableScrollOnTop("tbl_product_type", location);

    return (
        <PageProductTypeContext.Provider
            value={{
                dataSource,
                setTableFilter,
                toggleModalFormProductType,
                setToggleModalFormProductType,
                selectedRowKeys,
                setSelectedRowKeys,
                onChangeTable,
            }}
        >
            <Row gutter={[20, 20]} id="tbl_wrapper_product_type">
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Button
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        type="primary"
                        onClick={() =>
                            setToggleModalFormProductType({
                                open: true,
                                data: null,
                            })
                        }
                        name="btn_add"
                    >
                        Add Product Type
                    </Button>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <div className="tbl-top-filter">
                        <Flex gap={12}>
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
                                                ? "product types"
                                                : "product type"}
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
                                        name="btn_delete"
                                        loading={isLoadingDeleteProductType}
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

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <TableProductType />
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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
                                tblIdWrapper="tbl_wrapper_product_type"
                            />
                        </Flex>
                    </div>
                </Col>

                <ModalFormProductType />
            </Row>
        </PageProductTypeContext.Provider>
    );
}
