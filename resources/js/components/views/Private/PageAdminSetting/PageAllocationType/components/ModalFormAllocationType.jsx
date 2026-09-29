import { useContext, useEffect } from "react";
import { Button, Form, Modal, notification, Popconfirm } from "antd";

import PageAllocationTypeContext from "./PageAllocationTypeContext";
import { POST } from "../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../providers/validateRules";
import FloatInput from "../../../../../providers/FloatInput";
import notificationErrors from "../../../../../providers/notificationErrors";

export default function ModalFormAllocationType() {
    const { toggleModalFormAllocationType, setToggleModalFormAllocationType } =
        useContext(PageAllocationTypeContext);

    const [form] = Form.useForm();

    useEffect(() => {
        if (
            toggleModalFormAllocationType.data &&
            toggleModalFormAllocationType.open
        ) {
            form.setFieldsValue({
                ...toggleModalFormAllocationType.data,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormAllocationType]);

    const { mutate: mutateAllocationType, isLoading: isLoadingAllocationType } =
        POST(`api/allocation_type`, "allocation_type_list");

    const onFinish = (values) => {
        let data = {
            ...values,
            id: toggleModalFormAllocationType?.data?.id || "",
        };

        mutateAllocationType(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Allocation Type",
                        description: res.message,
                    });
                    setToggleModalFormAllocationType({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                } else {
                    notification.error({
                        message: "Allocation Type",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    return (
        <Modal
            title={`${toggleModalFormAllocationType?.data?.id ? "Edit" : "Add"} Allocation Type`}
            open={toggleModalFormAllocationType.open}
            onCancel={() => {
                setToggleModalFormAllocationType({
                    open: false,
                    data: null,
                });
                form.resetFields();
            }}
            footer={[
                <Button
                    key="close"
                    type="default"
                    onClick={() => {
                        setToggleModalFormAllocationType({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                >
                    CANCEL
                </Button>,
                <Popconfirm
                    key="submit"
                    title="Are you sure you want to submit this Allocation Type?"
                    onConfirm={() => {
                        form.submit();
                    }}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                        className: "btn-main-invert",
                    }}
                    disabled={isLoadingAllocationType}
                >
                    <Button type="primary" loading={isLoadingAllocationType}>
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
                <Form.Item
                    name="allocation_type"
                    rules={[validateRules.required()]}
                >
                    <FloatInput
                        label="Allocation Type"
                        placeholder="Allocation Type"
                        required
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
