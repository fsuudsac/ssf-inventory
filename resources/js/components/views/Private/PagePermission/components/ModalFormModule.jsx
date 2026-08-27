import { useEffect } from "react";
import { Modal, Form, Row, Col, Space, Button, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashAlt } from "@fortawesome/pro-regular-svg-icons";

import validateRules from "../../../../providers/validateRules";
import FloatInput from "../../../../providers/FloatInput";

export default function ModalFormModule(props) {
    const { toggleModalModule, setToggleModalModule, onFinish, loading, form } =
        props;

    useEffect(() => {
        if (toggleModalModule.open) {
            console.log("toggleModalModule.data", toggleModalModule.data);
            form.setFieldsValue({
                ...toggleModalModule.data,
                module_buttons:
                    toggleModalModule.data &&
                    toggleModalModule.data.module_buttons
                        ? toggleModalModule.data.module_buttons
                        : [""],
            });
        }

        return () => {};
    }, [toggleModalModule]);

    return (
        <Modal
            wrapClassName="wrap-modal-form-module"
            title="Module Form"
            open={toggleModalModule.open}
            onCancel={() =>
                setToggleModalModule({
                    open: false,
                    data: null,
                })
            }
            footer={null}
            forceRender
        >
            <Form form={form} onFinish={onFinish}>
                <Row gutter={[12, 0]}>
                    <Col xs={24} sm={24} md={24}>
                        <Form.Item
                            name="module_code"
                            rules={[validateRules.required]}
                        >
                            <FloatInput
                                label="Module Code"
                                placeholder="Module Code"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24}>
                        <Form.Item
                            name="module_name"
                            rules={[validateRules.required]}
                        >
                            <FloatInput
                                label="Module Name"
                                placeholder="Module Name"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24}>
                        <Form.Item name="description">
                            <FloatInput
                                label="Description"
                                placeholder="Description"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24}>
                        <Typography.Title level={5}>
                            Module Actions
                        </Typography.Title>
                        <Form.List name="module_buttons">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(
                                        ({ key, name, ...restField }) => (
                                            <Space
                                                key={key}
                                                style={{
                                                    display: "flex",
                                                    marginBottom: 8,
                                                }}
                                                className="form-item-module-button-wrapper"
                                                align="start"
                                            >
                                                <div>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            "mod_button_code",
                                                        ]}
                                                        rules={[
                                                            validateRules.required,
                                                        ]}
                                                    >
                                                        <FloatInput
                                                            label="Code"
                                                            placeholder="Code"
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            "mod_button_name",
                                                        ]}
                                                        rules={[
                                                            validateRules.required,
                                                        ]}
                                                    >
                                                        <FloatInput
                                                            label="Name"
                                                            placeholder="Name"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            "mod_button_description",
                                                        ]}
                                                    >
                                                        <FloatInput
                                                            label="Description"
                                                            placeholder="Description"
                                                        />
                                                    </Form.Item>
                                                </div>
                                                <div className="form-list-btn-delete-wrapper">
                                                    {fields.length > 1 ? (
                                                        <FontAwesomeIcon
                                                            className="text-danger"
                                                            icon={faTrashAlt}
                                                            onClick={() =>
                                                                remove(name)
                                                            }
                                                        />
                                                    ) : null}
                                                </div>
                                            </Space>
                                        ),
                                    )}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={
                                                <FontAwesomeIcon
                                                    icon={faPlus}
                                                />
                                            }
                                        >
                                            Add Action
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Col>

                    <Col xs={24} sm={24} md={24}>
                        <Button
                            type="primary"
                            className="btn-main-primary outlined"
                            loading={loading}
                        >
                            Close
                        </Button>

                        <Button
                            type="primary"
                            htmlType="submit"
                            className="btn-main-primary ml-10"
                            loading={loading}
                        >
                            Submit
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
