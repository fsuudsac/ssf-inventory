import { Modal, Button, Form, notification, Popconfirm, Row, Col } from "antd";

import { useEffect } from "react";
import { POST } from "../../../../providers/useAxiosQuery";
import FloatInputPassword from "../../../../providers/FloatInputPassword";
import validateRules from "../../../../providers/validateRules";

export default function ModalFormPassword(props) {
    const { toggleModalFormPassword, setToggleModalFormPassword } = props;
    const [form] = Form.useForm();

    const { mutate: mutatePassword, isLoading: isLoadingPassword } = POST(
        `api/users_update_password`,
        "users_info",
    );

    const onFinish = (values) => {
        console.log("onFinish", values);

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
                        message: "Password",
                        description: res.message,
                    });

                    setToggleModalFormPassword({
                        open: false,
                        data: null,
                    });

                    form.resetFields();
                } else {
                    notification.error({
                        message: "Something went wrong",
                        description: res.message,
                    });
                }
            },
            onError: () => {
                notification.error({
                    message: "Password Update",
                    description: "Something went wrong",
                });
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
                    key={1}
                    type="default"
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
                <Popconfirm
                    key={2}
                    title="Are you sure you want to submit this password?"
                    onConfirm={() => form.submit()}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                        className: "btn-main-invert",
                    }}
                    disabled={isLoadingPassword}
                >
                    <Button type="primary" loading={isLoadingPassword}>
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
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Form.Item
                            name="new_password"
                            rules={[
                                validateRules.required(),
                                validateRules.password,
                            ]}
                        >
                            <FloatInputPassword
                                label="New Password"
                                placeholder="New Password"
                                required={true}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
