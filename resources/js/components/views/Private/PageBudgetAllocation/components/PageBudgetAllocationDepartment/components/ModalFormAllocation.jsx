import { useEffect, useState } from "react";
import { Button, Col, Form, Modal, notification, Popconfirm, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../../providers/validateRules";
import notificationErrors from "../../../../../../providers/notificationErrors";
import FloatSelect from "../../../../../../providers/FloatSelect";
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

    // Increments each time the modal opens to bust the existingAllocations cache
    const [fetchKey, setFetchKey] = useState(0);

    useEffect(() => {
        if (toggleModalFormAllocation.open) {
            setFetchKey((k) => k + 1);
        }
    }, [toggleModalFormAllocation.open]);

    // Editing a specific record — pre-fill the single list item
    useEffect(() => {
        if (toggleModalFormAllocation.open && toggleModalFormAllocation?.data) {
            let data = toggleModalFormAllocation.data;

            form.setFieldsValue({
                allocations: [
                    {
                        allocation_type_id: data.allocation_type_id,
                        amount: data.base_amount,
                    },
                ],
            });
        } else if (toggleModalFormAllocation.open) {
            // Add mode — start with one blank row
            form.setFieldsValue({
                allocations: [{ allocation_type_id: undefined, amount: "" }],
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormAllocation]);

    const isEditing = !!toggleModalFormAllocation?.data?.id;

    // Fetch all active allocations for this department + school year when modal is open
    // Used to filter out types that already have a record (prevent duplicates)
    const existingAllocationsParams = new URLSearchParams({
        department_id: department?.id || "",
        school_year_id: effectiveTableFilter?.school_year_id || "",
        isTrash: 0,
    });

    // fetchKey increments on each modal open, busting the react-query cache
    // so deleted/added records are always reflected when the modal re-opens
    const { data: dataExistingAllocations } = GET(
        `api/department_allocation?${existingAllocationsParams}`,
        `existing_allocations_${department?.id}_${effectiveTableFilter?.school_year_id}_${fetchKey}`,
        () => {},
        toggleModalFormAllocation.open, // only fetch when modal is open
    );

    // Create: POST api/department_allocation (one call per row)
    const { mutateAsync: mutateCreateAsync, isLoading: isLoadingCreate } = POST(
        `api/department_allocation`,
        queryKey,
    );

    // Update: POST api/department_allocation_update (single record)
    const { mutate: mutateUpdate, isLoading: isLoadingUpdate } = POST(
        `api/department_allocation_update`,
        queryKey,
    );

    const isLoading = isLoadingCreate || isLoadingUpdate;

    const onFinish = async (values) => {
        const { allocations } = values;

        // Edit mode — single record via dedicated update endpoint
        if (isEditing) {
            const payload = {
                ...allocations[0],
                id: toggleModalFormAllocation.data.id,
            };

            mutateUpdate(payload, {
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

            return;
        }

        // Create mode — submit each row sequentially
        try {
            let allSuccess = true;

            for (const item of allocations) {
                const payload = {
                    ...item,
                    department_id: department?.id || "",
                    school_year_id: effectiveTableFilter?.school_year_id || "",
                };

                const res = await mutateCreateAsync(payload);

                if (!res.success) {
                    allSuccess = false;
                    notification.error({
                        message: "Department Allocation",
                        description: res.message,
                    });
                }
            }

            if (allSuccess) {
                notification.success({
                    message: "Department Allocation",
                    description:
                        allocations.length > 1
                            ? `${allocations.length} allocations created successfully.`
                            : "Allocation created successfully.",
                });
                setToggleModalFormAllocation({ open: false, data: null });
                form.resetFields();
            }
        } catch (err) {
            notificationErrors(err);
        }
    };

    const readOnly = isEditing;

    const allocationTypeOptions =
        dataAllocationType?.data?.map((item) => ({
            label: item.allocation_type,
            value: item.id,
        })) ?? [];

    // Types already saved in the DB for this department + school year
    // In edit mode, exclude the current record so its own type stays selectable
    const existingTypeIds = (
        dataExistingAllocations?.data?.data ??
        dataExistingAllocations?.data ??
        []
    )
        .filter((rec) =>
            isEditing ? rec.id !== toggleModalFormAllocation?.data?.id : true,
        )
        .map((rec) => rec.allocation_type_id);

    // Watch all rows to know which types are already selected in this form session
    const watchedAllocations = Form.useWatch("allocations", form) ?? [];

    // All type IDs consumed (in DB or selected in any form row)
    const allUsedTypeIds = [
        ...existingTypeIds,
        ...watchedAllocations
            .map((row) => row?.allocation_type_id)
            .filter(Boolean),
    ];

    // Options that are still free — drives the Add button visibility
    const remainingOptionsCount = allocationTypeOptions.filter(
        (opt) => !allUsedTypeIds.includes(opt.value),
    ).length;

    return (
        <Modal
            title="Budget Allocation"
            open={toggleModalFormAllocation.open}
            onCancel={() => {
                setToggleModalFormAllocation({ open: false, data: null });
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
                    onConfirm={() => {
                        form.validateFields()
                            .then((values) => onFinish(values))
                            .catch(() => {});
                    }}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ className: "btn-main-invert" }}
                    disabled={isLoading}
                >
                    <Button type="primary" loading={isLoading}>
                        SUBMIT
                    </Button>
                </Popconfirm>,
            ]}
        >
            {/* Form has no onFinish — Popconfirm is the only submit path */}
            <Form form={form}>
                <Form.List name="allocations">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => {
                                // Current row's own selected value (keep it selectable in its own dropdown)
                                const currentValue =
                                    watchedAllocations[name]
                                        ?.allocation_type_id;

                                // Filter out types used by other rows or already in DB,
                                // but always keep the current row's own selection visible
                                const filteredOptions =
                                    allocationTypeOptions.filter(
                                        (opt) =>
                                            opt.value === currentValue ||
                                            !allUsedTypeIds.includes(opt.value),
                                    );

                                return (
                                    <Row
                                        key={key}
                                        gutter={[12, 0]}
                                        align="middle"
                                    >
                                        {/* Allocation Type select — excludes types picked in other rows */}
                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={fields.length > 1 ? 12 : 14}
                                            lg={fields.length > 1 ? 12 : 14}
                                        >
                                            <Form.Item
                                                {...restField}
                                                name={[
                                                    name,
                                                    "allocation_type_id",
                                                ]}
                                                rules={[
                                                    validateRules.required(),
                                                ]}
                                            >
                                                <FloatSelect
                                                    label="Allocation Type"
                                                    placeholder="Allocation Type"
                                                    allowClear={false}
                                                    required
                                                    options={filteredOptions}
                                                />
                                            </Form.Item>
                                        </Col>

                                        {/* Budget Amount input */}
                                        <Col xs={24} sm={24} md={10} lg={10}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "amount"]}
                                                rules={[
                                                    validateRules.required(),
                                                ]}
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
                                                    suffix=" PHP"
                                                    readOnly={readOnly}
                                                />
                                            </Form.Item>
                                        </Col>

                                        {/* Delete button — only show when more than 1 row */}
                                        {fields.length > 1 && (
                                            <Col xs={24} sm={24} md={2} lg={2}>
                                                <Button
                                                    type="link"
                                                    danger
                                                    icon={
                                                        <FontAwesomeIcon
                                                            icon={faTrash}
                                                        />
                                                    }
                                                    onClick={() => remove(name)}
                                                    style={{ marginBottom: 24 }}
                                                />
                                            </Col>
                                        )}
                                    </Row>
                                );
                            })}

                            {/* Add row button — only in create mode and when at least one type is still free */}
                            {!isEditing && remainingOptionsCount > 0 && (
                                <Form.Item>
                                    <Button
                                        type="default"
                                        onClick={() =>
                                            add({
                                                allocation_type_id: undefined,
                                                amount: "",
                                            })
                                        }
                                        block
                                        icon={<FontAwesomeIcon icon={faPlus} />}
                                    >
                                        Add Allocation
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
}
