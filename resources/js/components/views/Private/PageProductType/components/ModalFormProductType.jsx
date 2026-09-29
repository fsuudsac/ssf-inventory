import { useContext, useEffect } from "react";
import { Modal, Button, Form, notification, Popconfirm, Row, Col } from "antd";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import notificationErrors from "../../../../providers/notificationErrors";
import FloatInput from "../../../../providers/FloatInput";
import PageProductTypeContext from "./PageProductTypeContext";

export default function ModalFormProductType() {
    const { toggleModalFormProductType, setToggleModalFormProductType } =
        useContext(PageProductTypeContext);

    const [form] = Form.useForm();

    const { mutate: mutateProductType, isLoading: isLoadingProductType } = POST(
        `api/product_type`,
        "product_type_list",
    );

    const onFinish = (values) => {
        let type =
            values && values.type
                ? values.type
                : toggleModalFormProductType.type;

        let data = {
            ...values,
            type,
            id:
                toggleModalFormProductType.data &&
                toggleModalFormProductType.data.id
                    ? toggleModalFormProductType.data.id
                    : "",
        };

        mutateProductType(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Product Type",
                        description: res.message,
                    });

                    setToggleModalFormProductType({ open: false, data: null });

                    form.resetFields();
                } else {
                    notification.error({
                        message: "Product Type",
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
        if (toggleModalFormProductType.open) {
            form.setFieldsValue({
                ...toggleModalFormProductType.data,
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormProductType]);

    return (
        <Modal
            title={`${
                toggleModalFormProductType &&
                toggleModalFormProductType.data &&
                toggleModalFormProductType.data.id
                    ? "Edit"
                    : "Add"
            } Product Type`}
            open={toggleModalFormProductType.open}
            onCancel={() => {
                setToggleModalFormProductType({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    key={1}
                    type="default"
                    onClick={() => {
                        setToggleModalFormProductType({
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
                    title="Are you sure you want to submit this product type?"
                    onConfirm={() => form.submit()}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                        className: "btn-main-invert",
                    }}
                    disabled={isLoadingProductType}
                >
                    <Button type="primary" loading={isLoadingProductType}>
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
                            name="product_type"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput
                                label="Product Type"
                                placeholder="Product Type"
                                required
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
