import { useContext, useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

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
                    className="btn-main-primary outlined"
                    key={1}
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
                <Button
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={isLoadingProductSize}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item name="product_size" rules={[validateRules.required]}>
                    <FloatInput
                        label="Product Size"
                        placeholder="Product Size"
                        required
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
