import { useEffect } from "react";
import { Button, Col, Form, Modal, notification, Popconfirm, Row } from "antd";

import { POST } from "../../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../../providers/validateRules";
import notificationErrors from "../../../../../../providers/notificationErrors";
import FloatSelect from "../../../../../../providers/FloatSelect";
import FloatInput from "../../../../../../providers/FloatInput";
import FloatInputNumber from "../../../../../../providers/FloatInputNumber";

export default function ModalFormAllocation(props) {
    const {
        toggleModalFormAllocation,
        setToggleModalFormAllocation,
        queryKey,
        department,
        effectiveTableFilter,
        dataAllocationType,
    } = props;

    const [form] = Form.useForm();

    useEffect(() => {
        if (toggleModalFormAllocation.open && toggleModalFormAllocation?.data) {
            let data = toggleModalFormAllocation.data;

            form.setFieldsValue({
                allocation_type_id: data.allocation_type_id,
                allocation_name: data.allocation_name,
                amount: data.base_amount,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormAllocation]);

    const {
        mutate: mutateDepartmentAllocation,
        isLoading: isLoadingDepartmentAllocation,
    } = POST(`api/department_allocation`, queryKey);

    const onFinish = (values) => {
        let data = {
            ...values,
            id: toggleModalFormAllocation?.data?.id || "",
            department_id:
                toggleModalFormAllocation?.data?.department_id ||
                department?.id ||
                "",
            school_year_id:
                toggleModalFormAllocation?.data?.school_year_id ||
                effectiveTableFilter?.school_year_id ||
                "",
        };

        mutateDepartmentAllocation(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Department Allocation",
                        description: res.message,
                    });
                    setToggleModalFormAllocation({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                } else {
                    notification.error({
                        message: "Department Allocation",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const readOnly = toggleModalFormAllocation?.data?.id ? true : false;

    return (
        <Modal
            title="Budget Allocation"
            open={toggleModalFormAllocation.open}
            onCancel={() => {
                setToggleModalFormAllocation({
                    open: false,
                    data: null,
                });
                form.resetFields();
            }}
            footer={[
                <Button
                    key={1}
                    type="default"
                    onClick={() => {
                        setToggleModalFormAllocation({
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
                    title="Are you sure you want to submit this allocation?"
                    onConfirm={() => form.submit()}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                        className: "btn-main-invert",
                    }}
                    disabled={isLoadingDepartmentAllocation}
                >
                    <Button
                        type="primary"
                        loading={isLoadingDepartmentAllocation}
                    >
                        SUBMIT
                    </Button>
                </Popconfirm>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Row gutter={[12, 0]}>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item
                            name="allocation_type_id"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="Allocation Type"
                                placeholder="Allocation Type"
                                allowClear={false}
                                required
                                options={dataAllocationType?.data?.map(
                                    (item) => ({
                                        label: item.allocation_type,
                                        value: item.id,
                                    }),
                                )}
                            />
                        </Form.Item>
                    </Col>
                    {/* <Form.Item shouldUpdate noStyle>
                        {({ getFieldValue }) => {
                            const allocationTypeId =
                                getFieldValue("allocation_type_id");
                            const allocationType =
                                dataAllocationType?.data?.find(
                                    (item) => item.id === allocationTypeId,
                                );

                            if (
                                allocationType?.allocation_type !==
                                    "Operational" &&
                                allocationTypeId
                            ) {
                                return ( */}
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item
                            name="allocation_name"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput
                                label="Allocation Name"
                                placeholder="Allocation Name"
                                required
                            />
                        </Form.Item>
                    </Col>
                    {/* );
                            }
                        }}
                    </Form.Item> */}
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item
                            name="amount"
                            rules={[validateRules.required()]}
                        >
                            <FloatInputNumber
                                label="Budget Amount"
                                placeholder="Budget Amount"
                                required
                                min={0}
                                step={1}
                                precision={2}
                                decimalSeparator="."
                                controls={false}
                                // prefix="₱"
                                suffix=" PHP"
                                readOnly={readOnly}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
