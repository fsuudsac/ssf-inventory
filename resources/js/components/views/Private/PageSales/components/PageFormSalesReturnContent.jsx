import { useContext } from "react";
import { Button, Card, Col, Divider, Flex, Form, Row } from "antd";

import validateRules from "../../../../providers/validateRules";
import FloatSelect from "../../../../providers/FloatSelect";
import PageFormSalesContext from "./PageFormSalesContext";
import FloatInput from "../../../../providers/FloatInput";
import FloatDatePicker from "../../../../providers/FloatDatePicker";
import formatToCurrency from "../../../../providers/formatToCurrency";
import FloatTextArea from "../../../../providers/FloatTextArea";

export default function PageFormSalesReturnContent() {
    const {
        form,
        dataCustomers,
        dataSalesOrder,
        setCustomerId,
        handleSalesOrderInfo,
        isLoadingSalesOrderInfo,
        isLoadingSalesOrderReturn,
    } = useContext(PageFormSalesContext);

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Card title="Invoice Information">
                    <Row gutter={[20, 0]}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                            <Form.Item
                                name="customer_id"
                                rules={[validateRules.required()]}
                            >
                                <FloatSelect
                                    label="Customer"
                                    placeholder="Select customer"
                                    required
                                    options={
                                        dataCustomers && dataCustomers.data
                                            ? dataCustomers.data.map(
                                                  (item) => ({
                                                      value: item.id,
                                                      label: item.fullname,
                                                  }),
                                              )
                                            : []
                                    }
                                    onChange={(value) => {
                                        setCustomerId(value ? value : "");
                                        form.resetFields(["sales_order_id"]);
                                    }}
                                    disabled={isLoadingSalesOrderInfo}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                            <Form.Item
                                name="sales_order_id"
                                rules={[validateRules.required()]}
                            >
                                <FloatSelect
                                    label="Invoice"
                                    placeholder="Select invoice"
                                    required
                                    options={
                                        dataSalesOrder && dataSalesOrder.data
                                            ? dataSalesOrder.data.map(
                                                  (item) => ({
                                                      value: item.id,
                                                      label: item.invoice_no,
                                                  }),
                                              )
                                            : []
                                    }
                                    onChange={(value) =>
                                        handleSalesOrderInfo(value)
                                    }
                                    disabled={isLoadingSalesOrderInfo}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Card className="card_sales_details">
                    <Row gutter={[20, 20]}>
                        <Col
                            xs={24}
                            sm={24}
                            md={24}
                            lg={24}
                            xl={24}
                            xxl={24}
                            className="mb-20"
                        >
                            <Form.Item shouldUpdate noStyle>
                                {() => {
                                    let sales_order_return_details =
                                        form.getFieldValue(
                                            "sales_order_return_details",
                                        );

                                    let total_selling_price = 0;

                                    if (sales_order_return_details) {
                                        sales_order_return_details.forEach(
                                            (item) => {
                                                let return_quantity =
                                                    item.return_quantity;
                                                let price = item.price;
                                                let total_price = 0;

                                                if (return_quantity && price) {
                                                    total_price =
                                                        Number(
                                                            return_quantity,
                                                        ) * Number(price);
                                                }

                                                total_selling_price +=
                                                    total_price;
                                            },
                                        );
                                    }

                                    return (
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Quantity</th>
                                                    <th>Return Quantity</th>
                                                    <th>Price</th>
                                                    <th>Total Price</th>
                                                </tr>
                                            </thead>

                                            <Form.List
                                                name="sales_order_return_details"
                                                noStyle
                                            >
                                                {(fields, { add, remove }) => (
                                                    <tbody>
                                                        {fields.map(
                                                            ({
                                                                key,
                                                                name,
                                                                ...restField
                                                            }) => {
                                                                let sales_order_return_detail =
                                                                    sales_order_return_details &&
                                                                    sales_order_return_details[
                                                                        name
                                                                    ];
                                                                let quantity =
                                                                    sales_order_return_detail?.quantity;
                                                                let product_info =
                                                                    sales_order_return_detail?.product_info;
                                                                let return_quantity =
                                                                    sales_order_return_detail?.return_quantity;
                                                                let price =
                                                                    sales_order_return_detail?.price;
                                                                let total_price = 0;

                                                                console.log(
                                                                    "product_info: ",
                                                                    product_info,
                                                                );

                                                                if (
                                                                    return_quantity &&
                                                                    price
                                                                ) {
                                                                    total_price =
                                                                        Number(
                                                                            return_quantity,
                                                                        ) *
                                                                        Number(
                                                                            price,
                                                                        );
                                                                }

                                                                return (
                                                                    <tr
                                                                        key={
                                                                            key
                                                                        }
                                                                    >
                                                                        <td>
                                                                            <div
                                                                                style={{
                                                                                    height: 40,
                                                                                }}
                                                                            >
                                                                                <Flex align="center">
                                                                                    <div>
                                                                                        {
                                                                                            product_info
                                                                                                .product
                                                                                                .product_name
                                                                                        }
                                                                                    </div>
                                                                                    <Divider type="vertical" />
                                                                                    <div>
                                                                                        {
                                                                                            product_info
                                                                                                .product_type
                                                                                                .product_type
                                                                                        }
                                                                                    </div>
                                                                                    <Divider type="vertical" />
                                                                                    <div>
                                                                                        {
                                                                                            product_info
                                                                                                .product_size
                                                                                                ?.product_size
                                                                                        }
                                                                                    </div>
                                                                                </Flex>
                                                                            </div>
                                                                        </td>

                                                                        <td>
                                                                            <div
                                                                                style={{
                                                                                    height: 40,
                                                                                }}
                                                                            >
                                                                                {
                                                                                    quantity
                                                                                }
                                                                            </div>
                                                                        </td>

                                                                        <td>
                                                                            <Form.Item
                                                                                {...restField}
                                                                                name={[
                                                                                    name,
                                                                                    "return_quantity",
                                                                                ]}
                                                                                rules={[
                                                                                    {
                                                                                        validator:
                                                                                            (
                                                                                                _,
                                                                                                value,
                                                                                            ) => {
                                                                                                if (
                                                                                                    value >
                                                                                                    Number(
                                                                                                        quantity,
                                                                                                    )
                                                                                                ) {
                                                                                                    return Promise.reject(
                                                                                                        `Total quantity: ${quantity}`,
                                                                                                    );
                                                                                                }
                                                                                                return Promise.resolve();
                                                                                            },
                                                                                    },
                                                                                ]}
                                                                            >
                                                                                <FloatInput
                                                                                    label="Return Quantity"
                                                                                    placeholder="Return Quantity"
                                                                                />
                                                                            </Form.Item>
                                                                        </td>
                                                                        <td>
                                                                            <div
                                                                                style={{
                                                                                    height: 40,
                                                                                }}
                                                                            >
                                                                                {formatToCurrency(
                                                                                    price,
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div
                                                                                style={{
                                                                                    height: 40,
                                                                                }}
                                                                            >
                                                                                {formatToCurrency(
                                                                                    total_price,
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            },
                                                        )}

                                                        <tr>
                                                            <td
                                                                colSpan={4}
                                                                className="text-right"
                                                            >
                                                                TOTAL:
                                                            </td>
                                                            <td>
                                                                <div
                                                                    style={{
                                                                        height: 40,
                                                                    }}
                                                                >
                                                                    {formatToCurrency(
                                                                        total_selling_price,
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                )}
                                            </Form.List>
                                        </table>
                                    );
                                }}
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                            <Form.Item
                                name="date_return"
                                rules={[validateRules.required()]}
                            >
                                <FloatDatePicker
                                    label="Date Return"
                                    placeholder="Date Return"
                                    required
                                    format={{
                                        type: "mask",
                                        format: "DD/MM/YYYY",
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                            <Form.Item
                                name="status"
                                rules={[validateRules.required()]}
                            >
                                <FloatSelect
                                    label="Status"
                                    placeholder="Select status"
                                    required
                                    options={[
                                        { value: "Pending", label: "Pending" },
                                        {
                                            value: "Completed",
                                            label: "Completed",
                                        },
                                        {
                                            value: "Canceled",
                                            label: "Canceled",
                                        },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                            <Form.Item name="remarks" noStyle>
                                <FloatTextArea
                                    label="Remarks"
                                    placeholder="Remarks"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Button
                    type="primary"
                    loading={isLoadingSalesOrderReturn}
                    htmlType="submit"
                >
                    Submit
                </Button>
            </Col>
        </Row>
    );
}
