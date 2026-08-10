import { useEffect, useState } from "react";
import { Button, Col, Flex, notification, Popconfirm, Row, Table } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";

export default function TableProductDetailPrice(props) {
    const { product_detail_id, setToggleModalProductDetailPrice } = props;

    const [isTrash, setIsTrash] = useState(0);

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/product_detail_prices?from=ModalProductDetail&product_detail_id=${product_detail_id}&isTrash=${isTrash}`,
        `product_detail_prices_${product_detail_id}`
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product_detail_id, isTrash]);

    const {
        mutate: mutateArchivedProductDetailPrice,
        isLoading: isLoadingArchivedProductDetailPrice,
    } = POST(
        `api/product_detail_price_archived`,
        "product_detail_price_archived"
    );

    const handleSelectedArchived = (record) => {
        let data = {
            id: record.id,
            isTrash: isTrash,
        };

        mutateArchivedProductDetailPrice(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Product Detail Price",
                        description: res.message,
                    });
                    refetchSource();
                } else {
                    notification.error({
                        message: "Product Detail Price",
                        description: res.message,
                    });
                }
            },
            onError: (error) => {
                notificationErrors(error);
            },
        });
    };

    return (
        <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Flex gap={15}>
                    <Button
                        className={`btn-main-primary ${
                            !isTrash ? "active" : "outlined"
                        }`}
                        onClick={() => setIsTrash(0)}
                    >
                        Active
                    </Button>

                    <Button
                        className={`btn-main-primary ${
                            isTrash ? "active" : "outlined"
                        }`}
                        onClick={() => setIsTrash(1)}
                    >
                        Archived
                    </Button>
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Table
                    dataSource={
                        dataSource && dataSource.data ? dataSource.data : []
                    }
                    pagination={false}
                    columns={[
                        {
                            title: "Action",
                            key: "action",
                            align: "center",
                            render: (text, record) => {
                                return (
                                    <Flex
                                        gap={15}
                                        align="center"
                                        justify="center"
                                    >
                                        <Button
                                            type="text"
                                            className="text-primary"
                                            icon={
                                                <FontAwesomeIcon
                                                    icon={faEdit}
                                                />
                                            }
                                            onClick={() =>
                                                setToggleModalProductDetailPrice(
                                                    {
                                                        open: true,
                                                        data: record,
                                                    }
                                                )
                                            }
                                        />
                                        <Popconfirm
                                            title={
                                                <>
                                                    Are you sure you want to
                                                    <br />
                                                    {!isTrash
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
                                            disabled={
                                                isLoadingArchivedProductDetailPrice
                                            }
                                        >
                                            <Button
                                                name="btn_delete"
                                                type="link"
                                                className={`btn-delete ${
                                                    isTrash === 1
                                                        ? "success"
                                                        : ""
                                                } w-auto h-auto`}
                                                icon={
                                                    <FontAwesomeIcon
                                                        icon={faTrash}
                                                    />
                                                }
                                                loading={
                                                    isLoadingArchivedProductDetailPrice
                                                }
                                            />
                                        </Popconfirm>
                                    </Flex>
                                );
                            },
                        },
                        {
                            title: "Cost",
                            dataIndex: "cost",
                            key: "cost",
                        },
                        {
                            title: "Dealers Price",
                            dataIndex: "dealers_price",
                            key: "dealers_price",
                        },
                        {
                            title: "Wholesale Price",
                            dataIndex: "wholesale_price",
                            key: "wholesale_price",
                        },
                        {
                            title: "SRP",
                            dataIndex: "srp",
                            key: "srp",
                        },
                        {
                            title: "Fleet Price",
                            dataIndex: "fleet_price",
                            key: "fleet_price",
                        },
                        {
                            title: "Start Date",
                            dataIndex: "start_date_formatted",
                            key: "start_date_formatted",
                        },
                        {
                            title: "End Date",
                            dataIndex: "end_date_formatted",
                            key: "end_date_formatted",
                        },
                    ]}
                />
            </Col>
        </Row>
    );
}
