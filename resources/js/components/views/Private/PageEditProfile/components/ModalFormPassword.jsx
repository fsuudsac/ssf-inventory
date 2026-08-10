import { useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import notificationErrors from "../../../../providers/notificationErrors";
import FloatInputPassword from "../../../../providers/FloatInputPassword";

export default function ModalFormPassword(props) {
    const { toggleModalFormPassword, setToggleModalFormPassword } = props;
    const [form] = Form.useForm();

    const { mutate: mutatePassword, isLoading: isLoadingPassword } = POST(
        `api/users_update_password`,
        "users_info"
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalFormPassword.data && toggleModalFormPassword.data.id
                    ? toggleModalFormPassword.data.id
                    : "",
        };

        mutatePassword(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Change Password",
                        description: res.message,
                    });

                    form.resetFields();
                    setToggleModalFormPassword({
                        open: false,
                        data: null,
                    });
                } else {
                    notification.error({
                        message: "Change Password",
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
        if (toggleModalFormPassword.open) {
            form.setFieldsValue({
                ...toggleModalFormPassword.data,
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormPassword]);

    return (
        <Modal
            title="Change Password"
            open={toggleModalFormPassword.open}
            onCancel={() => {
                setToggleModalFormPassword({
                    open: false,
                    data: null,
                });
                form.resetFields();
            }}
            forceRender
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalFormPassword({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                    disabled={isLoadingPassword}
                >
                    CANCEL
                </Button>,
                <Button
                    className="btn-main-primary"
                    type="primary"
                    key={2}
                    onClick={(values) => form.submit(values)}
                    loading={isLoadingPassword}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item
                    name="new_password"
                    rules={[validateRules.required(), validateRules.password]}
                >
                    <FloatInputPassword
                        label="New Password"
                        placeholder="New Password"
                        required={true}
                    />
                </Form.Item>
                <Form.Item
                    name="confirm_password"
                    rules={[
                        validateRules.password_validate,
                        validateRules.required(),
                    ]}
                >
                    <FloatInputPassword
                        label="Confirm Password"
                        placeholder="Confirm Password"
                        required={true}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
