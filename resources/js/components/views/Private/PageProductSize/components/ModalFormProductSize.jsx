import { useContext, useEffect } from "react";
import { Modal, Button, Form, notification, Popconfirm, Row, Col } from "antd";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import notificationErrors from "../../../../providers/notificationErrors";
import FloatInput from "../../../../providers/FloatInput";
import PageProductSizeContext from "./PageProductSizeContext";

export default function ModalFormProductSize() {
    const { toggleModalFormProductSize, setToggleModalFormProductSize } =
        useContext(PageProductSizeContext);

    const [form] = Form.useForm();

    const { mutate: mutateProducSize, isLoading: isLoadingProductSize } = POST(
        `api/product_size`,
        "product_size_list",
    );

    const onFinish = (values) => {
        let type =
            values && values.type
                ? values.type
                : toggleModalFormProductSize.type;

        let data = {
            ...values,
            type,
            id:
                toggleModalFormProductSize.data &&
                toggleModalFormProductSize.data.id
                    ? toggleModalFormProductSize.data.id
                    : "",
        };

        mutateProducSize(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Product Size",
                        description: res.message,
                    });

                    setToggleModalFormProductSize({ open: false, data: null });

                    form.resetFields();
                } else {
                    notification.error({
                        message: "Product Size",
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
        if (toggleModalFormProductSize.open) {
            form.setFieldsValue({
                ...toggleModalFormProductSize.data,
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormProductSize]);

    return (
        <Modal
            title={`${
                toggleModalFormProductSize &&
                toggleModalFormProductSize.data &&
                toggleModalFormProductSize.data.id
                    ? "Edit"
                    : "Add"
            } Product Size`}
            open={toggleModalFormProductSize.open}
            onCancel={() => {
                setToggleModalFormProductSize({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    key={1}
                    type="default"
                    onClick={() => {
                        setToggleModalFormProductSize({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                >
                    CANCEL
                </Button>,
                <Popconfirm
                    key={2}
                    title="Are you sure you want to submit this product size?"
                    onConfirm={() => form.submit()}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                        className: "btn-main-invert",
                    }}
                    disabled={isLoadingProductSize}
                >
                    <Button type="primary" loading={isLoadingProductSize}>
                        SUBMIT
                    </Button>
                </Popconfirm>,
            ]}
        >
            <Form
                form={form}
                onFinish={onFinish}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            >
                <Row gutter={[12, 0]}>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item
                            name="product_size"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput
                                label="Product Size"
                                placeholder="Product Size"
                                required
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
