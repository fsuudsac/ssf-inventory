import { useEffect, useState } from "react";
import { Button, Col, Flex, Row, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlus, faTrash } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../../providers/useAxiosQuery";
import ModalProductDetail from "./ModalProductDetail";

export default function TableProductDetail(props) {
    const { productId } = props;

    const [toggleModalFormProductDetail, setToggleModalFormProductDetail] =
        useState({
            open: false,
            data: null,
        });

    const [tableFilter, setTableFilter] = useState({
        product_id: productId,
        from: "product_info",
    });

    useEffect(() => {
        setTableFilter((ps) => ({
            ...ps,
            product_id: productId,
        }));

        return () => {};
    }, [productId]);

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/product_details?${new URLSearchParams(tableFilter)}`,
        "product_details_list"
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Table
                    className="ant-table-default ant-table-striped"
                    dataSource={dataSource && dataSource.data}
                    rowKey={(record) => record.id}
                    pagination={false}
                    bordered={false}
                    scroll={{ x: "max-content" }}
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
                                    <Tooltip title="Edit">
                                        <Button
                                            type="link"
                                            className="color-1 primary-color w-auto h-auto p-0"
                                            onClick={() =>
                                                setToggleModalFormProductDetail(
                                                    {
                                                        open: true,
                                                        data: record,
                                                    }
                                                )
                                            }
                                            icon={
                                                <FontAwesomeIcon
                                                    icon={faPencil}
                                                />
                                            }
                                        />
                                    </Tooltip>

                                    <Tooltip title="Delete">
                                        <Button
                                            type="link"
                                            className="btn-delete w-auto h-auto"
                                            icon={
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                />
                                            }
                                        />
                                    </Tooltip>
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
                        width={150}
                        title="Reorder Point"
                        key="Reorder Point"
                        dataIndex="Reorder Point"
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
                    productId={productId}
                />
            </Col>
        </Row>
    );
}
