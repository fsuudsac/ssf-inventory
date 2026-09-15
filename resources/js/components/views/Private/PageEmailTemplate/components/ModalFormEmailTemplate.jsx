import { useEffect } from "react";
import { Button, Col, Form, Modal, Popconfirm, Row, notification } from "antd";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import FloatInput from "../../../../providers/FloatInput";
import FloatQuill from "../../../../providers/FloatQuill";
import notificationErrors from "../../../../providers/notificationErrors";

export default function ModalFormEmailTemplate(props) {
    const { toggleModalFormEmailTemplate, setToggleModalFormEmailTemplate } =
        props;

    const [form] = Form.useForm();

    const { mutate: mutateEmailTemplate, isLoading: loadingEmailTemplate } =
        POST(`api/email_template`, "email_template_list");

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalFormEmailTemplate.data &&
                toggleModalFormEmailTemplate.data.id
                    ? toggleModalFormEmailTemplate.data.id
                    : "",
        };

        mutateEmailTemplate(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Email Template",
                        description: res.message,
                    });
                    setToggleModalFormEmailTemplate({
                        open: false,
                        data: null,
                    });
                } else {
                    notification.error({
                        message: "Email Template",
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
        if (toggleModalFormEmailTemplate.open) {
            if (toggleModalFormEmailTemplate.data) {
                form.setFieldsValue({
                    ...toggleModalFormEmailTemplate.data,
                });
            }
        } else {
            form.resetFields();
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormEmailTemplate]);

    return (
        <Modal
            wrapClassName="modal-form-email-template"
            title="EMAIL TEMPLATE FORM"
            open={toggleModalFormEmailTemplate.open}
            onCancel={() =>
                setToggleModalFormEmailTemplate({
                    open: false,
                    data: null,
                })
            }
            footer={[
                <Button
                    key={1}
                    type="default"
                    loading={loadingEmailTemplate}
                    onClick={() =>
                        setToggleModalFormEmailTemplate({
                            open: false,
                            data: null,
                        })
                    }
                >
                    Close
                </Button>,
                <Popconfirm
                    key={2}
                    title="Are you sure you want to submit this email template?"
                    onConfirm={() => form.submit()}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                        className: "btn-main-invert",
                    }}
                    disabled={loadingEmailTemplate}
                >
                    <Button type="primary" loading={loadingEmailTemplate}>
                        Submit
                    </Button>
                </Popconfirm>,
            ]}
            forceRender
        >
            <Form
                form={form}
                onFinish={onFinish}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            >
                <Row gutter={[12, 0]}>
                    <Col xs={24} sm={24} md={24}>
                        <Form.Item
                            name="title"
                            rules={[validateRules.required]}
                        >
                            <FloatInput
                                label="Title"
                                placeholder="Title"
                                required
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24}>
                        <Form.Item
                            name="subject"
                            rules={[validateRules.required]}
                        >
                            <FloatInput
                                label="Subject"
                                placeholder="Subject"
                                required
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24}>
                        <Form.Item
                            name="body"
                            rules={[validateRules.quillValidator]}
                        >
                            <FloatQuill placeholder="Body" required />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
