import { useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import notificationErrors from "../../../../providers/notificationErrors";
import FloatInput from "../../../../providers/FloatInput";

export default function ModalFormEmail(props) {
    const { toggleModalFormEmail, setToggleModalFormEmail } = props;
    const [form] = Form.useForm();

    const { mutate: mutateEmail, isLoading: isLoadingEmail } = POST(
        `api/users_update_email`,
        "users_info",
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalFormEmail.data && toggleModalFormEmail.data.id
                    ? toggleModalFormEmail.data.id
                    : "",
        };

        mutateEmail(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Change Email",
                        description: res.message,
                    });

                    form.resetFields();
                    setToggleModalFormEmail({ open: false, data: null });
                } else {
                    notification.error({
                        message: "Change Email",
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
        if (toggleModalFormEmail.open) {
            form.setFieldsValue({
                ...toggleModalFormEmail.data,
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormEmail]);

    return (
        <Modal
            title="Change Email"
            open={toggleModalFormEmail.open}
            onCancel={() => {
                setToggleModalFormEmail({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalFormEmail({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                    disabled={isLoadingEmail}
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    type="primary"
                    key={2}
                    onClick={(values) => form.submit(values)}
                    loading={isLoadingEmail}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item
                    name="email"
                    rules={[validateRules.email, validateRules.required()]}
                >
                    <FloatInput
                        label="New email"
                        placeholder="New Email"
                        required
                    />
                </Form.Item>
                <Form.Item
                    name="confirm_email"
                    rules={[
                        validateRules.email_validate,
                        validateRules.required(),
                    ]}
                >
                    <FloatInput
                        label="Confirm email"
                        placeholder="Confirm Email"
                        required
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
