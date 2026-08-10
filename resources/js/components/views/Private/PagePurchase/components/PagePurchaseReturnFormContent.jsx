import { useContext } from "react";
import { Alert, Button, Card, Col, Divider, Flex, Form, Row, Tag } from "antd";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

import validateRules from "../../../../providers/validateRules";
import PagePurchaseContext from "./PagePurchaseContext";
import formatToCurrency from "../../../../providers/formatToCurrency";
import FloatSelect from "../../../../providers/FloatSelect";
import FloatInput from "../../../../providers/FloatInput";
import FloatTextArea from "../../../../providers/FloatTextArea";
import FloatDatePicker from "../../../../providers/FloatDatePicker";

const STATUS_COLORS = {
    Completed: "success",
    Pending: "warning",
    Canceled: "error",
};

export default function PagePurchaseReturnFormContent() {
    const {
        form,
        dataPurchase,
        handlePurchaseInfo,
        isLoadingPurchaseInfo,
        isLoadingPurchaseReturn,
        hasPendingReturn,
    } = useContext(PagePurchaseContext);

    const params = useParams();

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Card title="Invoice Information">
                    <Row gutter={[20, 0]}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                            <Form.Item
                                name="purchase_id"
                                rules={[validateRules.required()]}
                            >
                                <FloatSelect
                                    label="Invoice"
                                    placeholder="Select invoice"
                                    required
                                    options={
                                        dataPurchase && dataPurchase.data
                                            ? dataPurchase.data.map((item) => ({
                                                  value: item.id,
                                                  label: item.invoice_no,
                                              }))
                                            : []
                                    }
                                    onChange={(value) =>
                                        handlePurchaseInfo(value)
                                    }
                                    disabled={isLoadingPurchaseInfo}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                            <Form.Item name="suppliier_name">
                                <FloatInput
                                    label="Supplier"
                                    placeholder="Supplier"
                                    disabled
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Card className="card_purchase_details">
                    <Row gutter={[20, 20]}>
                        <Col
                            xs={24}
                            sm={24}
                            md={24}
                            lg={24}
                            xl={24}
                            xxl={24}
                            className="mb-20"
                        >
                            {hasPendingReturn && (
                                <Alert
                                    type="warning"
                                    showIcon
                                    message="A Pending return already exists for this invoice. You cannot submit a new return until the pending one is resolved (Completed or Cancelled)."
                                    style={{ marginBottom: 16 }}
                                />
                            )}

                            <Form.Item shouldUpdate noStyle>
                                {() => {
                                    let purchase_return_details =
                                        form.getFieldValue(
                                            "purchase_return_details",
                                        );

                                    let total_cost_total = 0;

                                    // show Date Return and Status if has return history
                                    const hasReturnHistory =
                                        !!params.id ||
                                        (purchase_return_details?.some(
                                            (item) =>
                                                item.return_history?.length > 0,
                                        ) ??
                                            false);

                                    if (purchase_return_details) {
                                        purchase_return_details.forEach(
                                            (item) => {
                                                let return_quantity =
                                                    item.return_quantity;
                                                let cost = item.cost;
                                                let total_cost = 0;

                                                if (return_quantity && cost) {
                                                    total_cost =
                                                        Number(
                                                            return_quantity,
                                                        ) * Number(cost);
                                                }

                                                total_cost_total += total_cost;
                                            },
                                        );
                                    }

                                    return (
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>
                                                        Purchase Order Quantity
                                                    </th>
                                                    <th>Return Quantity</th>
                                                    {hasReturnHistory && (
                                                        <>
                                                            <th>Date Return</th>
                                                            <th>Status</th>
                                                        </>
                                                    )}
                                                    <th className="text-right">
                                                        Cost
                                                    </th>
                                                    <th className="text-right">
                                                        Total Cost
                                                    </th>
                                                </tr>
                                            </thead>

                                            <Form.List
                                                name="purchase_return_details"
                                                noStyle
                                            >
                                                {(fields) => (
                                                    <tbody>
                                                        {fields.map(
                                                            ({
                                                                key,
                                                                name,
                                                                ...restField
                                                            }) => {
                                                                let purchase_return_detail =
                                                                    purchase_return_details &&
                                                                    purchase_return_details[
                                                                        name
                                                                    ];

                                                                let product_info =
                                                                    purchase_return_detail?.product_info;
                                                                let return_quantity =
                                                                    purchase_return_detail?.return_quantity;
                                                                let cost =
                                                                    purchase_return_detail?.cost;

                                                                // available_quantity (original minus Completed/Pending returns)
                                                                let available_quantity =
                                                                    purchase_return_detail?.available_quantity;

                                                                // historical return rows
                                                                let return_history =
                                                                    purchase_return_detail?.return_history ??
                                                                    [];

                                                                let total_cost = 0;

                                                                if (
                                                                    return_quantity &&
                                                                    cost
                                                                ) {
                                                                    total_cost =
                                                                        Number(
                                                                            return_quantity,
                                                                        ) *
                                                                        Number(
                                                                            cost,
                                                                        );
                                                                }

                                                                const productCell =
                                                                    (
                                                                        <Flex align="center">
                                                                            <div>
                                                                                {
                                                                                    product_info
                                                                                        ?.product
                                                                                        ?.product_name
                                                                                }
                                                                            </div>
                                                                            <Divider type="vertical" />
                                                                            <div>
                                                                                {
                                                                                    product_info
                                                                                        ?.product_type
                                                                                        ?.product_type
                                                                                }
                                                                            </div>
                                                                            <Divider type="vertical" />
                                                                            <div>
                                                                                {
                                                                                    product_info
                                                                                        ?.product_size
                                                                                        ?.product_size
                                                                                }
                                                                            </div>
                                                                        </Flex>
                                                                    );

                                                                return (
                                                                    <>
                                                                        {/* historical return rows */}
                                                                        {return_history.map(
                                                                            (
                                                                                hist,
                                                                                histIdx,
                                                                            ) => (
                                                                                <tr
                                                                                    key={`hist_${key}_${histIdx}`}
                                                                                    style={{
                                                                                        // Dim Rejected/Cancelled rows
                                                                                        opacity:
                                                                                            hist.status ===
                                                                                                "Rejected" ||
                                                                                            hist.status ===
                                                                                                "Cancelled"
                                                                                                ? 0.55
                                                                                                : 1,
                                                                                        background:
                                                                                            "#fafafa",
                                                                                    }}
                                                                                >
                                                                                    <td>
                                                                                        <div
                                                                                            style={{
                                                                                                height: 40,
                                                                                            }}
                                                                                        >
                                                                                            {
                                                                                                productCell
                                                                                            }
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div
                                                                                            style={{
                                                                                                height: 40,
                                                                                            }}
                                                                                        >
                                                                                            {
                                                                                                hist.purchase_order_quantity
                                                                                            }
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div
                                                                                            style={{
                                                                                                height: 40,
                                                                                            }}
                                                                                        >
                                                                                            {
                                                                                                hist.return_quantity
                                                                                            }
                                                                                        </div>
                                                                                    </td>
                                                                                    {hasReturnHistory && (
                                                                                        <>
                                                                                            <td>
                                                                                                <div
                                                                                                    style={{
                                                                                                        height: 40,
                                                                                                    }}
                                                                                                >
                                                                                                    {
                                                                                                        hist.date_return
                                                                                                    }
                                                                                                </div>
                                                                                            </td>

                                                                                            <td>
                                                                                                <div
                                                                                                    style={{
                                                                                                        height: 40,
                                                                                                    }}
                                                                                                >
                                                                                                    <Tag
                                                                                                        color={
                                                                                                            STATUS_COLORS[
                                                                                                                hist
                                                                                                                    .status
                                                                                                            ] ??
                                                                                                            "default"
                                                                                                        }
                                                                                                    >
                                                                                                        {
                                                                                                            hist.status
                                                                                                        }
                                                                                                    </Tag>
                                                                                                </div>
                                                                                            </td>
                                                                                        </>
                                                                                    )}
                                                                                    <td>
                                                                                        <div
                                                                                            style={{
                                                                                                height: 40,
                                                                                                textAlign:
                                                                                                    "right",
                                                                                            }}
                                                                                        >
                                                                                            {formatToCurrency(
                                                                                                cost,
                                                                                            )}
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div
                                                                                            style={{
                                                                                                height: 40,
                                                                                                textAlign:
                                                                                                    "right",
                                                                                            }}
                                                                                        >
                                                                                            {formatToCurrency(
                                                                                                Number(
                                                                                                    hist.return_quantity,
                                                                                                ) *
                                                                                                    Number(
                                                                                                        cost,
                                                                                                    ),
                                                                                            )}
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            ),
                                                                        )}

                                                                        <tr
                                                                            key={
                                                                                key
                                                                            }
                                                                        >
                                                                            <td>
                                                                                <div
                                                                                    style={{
                                                                                        height: 40,
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        productCell
                                                                                    }
                                                                                </div>
                                                                            </td>

                                                                            {/* show available_quantity instead of original purchase_quantity */}
                                                                            <td>
                                                                                <div
                                                                                    style={{
                                                                                        height: 40,
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        available_quantity
                                                                                    }
                                                                                </div>
                                                                            </td>

                                                                            <td>
                                                                                <Form.Item
                                                                                    {...restField}
                                                                                    name={[
                                                                                        name,
                                                                                        "return_quantity",
                                                                                    ]}
                                                                                    rules={[
                                                                                        {
                                                                                            //  validate against available_quantity, not original purchase_quantity
                                                                                            validator:
                                                                                                (
                                                                                                    _,
                                                                                                    value,
                                                                                                ) => {
                                                                                                    if (
                                                                                                        value &&
                                                                                                        Number(
                                                                                                            value,
                                                                                                        ) >
                                                                                                            Number(
                                                                                                                available_quantity,
                                                                                                            )
                                                                                                    ) {
                                                                                                        return Promise.reject(
                                                                                                            `Cannot exceed available quantity: ${available_quantity}`,
                                                                                                        );
                                                                                                    }
                                                                                                    return Promise.resolve();
                                                                                                },
                                                                                        },
                                                                                    ]}
                                                                                >
                                                                                    <FloatInput
                                                                                        label="Return Quantity"
                                                                                        placeholder="Return Quantity"
                                                                                        // Disable input if nothing left to return
                                                                                        disabled={
                                                                                            available_quantity ===
                                                                                            0
                                                                                        }
                                                                                        required={
                                                                                            available_quantity >
                                                                                            0
                                                                                                ? true
                                                                                                : false
                                                                                        }
                                                                                    />
                                                                                </Form.Item>
                                                                            </td>

                                                                            {hasReturnHistory && (
                                                                                <>
                                                                                    <td>
                                                                                        <div
                                                                                            style={{
                                                                                                height: 40,
                                                                                                color: "#bbb",
                                                                                            }}
                                                                                        >
                                                                                            —
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div
                                                                                            style={{
                                                                                                height: 40,
                                                                                                color: "#bbb",
                                                                                            }}
                                                                                        >
                                                                                            —
                                                                                        </div>
                                                                                    </td>
                                                                                </>
                                                                            )}
                                                                            <td>
                                                                                <div
                                                                                    style={{
                                                                                        height: 40,
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {formatToCurrency(
                                                                                        cost,
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td>
                                                                                <div
                                                                                    style={{
                                                                                        height: 40,
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {formatToCurrency(
                                                                                        total_cost,
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    </>
                                                                );
                                                            },
                                                        )}

                                                        <tr>
                                                            <td
                                                                colSpan={
                                                                    hasReturnHistory
                                                                        ? 6
                                                                        : 4
                                                                }
                                                                className="text-right"
                                                            >
                                                                TOTAL:
                                                            </td>
                                                            <td className="text-right">
                                                                {formatToCurrency(
                                                                    total_cost_total,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                )}
                                            </Form.List>
                                        </table>
                                    );
                                }}
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                            <Form.Item
                                name="date_return"
                                rules={[validateRules.required()]}
                            >
                                <FloatDatePicker
                                    label="Date Return"
                                    placeholder="Date Return"
                                    disabledDate={(current) =>
                                        current.isBefore(
                                            dayjs().subtract(1, "days"),
                                        )
                                    }
                                    format={{
                                        type: "mask",
                                        format: "DD/MM/YYYY",
                                    }}
                                    required
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                            <Form.Item
                                name="status"
                                rules={[validateRules.required()]}
                            >
                                <FloatSelect
                                    label="Status"
                                    placeholder="Select status"
                                    required
                                    options={[
                                        { value: "Pending", label: "Pending" },
                                        {
                                            value: "Completed",
                                            label: "Completed",
                                        },
                                        {
                                            value: "Canceled",
                                            label: "Canceled",
                                        },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                            <Form.Item name="remarks" noStyle>
                                <FloatTextArea
                                    label="Remarks"
                                    placeholder="Remarks"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Button
                    className="btn-main-primary"
                    loading={isLoadingPurchaseReturn}
                    htmlType="submit"
                    disabled={hasPendingReturn}
                >
                    Submit
                </Button>
            </Col>
        </Row>
    );
}
