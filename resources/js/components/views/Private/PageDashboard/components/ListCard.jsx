import { useNavigate } from "react-router-dom";
import { Card, Col, Flex, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUpRightFromSquare,
    faBasketShoppingPlus,
    faBoxesStacked,
    faTags,
} from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../../providers/useAxiosQuery";
import formatToCurrency from "../../../../providers/formatToCurrency";

export default function ListCard() {
    const navigate = useNavigate();

    const { data: dataProductSalesAndPurchase } = GET(
        `api/product_sales_and_purchase`,
        "product_sales_and_purchase",
        (res) => {},
        false,
    );

    const { data: dataUser } = GET(`api/users`, "users", (res) => {}, false);

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={8} xl={6} xxl={6}>
                <Card>
                    <div
                        className="card-content"
                        onClick={() => navigate("/product")}
                    >
                        <Flex align="center" justify="space-between">
                            <Flex align="center">
                                <FontAwesomeIcon
                                    className="card-icon"
                                    icon={faBoxesStacked}
                                />
                                <h5 className="mb-0">Products</h5>
                            </Flex>

                            <h5 className="mb-0">
                                {dataProductSalesAndPurchase &&
                                dataProductSalesAndPurchase.countProduct
                                    ? dataProductSalesAndPurchase.countProduct
                                    : 0}
                            </h5>
                        </Flex>
                    </div>
                </Card>
            </Col>

            <Col xs={24} sm={24} md={24} lg={8} xl={6} xxl={6}>
                <Card>
                    <div
                        className="card-content"
                        onClick={() => navigate("/purchase-order")}
                    >
                        <Flex align="center" justify="space-between">
                            <Flex align="center">
                                <FontAwesomeIcon
                                    className="card-icon"
                                    icon={faBasketShoppingPlus}
                                />
                                <h5 className="mb-0">Purchase Order</h5>
                            </Flex>

                            <h5 className="mb-0">
                                ₱{" "}
                                {dataProductSalesAndPurchase &&
                                dataProductSalesAndPurchase.totalPurchase
                                    ? formatToCurrency(
                                          dataProductSalesAndPurchase.totalPurchase,
                                      )
                                    : 0}
                            </h5>
                        </Flex>
                    </div>
                </Card>
            </Col>

            <Col xs={24} sm={24} md={24} lg={8} xl={6} xxl={6}>
                <Card>
                    <div
                        className="card-content"
                        onClick={() => navigate("/release-item")}
                    >
                        <Flex align="center" justify="space-between">
                            <Flex align="center">
                                <FontAwesomeIcon
                                    className="card-icon"
                                    icon={faBasketShoppingPlus}
                                />
                                <h5 className="mb-0">Release Item</h5>
                            </Flex>

                            <h5 className="mb-0">
                                ₱{" "}
                                {dataProductSalesAndPurchase &&
                                dataProductSalesAndPurchase.totalSales
                                    ? formatToCurrency(
                                          dataProductSalesAndPurchase.totalSales,
                                      )
                                    : 0}
                            </h5>
                        </Flex>
                    </div>
                </Card>
            </Col>

            <Col xs={24} sm={24} md={12} lg={12} xl={3} xxl={3}>
                <Card>
                    <div
                        className="card-content"
                        onClick={() => navigate("/suppliers")}
                    >
                        <Flex align="center" justify="space-between">
                            <Flex align="center">
                                <FontAwesomeIcon
                                    className="card-icon"
                                    icon={faArrowUpRightFromSquare}
                                />
                                <h5 className="mb-0">Supplier</h5>
                            </Flex>

                            <h5 className="mb-0">
                                {dataUser && dataUser.data
                                    ? dataUser.data.filter(
                                          (user) => user.role === "Supplier",
                                      ).length
                                    : 0}
                            </h5>
                        </Flex>
                    </div>
                </Card>
            </Col>

            <Col xs={24} sm={24} md={12} lg={12} xl={3} xxl={3}>
                <Card>
                    <div
                        className="card-content"
                        onClick={() => navigate("/customers")}
                    >
                        <Flex align="center" justify="space-between">
                            <Flex align="center">
                                <FontAwesomeIcon
                                    className="card-icon"
                                    icon={faArrowUpRightFromSquare}
                                />
                                <h5 className="mb-0">Customer</h5>
                            </Flex>

                            <h5 className="mb-0">
                                {dataUser && dataUser.data
                                    ? dataUser.data.filter(
                                          (user) => user.role === "Customer",
                                      ).length
                                    : 0}
                            </h5>
                        </Flex>
                    </div>
                </Card>
            </Col>
        </Row>
    );
}
