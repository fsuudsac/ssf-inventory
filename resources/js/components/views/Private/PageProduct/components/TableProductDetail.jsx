import { useContext, useEffect, useState } from "react";
import { Button, Col, Flex, notification, Popconfirm, Row, Table } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlus, faTrash } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";
import ModalProductDetail from "./ModalProductDetail";
import PageProductFormContext from "./PageProductFormContext";
import notificationErrors from "../../../../providers/notificationErrors";

export default function TableProductDetail() {
    const { params } = useContext(PageProductFormContext);

    const [toggleModalFormProductDetail, setToggleModalFormProductDetail] =
        useState({
            open: false,
            data: null,
        });

    const [tableFilter, setTableFilter] = useState({
        product_id: params && params.id ? params.id : "",
        from: "product_info",
        isTrash: 0,
    });

    useEffect(() => {
        setTableFilter((ps) => ({
            ...ps,
            product_id: params && params.id ? params.id : "",
        }));

        return () => {};
    }, [params]);

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/product_details?${new URLSearchParams(tableFilter)}`,
        `product_details_list_${params && params.id ? params.id : ""}`,
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    const {
        mutate: mutateDeleteProductDetail,
        isLoading: isLoadingDeleteProductDetail,
    } = POST(
        `api/product_detail_delete`,
        `product_details_list_${params && params.id ? params.id : ""}`,
    );

    const handleSelectedArchived = (record) => {
        const data = {
            id: record.id,
            isTrash: tableFilter.isTrash,
        };

        mutateDeleteProductDetail(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Product Detail",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Product Detail",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useTableScrollOnTop("tbl_product_details", "tbl_product_details");

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Flex justify="space-between" align="center">
                    <Button
                        className="btn-main-primary"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() =>
                            setToggleModalFormProductDetail({
                                open: true,
                                data: null,
                            })
                        }
                    >
                        Add Product Details
                    </Button>

                    <Flex gap={10}>
                        <Button
                            className={`btn-main-primary ${
                                tableFilter.isTrash === 0
                                    ? "active"
                                    : "outlined"
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
                            className={`btn-main-primary ${
                                tableFilter.isTrash === 1
                                    ? "active"
                                    : "outlined"
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
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Table
                    id="tbl_product_details"
                    className="ant-table-default ant-table-striped"
                    dataSource={dataSource && dataSource.data}
                    rowKey={(record) => record.id}
                    pagination={false}
                    bordered={false}
                    scroll={{ x: "max-content" }}
                    sticky
                >
                    <Table.Column
                        title="Action"
                        key="action"
                        dataIndex="action"
                        align="center"
                        width={130}
                        render={(text, record) => {
                            return (
                                <Flex justify="center" gap={15}>
                                    <Button
                                        type="link"
                                        className="color-1 primary-color w-auto h-auto p-0"
                                        onClick={() =>
                                            setToggleModalFormProductDetail({
                                                open: true,
                                                data: record,
                                            })
                                        }
                                        icon={
                                            <FontAwesomeIcon icon={faPencil} />
                                        }
                                    />

                                    <Popconfirm
                                        title={
                                            <>
                                                Are you sure you want to
                                                <br />
                                                {!tableFilter.isTrash
                                                    ? "archive"
                                                    : "restore"}{" "}
                                                this price?
                                            </>
                                        }
                                        okText="Yes"
                                        cancelText="No"
                                        onConfirm={() => {
                                            handleSelectedArchived(record);
                                        }}
                                        name="btn_delete"
                                        disabled={isLoadingDeleteProductDetail}
                                    >
                                        <Button
                                            name="btn_delete"
                                            type="link"
                                            className={`btn-delete ${
                                                tableFilter.isTrash === 1
                                                    ? "success"
                                                    : ""
                                            } w-auto h-auto`}
                                            icon={
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                />
                                            }
                                            loading={
                                                isLoadingDeleteProductDetail
                                            }
                                        />
                                    </Popconfirm>
                                </Flex>
                            );
                        }}
                    />

                    <Table.Column // Type: Sales, Sales Return
                        width={180}
                        title="Product Type"
                        key="product_type"
                        dataIndex="product_type"
                    />

                    <Table.Column
                        width={180}
                        title="Product Size"
                        key="product_size"
                        dataIndex="product_size"
                    />

                    <Table.Column
                        width={150}
                        title="Reorder Point"
                        key="reorder_point"
                        dataIndex="reorder_point"
                    />

                    <Table.Column
                        width={150}
                        title="Cost Per Unit"
                        key="cost"
                        dataIndex="cost"
                    />

                    <Table.Column
                        width={150}
                        title="Dealers Price"
                        key="dealers_price"
                        dataIndex="dealers_price"
                    />

                    <Table.Column
                        width={150}
                        title="Wholesale Price"
                        key="wholesale_price"
                        dataIndex="wholesale_price"
                    />

                    <Table.Column
                        width={150}
                        title="SRP"
                        key="srp"
                        dataIndex="srp"
                    />

                    <Table.Column
                        width={150}
                        title="Fleet Price"
                        key="fleet_price"
                        dataIndex="fleet_price"
                    />

                    <Table.Column
                        width={180}
                        title="Effective Start Date"
                        key="start_date_format"
                        dataIndex="start_date_format"
                    />

                    <Table.Column
                        width={180}
                        title="Effective End Date"
                        key="end_date_format"
                        dataIndex="end_date_format"
                    />

                    <Table.Column // Type: Sales, Sales Return
                        width={100}
                        title="Created At"
                        key="created_at_format"
                        dataIndex="created_at_format"
                    />
                </Table>

                <ModalProductDetail
                    toggleModalFormProductDetail={toggleModalFormProductDetail}
                    setToggleModalFormProductDetail={
                        setToggleModalFormProductDetail
                    }
                    productId={params && params.id ? params.id : ""}
                />
            </Col>
        </Row>
    );
}
