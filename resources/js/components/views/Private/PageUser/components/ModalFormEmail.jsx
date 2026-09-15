import { useEffect } from "react";
import { Modal, Button, Form, notification, Popconfirm, Row, Col } from "antd";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import FloatInput from "../../../../providers/FloatInput";

export default function ModalFormEmail(props) {
    const { toggleModalFormEmail, setToggleModalFormEmail } = props;

    const [form] = Form.useForm();

    const { mutate: mutateEmail, isLoading: isLoadingEmail } = POST(
        `api/users_update_email`,
        "users_info",
    );

    const onFinish = (values) => {
        console.log("onFinish", values);

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
                        message: "Email Update",
                        description: res.message,
                    });

                    setToggleModalFormEmail({ open: false, data: null });

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
                    message: "Email Update",
                    description: "Something went Wrong",
                });
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
                    key={1}
                    type="default"
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
                <Popconfirm
                    key={2}
                    title="Are you sure you want to submit this email?"
                    onConfirm={() => form.submit()}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                        className: "btn-main-invert",
                    }}
                    disabled={isLoadingEmail}
                >
                    <Button type="primary" loading={isLoadingEmail}>
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
                            name="email"
                            rules={[
                                validateRules.email,
                                validateRules.required(),
                            ]}
                        >
                            <FloatInput
                                label="New email"
                                placeholder="New Email"
                                required
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
