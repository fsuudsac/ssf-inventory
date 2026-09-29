import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Flex, notification, Popconfirm, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faPencil,
    faTrash,
    faTrashUndo,
} from "@fortawesome/pro-regular-svg-icons";

import { POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";
import PageProductContext from "./PageProductContext";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";

export default function TableProduct() {
    const {
        dataSource,
        onChangeTable,
        handleSelectedArchived,
        isLoadingDeleteProduct,
        setToggleModalProductDetails,
        tableFilter,
    } = useContext(PageProductContext);

    const navigate = useNavigate();

    const { mutate: mutateProductDetail, isLoading: isLoadingProductDetail } =
        POST(`api/product_detail_preview`, "product_detail_preview");

    const handleProductDetail = (record) => {
        let data = { product_id: record.id };

        mutateProductDetail(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setToggleModalProductDetails({
                        open: true,
                        data: res.data,
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

    useTableScrollOnTop("tbl_product", "tbl_product");

    return (
        <Table
            id="tbl_product"
            className="ant-table-default ant-table-striped"
            dataSource={dataSource && dataSource.data.data}
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            onChange={onChangeTable}
            scroll={{ x: "max-content" }}
            sticky
        >
            <Table.Column
                title="Action"
                key="action"
                dataIndex="action"
                align="center"
                width={100}
                render={(text, record) => {
                    return (
                        <Flex justify="center" gap={15}>
                            <Tooltip title="Edit">
                                <Button
                                    type="link"
                                    className="color-1"
                                    onClick={() =>
                                        navigate(`/product/edit/${record.id}`)
                                    }
                                    icon={<FontAwesomeIcon icon={faPencil} />}
                                    name="btn_edit"
                                />
                            </Tooltip>

                            <Popconfirm
                                title={
                                    <>
                                        Are you sure you want to
                                        <br />
                                        {tableFilter.isTrash === 1
                                            ? "active"
                                            : "archived"}{" "}
                                        this product?
                                    </>
                                }
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => {
                                    handleSelectedArchived(record);
                                }}
                                name="btn_delete"
                            >
                                <Button
                                    type="link"
                                    className="w-auto h-auto"
                                    danger={tableFilter.isTrash === 0}
                                    icon={
                                        <FontAwesomeIcon
                                            icon={
                                                tableFilter.isTrash === 0
                                                    ? faTrash
                                                    : faTrashUndo
                                            }
                                            color={
                                                tableFilter.isTrash === 0
                                                    ? "#dc3545"
                                                    : "#23bf08"
                                            }
                                        />
                                    }
                                    loading={isLoadingDeleteProduct}
                                    name="btn_delete"
                                />
                            </Popconfirm>
                        </Flex>
                    );
                }}
            />

            <Table.Column
                title="Product Name"
                key="product_name"
                dataIndex="product_name"
                sorter={true}
                width={180}
            />
            <Table.Column
                title="Description"
                key="description"
                dataIndex="description"
                sorter={true}
                width={180}
            />
            <Table.Column
                title="Product Category"
                key="product_category"
                dataIndex="product_category"
                sorter={true}
                width={180}
            />
            <Table.Column
                title="Created At"
                key="created_at_format"
                dataIndex="created_at_format"
                sorter={true}
                width={150}
            />
        </Table>
    );
}
