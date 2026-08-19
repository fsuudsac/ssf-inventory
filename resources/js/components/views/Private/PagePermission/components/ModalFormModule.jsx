import { useEffect } from "react";
import {
    Modal,
    Form,
    Row,
    Col,
    Space,
    Button,
    Typography,
    notification,
    Popconfirm,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashAlt } from "@fortawesome/pro-regular-svg-icons";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import notificationErrors from "../../../../providers/notificationErrors";
import FloatInput from "../../../../providers/FloatInput";

export default function ModalFormModule(props) {
    const { toggleModalModule, setToggleModalModule, systemId } = props;

    const [form] = Form.useForm();

    const { mutate: mutateModule, isLoading: isLoadingModule } = POST(
        `api/module`,
        `module_list_${systemId}`,
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            module_buttons: values.module_buttons
                ? values.module_buttons.map((item) => ({
                      ...item,
                      id: item.id ? item.id : null,
                  }))
                : null,
            id:
                toggleModalModule.data && toggleModalModule.data.id
                    ? toggleModalModule.data.id
                    : "",
            system_id: systemId,
        };

        mutateModule(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setToggleModalModule({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    notification.success({
                        message: "Module",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Module",
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
        if (toggleModalModule.open) {
            // console.log("toggleModalModule.data", toggleModalModule.data);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalModule]);

    return (
        <Modal
            wrapClassName="modal-form-module"
            title="Module Form"
            open={toggleModalModule.open}
            onCancel={() =>
                setToggleModalModule({
                    open: false,
                    data: null,
                })
            }
            forceRender
            footer={[
                <Button key={1} type="default" loading={isLoadingModule}>
                    Close
                </Button>,
                <Popconfirm
                    key={2}
                    title="Are you sure you want to submit this module?"
                    onConfirm={() => form.submit()}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                        className: "btn-main-invert",
                    }}
                    disabled={isLoadingModule}
                >
                    <Button type="primary" loading={isLoadingModule}>
                        Submit
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
                    <Col xs={24} sm={24} md={24}>
                        <Form.Item
                            name="module_code"
                            rules={[validateRules.required()]}
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
                            rules={[validateRules.required()]}
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
                                                className={`form-item-module-button-wrapper ${
                                                    key !== fields.length - 1
                                                        ? "add_gap"
                                                        : ""
                                                }`}
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
                                                            validateRules.required(),
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
                                                            validateRules.required(),
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
                </Row>
            </Form>
        </Modal>
    );
}
