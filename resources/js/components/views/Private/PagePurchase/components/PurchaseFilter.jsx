import { useEffect } from "react";
import { Checkbox, Col, Flex, Form, Radio, Row, Tooltip } from "antd";

import dayjs from "dayjs";
import { InfoCircleOutlined } from "@ant-design/icons";
import FloatRangePicker from "../../../../providers/FloatRangePicker";

export default function PurchaseFilter(props) {
    const { tableFilter, setTableFilter, tableColumns, setTableColumns } =
        props;

    const [form] = Form.useForm();

    const handleFilterChange = (changedValues) => {
        setTableFilter((prev) => {
            const next = { ...prev };

            if (
                changedValues.date_purchased_format &&
                changedValues.date_purchased_format.length > 0
            ) {
                next.date_purchased_format = [
                    dayjs(changedValues.date_purchased_format[0]).format(
                        "YYYY-MM-DD",
                    ),
                    dayjs(changedValues.date_purchased_format[1]).format(
                        "YYYY-MM-DD",
                    ),
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
        if (
            tableFilter.date_purchased_format &&
            tableFilter.date_purchased_format.length === 0
        ) {
            form.setFieldsValue({ date_purchased_format: [] });
        }
    }, [tableFilter.date_purchased_format, form]);

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

                        <Form.Item
                            name="date_purchased_format"
                            label="Date Purchased Order"
                        >
                            <FloatRangePicker
                                allowClear
                                size="middle"
                                picker="date"
                                format="MMMM DD, YYYY"
                                onChange={(date) => {
                                    if (!date) {
                                        setTableFilter((prev) => ({
                                            ...prev,
                                            date_purchased_format: [],
                                        }));
                                    } else {
                                        form.submit();
                                    }
                                }}
                            />
                        </Form.Item>

                        {/* checkbox for columns to be shown in TablePayment */}
                        <Form.Item
                            label={
                                <Flex gap={5} align="center">
                                    Table Columns
                                    <Tooltip title="Select columns to be displayed in table.">
                                        <InfoCircleOutlined
                                            style={{ color: "#999" }}
                                        />
                                    </Tooltip>
                                </Flex>
                            }
                        >
                            <Checkbox.Group
                                value={tableColumns}
                                onChange={(checkedValues) => {
                                    setTableColumns(checkedValues);
                                }}
                                className="flex! column!"
                            >
                                {/* <Checkbox value="payment_validation">Status</Checkbox> */}
                                <Checkbox value="vat_type">VAT Type</Checkbox>
                                <Checkbox value="ewt_type">EWT Type</Checkbox>
                                <Checkbox value="terms">Terms</Checkbox>
                                <Checkbox value="discount">Discount</Checkbox>
                                <Checkbox value="total_gross_amount">
                                    Total Gross Amount
                                </Checkbox>
                                <Checkbox value="value_added_tax">
                                    Value Added Tax
                                </Checkbox>
                                <Checkbox value="total_amount_payable">
                                    Total Amount Payable
                                </Checkbox>
                                <Checkbox value="amount_due">
                                    Amount Due
                                </Checkbox>
                                <Checkbox value="net_amount_due">
                                    Net Amount Due
                                </Checkbox>
                                <Checkbox value="paid_status">
                                    Paid Status
                                </Checkbox>
                            </Checkbox.Group>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </>
    );
}
