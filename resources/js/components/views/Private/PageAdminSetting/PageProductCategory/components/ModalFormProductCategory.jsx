import { useContext, useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { POST } from "../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../providers/validateRules";
import notificationErrors from "../../../../../providers/notificationErrors";
import FloatInput from "../../../../../providers/FloatInput";
import PageProductCategoryContext from "./PageProductCategoryContext";

export default function ModalFormProductCategory() {
    const {
        toggleModalFormProductCategory,
        setToggleModalFormProductCategory,
    } = useContext(PageProductCategoryContext);

    const [form] = Form.useForm();

    const {
        mutate: mutateProductCategory,
        isLoading: isLoadingProductCategory,
    } = POST(`api/product_category`, "product_category_list");

    const onFinish = (values) => {
        let category =
            values && values.category
                ? values.category
                : toggleModalFormProductCategory.category;

        let data = {
            ...values,
            category,
            id:
                toggleModalFormProductCategory.data &&
                toggleModalFormProductCategory.data.id
                    ? toggleModalFormProductCategory.data.id
                    : "",
        };

        mutateProductCategory(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Product Category",
                        description: res.message,
                    });

                    setToggleModalFormProductCategory({
                        open: false,
                        data: null,
                    });

                    form.resetFields();
                } else {
                    notification.error({
                        message: "Product Category",
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
        if (toggleModalFormProductCategory.open) {
            form.setFieldsValue({
                ...toggleModalFormProductCategory.data,
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormProductCategory]);

    return (
        <Modal
            title={`${
                toggleModalFormProductCategory &&
                toggleModalFormProductCategory.data &&
                toggleModalFormProductCategory.data.id
                    ? "Edit"
                    : "Add"
            } Product Category`}
            open={toggleModalFormProductCategory.open}
            onCancel={() => {
                setToggleModalFormProductCategory({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalFormProductCategory({
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
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={isLoadingProductCategory}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item
                    name="product_category"
                    rules={[validateRules.required()]}
                >
                    <FloatInput
                        label="Product Category"
                        placeholder="Product Category"
                        required
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
