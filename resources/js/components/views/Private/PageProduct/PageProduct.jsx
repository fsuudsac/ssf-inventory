import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Col, Flex, notification, Popconfirm, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../providers/useAxiosQuery";
import notificationErrors from "../../../providers/notificationErrors";
import TableProduct from "./components/TableProduct";
import ModalImportProducts from "./components/ModalImportProducts";
import ModalProductDetailPreview from "./components/ModalProductDetailPreview";
import PageProductContext from "./components/PageProductContext";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../providers/CustomTableFilter";

export default function PageProduct() {
    const location = useLocation();
    const navigate = useNavigate();

    const [toggleModalProductDetails, setToggleModalProductDetails] = useState({
        open: false,
        data: null,
    });
    const [toggleModalImportProduct, setToggleModalImportProduct] = useState({
        open: false,
        data: null,
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at_format",
        sort_order: "desc",
        isTrash: 0,
        from: location.pathname,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/products?${new URLSearchParams(tableFilter)}`,
        "products_list",
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

    const { mutate: mutateDeleteProduct, isLoading: isLoadingDeleteProduct } =
        POST(`api/product_archived`, "product_list");

    const handleSelectedArchived = (record) => {
        let data = {
            isTrash: tableFilter.isTrash,
            ids: [record.id],
        };

        mutateDeleteProduct(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Product Canvas Price",
                        description: res.message,
                    });
                    refetchSource();
                } else {
                    notification.error({
                        message: "Product Canvas Price",
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
        <PageProductContext.Provider
            value={{
                dataSource,
                onChangeTable,
                handleSelectedArchived,
                isLoadingDeleteProduct,
                toggleModalProductDetails,
                setToggleModalProductDetails,
                toggleModalImportProduct,
                setToggleModalImportProduct,
                tableFilter,
            }}
        >
            <Row gutter={[12, 12]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Flex gap={12}>
                        <Button
                            className="btn-main-primary"
                            onClick={() => navigate("/product/add")}
                            icon={<FontAwesomeIcon icon={faPlus} />}
                            name="btn_add"
                        >
                            Add Product Canvas
                        </Button>

                        {/* <Button
                        icon={<FontAwesomeIcon icon={faInboxArrowDown} />}
                        className="btn-main-primary"
                        onClick={() =>
                            setToggleModalImportProduct({
                                open: true,
                                data: null,
                            })
                        }
                    >
                        Import File
                    </Button> */}
                    </Flex>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <div className="tbl-top-filter">
                        <Flex gap={12}>
                            <Button
                                className={`btn-main-primary min-w-150 ${
                                    !tableFilter.isTrash ? "active" : "outlined"
                                }`}
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
                                className={`btn-main-primary min-w-150 ${
                                    tableFilter.isTrash ? "active" : "outlined"
                                }`}
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
                    </div>
                </Col>

                <Col xs={24} sm={24} md={24}>
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
                                                : "active"}{" "}
                                            the selected <br />
                                            {selectedRowKeys.length > 1
                                                ? "products"
                                                : "product"}
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
                                        className="btn-main-secondary"
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

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <TableProduct />
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

                <ModalImportProducts />
                <ModalProductDetailPreview />
            </Row>
        </PageProductContext.Provider>
    );
}
