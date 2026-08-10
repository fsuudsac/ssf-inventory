import { useEffect } from "react";
import { Col, Form, Radio, Row } from "antd";

import dayjs from "dayjs";
import FloatRangePicker from "../../../../providers/FloatRangePicker";

export default function SalesReturnFilter(props) {
    const { tableFilter, setTableFilter } = props;

    const [form] = Form.useForm();

    const handleFilterChange = (changedValues) => {
        setTableFilter((prev) => {
            const next = { ...prev };

            if (
                changedValues.date_return &&
                changedValues.date_return.length > 0
            ) {
                next.date_return = [
                    dayjs(changedValues.date_return[0]).format("YYYY-MM-DD"),
                    dayjs(changedValues.date_return[1]).format("YYYY-MM-DD"),
                ];
            }

            // Category
            // if (changedValues.exam_category !== undefined) {
            //     next.exam_category = changedValues.exam_category;
            // }

            return next;
        });
    };

    useEffect(() => {
        if (tableFilter.date_return && tableFilter.date_return.length === 0) {
            form.setFieldsValue({ date_return: [] });
        }
    }, [tableFilter.date_return, form]);

    return (
        <>
            <Form
                form={form}
                layout="vertical"
                initialValues={tableFilter}
                onValuesChange={(changedValues, allValues) => {
                    handleFilterChange(changedValues);
                }}
            >
                <Row gutter={[20, 20]}>
                    <Col
                        xs={24}
                        sm={24}
                        md={24}
                        lg={24}
                        xl={24}
                        xxl={24}
                        className="p-0!"
                    >
                        <Form.Item name="isTrash">
                            <Radio.Group
                                optionType="button"
                                buttonStyle="solid"
                                onChange={(e) => {
                                    setTableFilter((prev) => ({
                                        ...prev,
                                        isTrash: e.target.value,
                                    }));
                                }}
                                options={[
                                    { label: "Active", value: 0 },
                                    { label: "Archived", value: 1 },
                                ]}
                            />
                        </Form.Item>

                        <Form.Item name="date_return" label="Date Return">
                            <FloatRangePicker
                                allowClear
                                size="middle"
                                picker="date"
                                format="MMMM DD, YYYY"
                                onChange={(date) => {
                                    if (!date) {
                                        setTableFilter((prev) => ({
                                            ...prev,
                                            date_return: [],
                                        }));
                                    } else {
                                        form.submit();
                                    }
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </>
    );
}
