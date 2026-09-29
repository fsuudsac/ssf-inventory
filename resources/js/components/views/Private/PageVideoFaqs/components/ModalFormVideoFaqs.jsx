import { useContext, useEffect } from "react";
import { Modal, Button, Form, notification, Popconfirm, Row, Col } from "antd";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import notificationErrors from "../../../../providers/notificationErrors";
import FloatInput from "../../../../providers/FloatInput";
import PageVideoFaqContext from "./PageVideoFaqContext";
import FloatTextArea from "../../../../providers/FloatTextArea";

export default function ModalFormVideoFaqs() {
    const { toggleModalFormVideoFaq, setToggleModalFormVideoFaq } =
        useContext(PageVideoFaqContext);

    const [form] = Form.useForm();

    const { mutate: mutateVideoFaq, isLoading: isLoadingVideoFaq } = POST(
        `api/video_faq`,
        "video_faq_list",
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalFormVideoFaq.data && toggleModalFormVideoFaq.data.id
                    ? toggleModalFormVideoFaq.data.id
                    : "",
        };

        mutateVideoFaq(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Video FAQ",
                        description: res.message,
                    });

                    setToggleModalFormVideoFaq({ open: false, data: null });

                    form.resetFields();
                } else {
                    notification.error({
                        message: "Video FAQ",
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
        if (toggleModalFormVideoFaq.open) {
            form.setFieldsValue({
                ...toggleModalFormVideoFaq.data,
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormVideoFaq]);

    return (
        <Modal
            title={`${
                toggleModalFormVideoFaq &&
                toggleModalFormVideoFaq.data &&
                toggleModalFormVideoFaq.data.id
                    ? "Edit"
                    : "Add"
            } Video FAQ`}
            open={toggleModalFormVideoFaq.open}
            onCancel={() => {
                setToggleModalFormVideoFaq({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    key={1}
                    type="default"
                    onClick={() => {
                        setToggleModalFormVideoFaq({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                >
                    CANCEL
                </Button>,
                <Popconfirm
                    key={2}
                    title="Are you sure you want to submit this video FAQ?"
                    onConfirm={() => form.submit()}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                        className: "btn-main-invert",
                    }}
                    disabled={isLoadingVideoFaq}
                >
                    <Button type="primary" loading={isLoadingVideoFaq}>
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
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item
                            name="title"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput
                                label="Title"
                                placeholder="Title"
                                required
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item
                            name="file_path"
                            rules={[
                                validateRules.required(),
                                validateRules.url,
                            ]}
                        >
                            <FloatInput
                                label="URL"
                                placeholder="URL"
                                required
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item
                            name="module_name"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput
                                label="Module Name"
                                placeholder="Module Name"
                                required
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item name="description">
                            <FloatTextArea
                                label="Description"
                                placeholder="Description"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
