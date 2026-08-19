import { useContext, useEffect } from "react";
import {
    Button,
    Col,
    Form,
    Modal,
    notification,
    Checkbox,
    Popconfirm,
    Row,
} from "antd";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import FloatInput from "../../../../providers/FloatInput";
import FloatTextArea from "../../../../providers/FloatTextArea";
import notificationErrors from "../../../../providers/notificationErrors";
import PageWarehouseContext from "./PageWarehouseContext";

export default function ModalFormWarehouse() {
    const { toggleModalFormWarehouse, setToggleModalFormWarehouse } =
        useContext(PageWarehouseContext);

    const [form] = Form.useForm();

    const { mutate: mutateWarehouse, isLoading: isLoadingWarehouse } = POST(
        `api/warehouse`,
        "warehouse_list",
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            status: values.status === true ? 1 : 0,
            id: toggleModalFormWarehouse.data?.id || "",
        };

        mutateWarehouse(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Warehouse",
                        description: res.message,
                    });

                    form.resetFields();
                    setToggleModalFormWarehouse({ open: false, data: null });
                } else {
                    notification.error({
                        message: "Warehouse",
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
        if (toggleModalFormWarehouse.open) {
            form.setFieldsValue({
                ...toggleModalFormWarehouse.data,
            });
        }

        return () => {};
    }, [toggleModalFormWarehouse, form]);

    const handleDebounce = (value, name) => {
        form.setFieldsValue({ [name]: value });
    };

    return (
        <Modal
            title="Form Warehouse"
            open={toggleModalFormWarehouse.open}
            onCancel={() => {
                form.resetFields();
                setToggleModalFormWarehouse({
                    open: false,
                    data: null,
                });
            }}
            forceRender
            footer={[
                <Button
                    key="cancel"
                    type="default"
                    onClick={() => {
                        form.resetFields();
                        setToggleModalFormWarehouse({
                            open: false,
                            data: null,
                        });
                    }}
                    disabled={isLoadingWarehouse}
                >
                    CANCEL
                </Button>,
                <Popconfirm
                    key="submit"
                    title="Are you sure you want to submit this warehouse?"
                    onConfirm={() => form.submit()}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                        className: "btn-main-invert",
                    }}
                    disabled={isLoadingWarehouse}
                >
                    <Button type="primary" loading={isLoadingWarehouse}>
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
                            name="warehouse_name"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput
                                placeholder="Warehouse Name"
                                label="Warehouse Name"
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

                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item name="address">
                            <FloatTextArea
                                label="Address"
                                placeholder="Address"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item name="status" valuePropName="checked">
                            <Checkbox
                                onChange={(e) => {
                                    handleDebounce(e.target.checked, "status");
                                }}
                            >
                                Is Main?
                            </Checkbox>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
