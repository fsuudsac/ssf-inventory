import { useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import notificationErrors from "../../../../providers/notificationErrors";
import FloatInput from "../../../../providers/FloatInput";

export default function ModalBrandForm(props) {
    const { toggleModalFormBrand, setToggleModalFormBrand } = props;

    const [form] = Form.useForm();

    const { mutate: mutateCategory, isLoading: isLoadingCategory } = POST(
        `api/brand`,
        "brand_list",
    );

    const onFinish = (values) => {
        console.log("onFinish", values);

        let type =
            values && values.type ? values.type : toggleModalFormBrand.type;

        let data = {
            ...values,
            type,
            id:
                toggleModalFormBrand.data && toggleModalFormBrand.data.id
                    ? toggleModalFormBrand.data.id
                    : "",
        };

        mutateCategory(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Brand",
                        description: res.message,
                    });

                    setToggleModalFormBrand({ open: false, data: null });

                    form.resetFields();
                } else {
                    notification.error({
                        message: "Brand",
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
        if (toggleModalFormBrand.open) {
            form.setFieldsValue({
                ...toggleModalFormBrand.data,
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormBrand]);

    return (
        <Modal
            title="Form Brand"
            open={toggleModalFormBrand.open}
            onCancel={() => {
                setToggleModalFormBrand({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalFormBrand({
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
                    onClick={(values) => form.submit(values)}
                    loading={isLoadingCategory}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item name="brand_name" rules={[validateRules.required]}>
                    <FloatInput label="Brand" placeholder="Brand" required />
                </Form.Item>
            </Form>
        </Modal>
    );
}
