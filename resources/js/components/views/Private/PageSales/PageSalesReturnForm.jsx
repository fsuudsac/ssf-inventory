import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Col, Form, notification, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { GET, POST } from "../../../providers/useAxiosQuery";
import PageFormSalesContext from "./components/PageFormSalesContext";
import PageFormSalesReturnContent from "./components/PageFormSalesReturnContent";
import notificationErrors from "../../../providers/notificationErrors";

export default function PageSalesReturnForm() {
    const navigate = useNavigate();
    const params = useParams();
    const [form] = Form.useForm();

    const [customerId, setCustomerId] = useState("");

    const { data: dataCustomers } = GET(
        `api/users?roles=Customer`,
        "users_customer_dropdown",
        (res) => {},
        false,
    );

    const { data: dataSalesOrder, refetch: refetchSalesOrders } = GET(
        `api/sales?customer_id=${customerId}&from=FormSalesReturn`,
        "sales_dropdown",
        (res) => {},
        false,
    );

    useEffect(() => {
        refetchSalesOrders();

        return () => {};
    }, [customerId]);

    if (params && params.id) {
        GET(
            `api/sales_order_return/${params.id}`,
            "sales_order_return",
            (res) => {
                if (res.data) {
                    let data = res.data;
                    let sales_order = data?.sales_order;
                    console.log("data: ", data);

                    setCustomerId(sales_order?.customer_id);

                    form.setFieldsValue({
                        customer_id: sales_order?.customer_id,
                        sales_order_id:
                            sales_order && sales_order.id
                                ? Number(sales_order.id)
                                : null,
                        date_return: dayjs(data.date_return),
                        remarks: data.remarks,
                        status: data.status,
                        sales_order_return_details:
                            data.sales_order_return_details.map((item) => {
                                let price = item.sales_order_detail.price;

                                let total_price = item.quantity * price;

                                return {
                                    ...item,
                                    product_info: item.product_detail,
                                    return_quantity: item.quantity,
                                    quantity: item.sales_order_detail.quantity,
                                    price: item.sales_order_detail.price,
                                    total_price,
                                };
                            }),
                    });
                }
            },
            false,
        );
    }

    const {
        mutate: mutateSalesOrderReturn,
        isLoading: isLoadingSalesOrderReturn,
    } = POST(`api/sales_order_return`, "sales_order_return");

    const onFinish = (values) => {
        let data = {
            ...values,
            date_return: values.date_return
                ? dayjs(values.date_return).format("YYYY-MM-DD")
                : null,
            id: params && params.id ? params.id : null,
        };
        mutateSalesOrderReturn(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Release Item Return",
                        description: res.message,
                    });

                    navigate("/release-item?tab=sales_return");
                } else {
                    notification.warning({
                        message: "Release Item Return",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const { mutate: mutateSalesOrderInfo, isLoading: isLoadingSalesOrderInfo } =
        POST(`api/sales_order_info`, "sales_order_info");

    const handleSalesOrderInfo = (value) => {
        let data = dataSalesOrder.data.find((item) => item.id === value);

        mutateSalesOrderInfo(data, {
            onSuccess: (res) => {
                if (res.success) {
                    let data = res.data;

                    form.setFieldsValue({
                        sales_order_return_details:
                            data.sales_order_details.map((item) => {
                                let product_detail = item.product_detail;

                                return {
                                    sales_order_detail_id: item.id,
                                    product_detail_id: item.product_detail_id,
                                    quantity: item.quantity,
                                    return_quantity: null,
                                    product_info: product_detail,
                                    price: item.price,
                                    total_selling_price: null,
                                };
                            }),
                    });
                } else {
                    notification.warning({
                        message: "Release Item Return",
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
        <PageFormSalesContext.Provider
            value={{
                form,
                dataCustomers,
                dataSalesOrder,
                customerId,
                setCustomerId,
                handleSalesOrderInfo,
                isLoadingSalesOrderInfo,
                isLoadingSalesOrderReturn,
            }}
        >
            <Row gutter={[20, 20]}>
                <Col sm={24} md={24} lg={24} xl={24} xxl={24}>
                    <Button
                        className="btn-main-invert-outline b-r-none"
                        icon={<FontAwesomeIcon icon={faArrowLeft} />}
                        onClick={() => navigate(-1)}
                    >
                        Back to list
                    </Button>
                </Col>

                <Col sm={24} md={24} lg={24} xl={24} xxl={24}>
                    <Form
                        form={form}
                        onFinish={onFinish}
                        initialValues={{
                            status: "Completed",
                        }}
                    >
                        <PageFormSalesReturnContent />
                    </Form>
                </Col>
            </Row>
        </PageFormSalesContext.Provider>
    );
}
