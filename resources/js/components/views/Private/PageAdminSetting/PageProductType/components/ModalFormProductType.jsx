import { useContext, useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { POST } from "../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../providers/validateRules";
import notificationErrors from "../../../../../providers/notificationErrors";
import FloatInput from "../../../../../providers/FloatInput";
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
                    className="btn-main-primary outlined"
                    key={1}
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
                <Button
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={isLoadingProductType}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item name="product_type" rules={[validateRules.required]}>
                    <FloatInput
                        label="Product Type"
                        placeholder="Product Type"
                        required
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
