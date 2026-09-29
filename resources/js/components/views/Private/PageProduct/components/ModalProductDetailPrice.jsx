import { useEffect } from "react";
import { Button, Col, Form, Modal, notification, Popconfirm, Row } from "antd";
import dayjs from "dayjs";

import { POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";
import FloatDatePicker from "../../../../providers/FloatDatePicker";
import FloatInputNumber from "../../../../providers/FloatInputNumber";
import FloatSelect from "../../../../providers/FloatSelect";

export default function ModalProductDetailPrice(props) {
    const {
        toggleModalProductDetailPrice,
        setToggleModalProductDetailPrice,
        productId,
        product_detail_id,
    } = props;

    const [form] = Form.useForm();

    const {
        mutate: mutateProductDetailPrice,
        isLoading: isLoadingProductDetail,
    } = POST(`api/product_detail_prices`, [
        `product_detail_prices_${product_detail_id}`,
        `product_details_list_${productId}`,
    ]);

    const onFinish = (values) => {
        let data = new FormData();
        data.append(
            "id",
            toggleModalProductDetailPrice &&
                toggleModalProductDetailPrice.data &&
                toggleModalProductDetailPrice.data.id
                ? toggleModalProductDetailPrice.data.id
                : "",
        );

        data.append("product_id", productId);

        data.append(
            "product_detail_id",
            product_detail_id ? product_detail_id : "",
        );
        data.append("cost", values.cost ?? "");
        data.append("dealers_price", values.dealers_price ?? "");
        data.append("wholesale_price", values.wholesale_price ?? "");
        data.append("srp", values.srp ?? "");
        data.append("fleet_price", values.fleet_price ?? "");
        data.append(
            "start_date",
            values.start_date
                ? dayjs(values.start_date).format("YYYY-MM-DD")
                : "",
        );
        data.append(
            "end_date",
            values.end_date ? dayjs(values.end_date).format("YYYY-MM-DD") : "",
        );

        mutateProductDetailPrice(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Product Detail Price",
                        description: res.message,
                    });

                    form.resetFields();
                    setToggleModalProductDetailPrice({
                        open: false,
                        data: null,
                    });
                } else {
                    notification.error({
                        message: "Product Detail Price",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useEffect(() => {
        if (toggleModalProductDetailPrice.data) {
            form.setFieldsValue({
                cost: toggleModalProductDetailPrice.data.cost,
                dealers_price: toggleModalProductDetailPrice.data.dealers_price,
                wholesale_price:
                    toggleModalProductDetailPrice.data.wholesale_price,
                srp: toggleModalProductDetailPrice.data.srp,
                fleet_price: toggleModalProductDetailPrice.data.fleet_price,
                start_date: dayjs(
                    toggleModalProductDetailPrice.data.start_date,
                ),
                end_date: dayjs(toggleModalProductDetailPrice.data.end_date),
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalProductDetailPrice]);

    return (
        <Modal
            wrapClassName="wrap-modal-product"
            title={`${
                toggleModalProductDetailPrice.data &&
                toggleModalProductDetailPrice.data.id
                    ? "Edit"
                    : "Add"
            } Product Detail Price`}
            open={toggleModalProductDetailPrice.open}
            onCancel={() => {
                form.resetFields();
                setToggleModalProductDetailPrice({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    key={1}
                    type="default"
                    onClick={() => {
                        form.resetFields();
                        setToggleModalProductDetailPrice({
                            open: false,
                            data: null,
                        });
                    }}
                    disabled={isLoadingProductDetail}
                >
                    CLOSE
                </Button>,
                <Popconfirm
                    key={2}
                    title="Are you sure you want to submit this product detail price?"
                    onConfirm={() => form.submit()}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                        className: "btn-main-invert",
                    }}
                    disabled={isLoadingProductDetail}
                >
                    <Button type="primary" loading={isLoadingProductDetail}>
                        SUBMIT
                    </Button>
                </Popconfirm>,
            ]}
        >
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                    <Form
                        form={form}
                        onFinish={onFinish}
                        onKeyDown={(e) =>
                            e.key === "Enter" && e.preventDefault()
                        }
                    >
                        <Row gutter={[12, 0]}>
                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={12}
                                xl={12}
                                xxl={12}
                            >
                                <Form.Item name="supplier">
                                    <FloatSelect
                                        label="Supplier"
                                        placeholder="Supplier"
                                        allowClear
                                        options={[
                                            {
                                                label: "If supplier doesn't exist, please add in Users page",
                                                value: "",
                                                disabled: true,
                                            },
                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={12}
                                xl={12}
                                xxl={12}
                            >
                                <Form.Item name="cost">
                                    <FloatInputNumber
                                        label="Cost"
                                        placeholder="Cost"
                                        type="number"
                                        required
                                    />
                                </Form.Item>
                            </Col>

                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={12}
                                xl={12}
                                xxl={12}
                            >
                                <Form.Item name="dealers_price">
                                    <FloatInputNumber
                                        label="Dealers Price"
                                        placeholder="Dealers Price"
                                        type="number"
                                    />
                                </Form.Item>
                            </Col>

                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={12}
                                xl={12}
                                xxl={12}
                            >
                                <Form.Item name="wholesale_price">
                                    <FloatInputNumber
                                        label="Wholesale Price"
                                        placeholder="Wholesale Price"
                                        type="number"
                                    />
                                </Form.Item>
                            </Col>

                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={12}
                                xl={12}
                                xxl={12}
                            >
                                <Form.Item name="srp">
                                    <FloatInputNumber
                                        label="SRP"
                                        placeholder="SRP"
                                        type="number"
                                    />
                                </Form.Item>
                            </Col>

                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={12}
                                xl={12}
                                xxl={12}
                            >
                                <Form.Item name="fleet_price">
                                    <FloatInputNumber
                                        label="Fleet Price"
                                        placeholder="Fleet Price"
                                        type="number"
                                    />
                                </Form.Item>
                            </Col>

                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={12}
                                xl={12}
                                xxl={12}
                            >
                                <Form.Item name="start_date">
                                    <FloatDatePicker
                                        label="Start Date"
                                        placeholder="Start Date"
                                        format={{
                                            format: "MM/DD/YYYY",
                                            type: "mask",
                                        }}
                                        onChange={(date, dateStr) => {
                                            if (dateStr) {
                                                let end_date =
                                                    form.getFieldValue(
                                                        "end_date",
                                                    );

                                                if (
                                                    !end_date ||
                                                    date > end_date
                                                ) {
                                                    form.setFieldsValue({
                                                        end_date: date,
                                                    });
                                                }
                                            } else {
                                                form.setFieldsValue({
                                                    end_date: null,
                                                });
                                            }
                                        }}
                                        required
                                    />
                                </Form.Item>
                            </Col>

                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={12}
                                xl={12}
                                xxl={12}
                            >
                                <Form.Item shouldUpdate>
                                    {() => {
                                        return (
                                            <Form.Item name="end_date">
                                                <FloatDatePicker
                                                    label="End Date"
                                                    placeholder="End Date"
                                                    disabled={
                                                        !form.getFieldValue(
                                                            "start_date",
                                                        )
                                                    }
                                                    disabledDate={(current) => {
                                                        return (
                                                            current &&
                                                            current <
                                                                form.getFieldValue(
                                                                    "start_date",
                                                                )
                                                        );
                                                    }}
                                                    format={{
                                                        format: "MM/DD/YYYY",
                                                        type: "mask",
                                                    }}
                                                    required
                                                />
                                            </Form.Item>
                                        );
                                    }}
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Modal>
    );
}
