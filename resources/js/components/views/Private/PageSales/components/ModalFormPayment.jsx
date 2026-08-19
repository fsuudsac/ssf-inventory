import { useContext, useEffect } from "react";
import {
    Modal,
    Button,
    Form,
    Row,
    Col,
    Flex,
    notification,
    Table,
    Popconfirm,
} from "antd";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import FloatInputNumber from "../../../../providers/FloatInputNumber";
import notificationErrors from "../../../../providers/notificationErrors";
import validateRules from "../../../../providers/validateRules";
import formatToCurrency from "../../../../providers/formatToCurrency";
import dayjs from "dayjs";
import PageFormSalesContext from "./PageFormSalesContext";

export default function ModalFormPayment() {
    const { toggleModalSalesPayment, setToggleModalSalesPayment } =
        useContext(PageFormSalesContext);

    const [form] = Form.useForm();

    const { data: dataUserPayments, refetch: refetchUserPayments } = GET(
        `api/user_payment?sales_id=${
            toggleModalSalesPayment &&
            toggleModalSalesPayment.data &&
            toggleModalSalesPayment.data.id
                ? toggleModalSalesPayment.data.id
                : ""
        }&net_amount_due=${
            toggleModalSalesPayment &&
            toggleModalSalesPayment.data &&
            toggleModalSalesPayment.data.net_amount_due
                ? toggleModalSalesPayment.data.net_amount_due
                : ""
        }`,
        `sales_user_payments_${
            toggleModalSalesPayment &&
            toggleModalSalesPayment.data &&
            toggleModalSalesPayment.data.id
                ? toggleModalSalesPayment.data.id
                : ""
        }`,
        () => {},
        false,
    );

    useEffect(() => {
        refetchUserPayments();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalSalesPayment]);

    // Payment
    const { mutate: mutatePayment, isLoading: isLoadingPayment } = POST(
        `api/user_payment`,
        ["user_payment_create", "sales_order_list"],
    );

    const onFinish = (values) => {
        let data = new FormData();

        let user_id = toggleModalSalesPayment.data.customer_id;
        let sales_id = toggleModalSalesPayment.data.id;

        data.append("amount", values.amount_payable);
        data.append("type", "Release Item");
        data.append("user_id", user_id);
        data.append("sales_id", sales_id);

        mutatePayment(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Payment",
                        description: res.message,
                    });
                    refetchUserPayments();
                    form.resetFields();
                    setToggleModalSalesPayment((ps) => ({
                        ...ps,
                        data: {
                            ...ps.data,
                            total_balance:
                                Number(ps.data.total_balance) -
                                Number(values.amount_payable),
                        },
                    }));
                } else {
                    notification.error({
                        message: "Payment",
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
        <Modal
            wrapClassName="wrap-modal-form-module wrap-modal-form-payment"
            title="Payment View"
            width={800}
            open={toggleModalSalesPayment.open}
            onCancel={() => {
                setToggleModalSalesPayment({
                    open: false,
                    data: null,
                });
            }}
            forceRender
            footer={[
                <Button
                    key={1}
                    type="default"
                    onClick={() => {
                        setToggleModalSalesPayment({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                    disabled={isLoadingPayment}
                >
                    CLOSE
                </Button>,
            ]}
        >
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form
                        form={form}
                        onFinish={onFinish}
                        onKeyDown={(e) =>
                            e.key === "Enter" && e.preventDefault()
                        }
                    >
                        <Row gutter={[20, 0]}>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                <Flex gap={15} vertical={true}>
                                    <Flex gap={15}>
                                        <div>Customer</div>
                                        <div
                                            style={{
                                                fontSize: "16px",
                                                fontWeight: "700",
                                                marginTop: "0px",
                                            }}
                                        >
                                            {
                                                toggleModalSalesPayment.data
                                                    ?.customer_name
                                            }
                                        </div>
                                    </Flex>
                                    <Flex gap={15}>
                                        <div>Balance</div>
                                        <div
                                            style={{
                                                fontSize: "16px",
                                                color: "#000",
                                                fontWeight: "700",
                                                marginTop: "0px",
                                            }}
                                        >
                                            {formatToCurrency(
                                                toggleModalSalesPayment.data
                                                    ?.total_balance,
                                            )}
                                        </div>
                                    </Flex>
                                    <Flex gap={15}>
                                        <div
                                            style={{
                                                fontSize: "16px",
                                                height: 40,
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            Payment
                                        </div>

                                        <Flex gap={10}>
                                            <Form.Item
                                                name="amount_payable"
                                                rules={[
                                                    validateRules.required(),
                                                    {
                                                        validator: (
                                                            _,
                                                            value,
                                                        ) => {
                                                            if (
                                                                toggleModalSalesPayment
                                                                    .data
                                                                    ?.total_balance
                                                            ) {
                                                                let total_balance =
                                                                    toggleModalSalesPayment
                                                                        .data
                                                                        ?.total_balance;

                                                                if (
                                                                    value >
                                                                    total_balance
                                                                ) {
                                                                    return Promise.reject(
                                                                        new Error(
                                                                            `Amount should not exceed to total balance of ${total_balance}`,
                                                                        ),
                                                                    );
                                                                }
                                                                return Promise.resolve();
                                                            }
                                                        },
                                                    },
                                                ]}
                                            >
                                                <FloatInputNumber
                                                    label="Amount"
                                                    placeholder="Amount"
                                                    required
                                                    type="number"
                                                />
                                            </Form.Item>

                                            <Popconfirm
                                                title="Are you sure you want to submit this payment?"
                                                onConfirm={() => form.submit()}
                                                okText="Yes"
                                                cancelText="No"
                                                okButtonProps={{
                                                    className:
                                                        "btn-main-invert",
                                                }}
                                                disabled={isLoadingPayment}
                                            >
                                                <Button
                                                    type="primary"
                                                    loading={isLoadingPayment}
                                                >
                                                    Submit
                                                </Button>
                                            </Popconfirm>
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </Col>
                        </Row>
                    </Form>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Table
                        className="ant-table-default ant-table-striped"
                        dataSource={
                            dataUserPayments ? dataUserPayments.data : []
                        }
                        rowKey={(record) => record.id}
                        pagination={false}
                        bordered={false}
                        scroll={{ x: "max-content" }}
                    >
                        <Table.Column
                            width={150}
                            title="Date Payment"
                            key="date_payment"
                            dataIndex="date_payment"
                            render={(text) => dayjs(text).format("DD/MM/YYYY")}
                        />

                        <Table.Column
                            width={150}
                            title="Amount Receivable"
                            key="amount_payable"
                            dataIndex="amount_payable"
                            render={(text) =>
                                formatToCurrency(text, "PHP", "currency")
                            }
                        />
                        <Table.Column
                            width={150}
                            title="Amount Collected"
                            key="amount"
                            dataIndex="amount"
                            render={(text) =>
                                formatToCurrency(text, "PHP", "currency")
                            }
                        />
                        <Table.Column
                            width={150}
                            title="Balance"
                            key="balance"
                            dataIndex="balance"
                            render={(text) =>
                                formatToCurrency(text, "PHP", "currency")
                            }
                        />
                    </Table>
                </Col>
            </Row>
        </Modal>
    );
}
