import { useEffect } from "react";
import { Button, Col, Form, Modal, Row, notification } from "antd";

import { POST } from "../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../providers/validateRules";
import FloatInput from "../../../../../providers/FloatInput";
import FloatQuill from "../../../../../providers/FloatQuill";
import notificationErrors from "../../../../../providers/notificationErrors";

export default function ModalFormEmailTemplate(props) {
    const { toggleModalFormEmailTemplate, setToggleModalFormEmailTemplate } =
        props;

    const [form] = Form.useForm();

    const { mutate: mutateEmailTemplate, loading: loadingEmailTemplate } = POST(
        `api/email_template`,
        "email_template_list"
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalFormEmailTemplate.data &&
                toggleModalFormEmailTemplate.data.id
                    ? toggleModalFormEmailTemplate.data.id
                    : "",
            system_id: toggleModalFormEmailTemplate.system_id,
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
                        system_id: null,
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
    }, [toggleModalFormEmailTemplate]);

    return (
        <Modal
            wrapClassName="modal-form-email-template"
            title="EMAIL TEMPLATE FORM"
            open={toggleModalFormEmailTemplate.open}
            onCancel={() =>
                setToggleModalFormEmailTemplate({
                    open: false,
                    system_id: null,
                })
            }
            footer={null}
            forceRender
        >
            <Form form={form} onFinish={onFinish}>
                <Row gutter={[12, 0]}>
                    <Col xs={24} sm={24} md={24}>
                        <Form.Item
                            name="title"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput label="Title" placeholder="Title" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24}>
                        <Form.Item
                            name="subject"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput label="Subject" placeholder="Subject" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24}>
                        <Form.Item name="body">
                            <FloatQuill placeholder="Body" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} className="text-right">
                        <Button
                            type="primary"
                            className="btn-main-primary outlined"
                            loading={loadingEmailTemplate}
                            onClick={() =>
                                setToggleModalFormEmailTemplate({
                                    open: false,
                                    data: null,
                                    system_id: null,
                                })
                            }
                        >
                            Close
                        </Button>

                        <Button
                            type="primary"
                            htmlType="submit"
                            className="btn-main-primary ml-10"
                            loading={loadingEmailTemplate}
                        >
                            Submit
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
