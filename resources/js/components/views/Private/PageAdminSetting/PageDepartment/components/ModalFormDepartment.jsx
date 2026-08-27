import { useContext, useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { POST } from "../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../providers/validateRules";
import notificationErrors from "../../../../../providers/notificationErrors";
import FloatInput from "../../../../../providers/FloatInput";
import FloatSelect from "../../../../../providers/FloatSelect";
import PageDepartmentContext from "./PageDepartmentContext";

export default function ModalFormDepartment() {
    const {
        toggleModalFormDepartment,
        setToggleModalFormDepartment,
        dataDepartmentType,
    } = useContext(PageDepartmentContext);

    const [form] = Form.useForm();

    const { mutate: mutateDepartment, isLoading: isLoadingDepartment } = POST(
        `api/department`,
        "department_list",
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalFormDepartment.data &&
                toggleModalFormDepartment.data.id
                    ? toggleModalFormDepartment.data.id
                    : "",
        };

        mutateDepartment(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Department",
                        description: res.message,
                    });

                    setToggleModalFormDepartment({ open: false, data: null });

                    form.resetFields();
                } else {
                    notification.error({
                        message: "Department",
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
        if (toggleModalFormDepartment.open) {
            form.setFieldsValue({
                ...toggleModalFormDepartment.data,
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormDepartment]);

    const departmentTypeOptions =
        dataDepartmentType?.data?.map((item) => ({
            value: item.id,
            label: item.department_type,
        })) ?? [];

    return (
        <Modal
            title={`${
                toggleModalFormDepartment &&
                toggleModalFormDepartment.data &&
                toggleModalFormDepartment.data.id
                    ? "Edit"
                    : "Add"
            } Department`}
            open={toggleModalFormDepartment.open}
            onCancel={() => {
                setToggleModalFormDepartment({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalFormDepartment({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={isLoadingDepartment}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            {/* Fixed: single Form with all three fields */}
            <Form form={form} onFinish={onFinish}>
                <Form.Item name="abbr" rules={[validateRules.required]}>
                    <FloatInput
                        label="Abbreviation"
                        placeholder="Abbreviation"
                        required
                    />
                </Form.Item>

                <Form.Item
                    name="department_name"
                    rules={[validateRules.required]}
                >
                    <FloatInput
                        label="Department"
                        placeholder="Department"
                        required
                    />
                </Form.Item>

                <Form.Item name="department_type_id">
                    <FloatSelect
                        label="Department Type"
                        placeholder="Department Type"
                        options={departmentTypeOptions}
                        allowClear
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
