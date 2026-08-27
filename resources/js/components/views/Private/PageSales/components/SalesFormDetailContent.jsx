import {
    Button,
    Card,
    Checkbox,
    Flex,
    Form,
    Input,
    InputNumber,
    notification,
    Popconfirm,
    Select,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faTrash,
    faTrashAlt,
} from "@fortawesome/pro-regular-svg-icons";

import validateRules from "../../../../providers/validateRules";
import formatToCurrency from "../../../../providers/formatToCurrency";
import FloatDatePicker from "../../../../providers/FloatDatePicker";
import isEmptyObject from "../../../../providers/isEmptyObject";

export default function SalesFormDetailContent(props) {
    const {
        form,
        dataSource,
        dataProductDetails,
        handleDeleteSalesDetail,
        isLoadingDeleteSalesDetail,
        handleDeleteSalesOrderWarranty,
        isLoadingDeleteSalesOrderWarranty,
        dataEwtType,
    } = props;

    const handleProductDetailChange = (value, name) => {
        let sales_details = form.getFieldValue("sales_details");
        let date_sales = form.getFieldValue("date_sales");
        let customer_type = form.getFieldValue("customer_type");
        let vat_type = form.getFieldValue("vat_type");

        let product_detail = dataProductDetails.find(
            (item) => item.id === value,
        );

        let product_detail_price = product_detail.product_detail_prices.find(
            (x) =>
                x.start_date <= date_sales?.format("YYYY-MM-DD") &&
                x.end_date >= date_sales?.format("YYYY-MM-DD"),
        );

        let sales_detail = sales_details[name];

        let price = 0;
        let quantity = 1;

        if (product_detail_price) {
            if (customer_type === "Dealer") {
                price = Number(product_detail.dealers_price);
            } else if (customer_type === "Wholesale") {
                price = Number(product_detail.wholesale_price);
            } else if (customer_type === "Walk-In") {
                price = Number(product_detail.srp);
            } else if (customer_type === "Fleet") {
                price = Number(product_detail.fleet_price);
            }
        }

        let selling_price = price * quantity;
        let vat = 0;

        if (vat_type === "Vat") {
            vat = (selling_price / 1.12) * 0.12;
        }

        let gross_amount = selling_price - vat;

        sales_details[name] = {
            ...sales_detail,
            product_type: product_detail?.product_type ?? "--",
            product_size: product_detail?.product_size ?? "--",
            quantity: 1,
            price,
            selling_price,
            vat,
            gross_amount,
            total_stock: product_detail?.total_stock ?? 0,
        };

        form.setFieldValue("sales_details", sales_details);
    };

    const handleChangeQuantity = (value, name) => {
        let sales_details = form.getFieldValue("sales_details");
        let vat_type = form.getFieldValue("vat_type");
        let quantity = value ? value : 1;

        let sales_detail = sales_details[name];

        let price = sales_detail?.price ?? 0;

        let selling_price = price * quantity;
        let vat = 0;

        if (vat_type === "Vat") {
            vat = (selling_price / 1.12) * 0.12;
        }

        let gross_amount = selling_price - vat;

        sales_details[name] = {
            ...sales_detail,
            selling_price,
            vat,
            gross_amount,
        };

        form.setFieldValue("sales_details", sales_details);
    };

    return (
        <Card title={null} className="card_sales_details">
            <Form.Item shouldUpdate noStyle>
                {() => {
                    let sales_details = form.getFieldValue("sales_details");
                    let customer_id = form.getFieldValue("customer_id");
                    let customer_type = form.getFieldValue("customer_type");
                    let date_sales = form.getFieldValue("date_sales");
                    let total_discount =
                        form.getFieldValue("total_discount") ?? 0;
                    let ewt_type_id = form.getFieldValue("ewt_type_id");

                    let disabled = true;

                    if (date_sales && customer_id && customer_type) {
                        disabled = false;
                    }

                    let findEwtType = dataEwtType.find(
                        (x) => x.id === ewt_type_id,
                    );

                    let ewt_type =
                        findEwtType && findEwtType.ewt_type
                            ? Number(findEwtType.ewt_type)
                            : 0;

                    let sub_total_selling_price = 0;
                    let sub_total_vat = 0;
                    let sub_total_gross_amount = 0;

                    sales_details
                        .filter((x) => x && !isEmptyObject(x))
                        .forEach((item) => {
                            let price = item.price ? Number(item.price) : 0;
                            let quantity = item.quantity
                                ? Number(item.quantity)
                                : 0;
                            let total_amount = price * quantity;
                            let vat = 0;

                            if (vat_type === "Vat") {
                                vat = (total_amount / 1.12) * 0.12;
                            }

                            sub_total_selling_price += item?.selling_price ?? 0;
                            sub_total_vat += item?.vat ?? 0;
                            sub_total_gross_amount += item?.gross_amount ?? 0;
                        });

                    let total_gross_amount = sub_total_gross_amount;
                    let total_value_added_tax = sub_total_vat;
                    let total_amount_payable = sub_total_selling_price;
                    let total_withholding_tax =
                        sub_total_gross_amount * (ewt_type / 100);
                    let total_amount_due =
                        total_amount_payable - total_withholding_tax;
                    let total_net_amount_due =
                        total_amount_due - total_discount;

                    return (
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Quantity</th>
                                    <th>Price per Unit</th>
                                    <th>Total Selling Price</th>
                                    <th>Vat</th>
                                    <th>Gross Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <Form.List name="sales_details" noStyle>
                                {(fields, { add, remove }) => {
                                    return (
                                        <tbody>
                                            {fields.map(
                                                ({
                                                    key,
                                                    name,
                                                    ...restField
                                                }) => {
                                                    let sales_detail =
                                                        sales_details[name];

                                                    let product_type =
                                                        sales_detail?.product_type ??
                                                        "--";
                                                    let product_size =
                                                        sales_detail?.product_size ??
                                                        "--";
                                                    let price =
                                                        sales_detail?.price ??
                                                        0;
                                                    let selling_price =
                                                        sales_detail?.selling_price ??
                                                        0;
                                                    let vat =
                                                        sales_detail?.vat ?? 0;
                                                    let gross_amount =
                                                        sales_detail?.gross_amount ??
                                                        0;

                                                    // console.log(
                                                    //     "sales_detail: ",
                                                    //     sales_detail
                                                    // );

                                                    return (
                                                        <tr key={key}>
                                                            <td>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[
                                                                        name,
                                                                        "product_detail_id",
                                                                    ]}
                                                                    rules={[
                                                                        validateRules.required,
                                                                        {
                                                                            validator:
                                                                                (
                                                                                    _,
                                                                                    value,
                                                                                ) => {
                                                                                    let product_detail =
                                                                                        dataProductDetails.find(
                                                                                            (
                                                                                                item,
                                                                                            ) =>
                                                                                                item.id ===
                                                                                                value,
                                                                                        );

                                                                                    if (
                                                                                        !product_detail
                                                                                    ) {
                                                                                        return Promise.reject(
                                                                                            new Error(
                                                                                                `Product detail not found`,
                                                                                            ),
                                                                                        );
                                                                                    }

                                                                                    let dateSales =
                                                                                        date_sales
                                                                                            ? date_sales.format(
                                                                                                  "YYYY-MM-DD",
                                                                                              )
                                                                                            : null;

                                                                                    let product_detail_price =
                                                                                        product_detail.product_detail_prices.find(
                                                                                            (
                                                                                                x,
                                                                                            ) =>
                                                                                                x.start_date <=
                                                                                                    dateSales &&
                                                                                                x.end_date >=
                                                                                                    dateSales,
                                                                                        );

                                                                                    if (
                                                                                        !product_detail_price
                                                                                    ) {
                                                                                        return Promise.reject(
                                                                                            new Error(
                                                                                                `Product price not found`,
                                                                                            ),
                                                                                        );
                                                                                    }

                                                                                    return Promise.resolve();
                                                                                },
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Select
                                                                        placeholder="Product"
                                                                        showSearch
                                                                        filterOption={(
                                                                            input,
                                                                            option,
                                                                        ) => {
                                                                            return (
                                                                                option.label
                                                                                    .toLowerCase()
                                                                                    .indexOf(
                                                                                        input.toLowerCase(),
                                                                                    ) >=
                                                                                0
                                                                            );
                                                                        }}
                                                                        options={dataProductDetails
                                                                            .filter(
                                                                                (
                                                                                    x,
                                                                                ) =>
                                                                                    x.total_stock >
                                                                                    0,
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    item,
                                                                                ) => {
                                                                                    let label =
                                                                                        [
                                                                                            item.product_name,
                                                                                        ];

                                                                                    if (
                                                                                        item.product_type
                                                                                    ) {
                                                                                        label.push(
                                                                                            item.product_type,
                                                                                        );
                                                                                    }
                                                                                    if (
                                                                                        item.product_size
                                                                                    ) {
                                                                                        label.push(
                                                                                            item.product_size,
                                                                                        );
                                                                                    }

                                                                                    let disabled = true;

                                                                                    let filtered_sales_details =
                                                                                        sales_details.some(
                                                                                            (
                                                                                                x,
                                                                                            ) =>
                                                                                                x &&
                                                                                                x.product_detail_id ===
                                                                                                    item.id,
                                                                                        );

                                                                                    if (
                                                                                        !filtered_sales_details
                                                                                    ) {
                                                                                        disabled = false;
                                                                                    }

                                                                                    return {
                                                                                        label: label.join(
                                                                                            " / ",
                                                                                        ),
                                                                                        value: item.id,
                                                                                        disabled,
                                                                                    };
                                                                                },
                                                                            )}
                                                                        disabled={
                                                                            disabled
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            handleProductDetailChange(
                                                                                e,
                                                                                name,
                                                                            );
                                                                        }}
                                                                    />
                                                                </Form.Item>
                                                            </td>

                                                            <td>
                                                                <div
                                                                    style={{
                                                                        height: 40,
                                                                    }}
                                                                >
                                                                    {
                                                                        product_type
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
                                                                        product_size
                                                                    }
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[
                                                                        name,
                                                                        "quantity",
                                                                    ]}
                                                                    rules={[
                                                                        validateRules.required,
                                                                    ]}
                                                                >
                                                                    <InputNumber
                                                                        placeholder="Quantity"
                                                                        min={1}
                                                                        max={
                                                                            sales_detail?.total_stock ??
                                                                            0
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            handleChangeQuantity(
                                                                                e,
                                                                                name,
                                                                            );
                                                                        }}
                                                                        disabled={
                                                                            disabled
                                                                        }
                                                                    />
                                                                </Form.Item>
                                                                {sales_detail?.product_detail_id && (
                                                                    <div
                                                                        style={{
                                                                            fontSize: 11,
                                                                            color:
                                                                                (sales_detail?.total_stock ??
                                                                                    0) ===
                                                                                0
                                                                                    ? "#ff4d4f"
                                                                                    : "#888",
                                                                            marginTop:
                                                                                -8,
                                                                        }}
                                                                    >
                                                                        Stock/s:{" "}
                                                                        {sales_detail?.total_stock ??
                                                                            0}
                                                                    </div>
                                                                )}
                                                            </td>

                                                            <td className="text-right">
                                                                <div
                                                                    style={{
                                                                        height: 40,
                                                                    }}
                                                                >
                                                                    {formatToCurrency(
                                                                        price,
                                                                    )}
                                                                </div>
                                                            </td>

                                                            <td className="text-right">
                                                                <div
                                                                    style={{
                                                                        height: 40,
                                                                    }}
                                                                >
                                                                    {formatToCurrency(
                                                                        selling_price,
                                                                    )}
                                                                </div>
                                                            </td>

                                                            <td className="text-right">
                                                                <div
                                                                    style={{
                                                                        height: 40,
                                                                    }}
                                                                >
                                                                    {formatToCurrency(
                                                                        vat,
                                                                    )}
                                                                </div>
                                                            </td>

                                                            <td className="text-right">
                                                                <div
                                                                    style={{
                                                                        height: 40,
                                                                    }}
                                                                >
                                                                    {formatToCurrency(
                                                                        gross_amount,
                                                                    )}
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <Flex
                                                                    align="flex-start"
                                                                    justify="center"
                                                                    style={{
                                                                        height: 40,
                                                                    }}
                                                                >
                                                                    <Popconfirm
                                                                        title={
                                                                            <>
                                                                                Are
                                                                                you
                                                                                sure
                                                                                you
                                                                                want
                                                                                to
                                                                                <br />
                                                                                delete
                                                                                this
                                                                                product?
                                                                            </>
                                                                        }
                                                                        okText="Yes"
                                                                        cancelText="No"
                                                                        onConfirm={() => {
                                                                            handleDeleteSalesDetail(
                                                                                name,
                                                                                remove,
                                                                            );
                                                                        }}
                                                                    >
                                                                        <Button
                                                                            type="link"
                                                                            icon={
                                                                                <FontAwesomeIcon
                                                                                    icon={
                                                                                        faTrashAlt
                                                                                    }
                                                                                />
                                                                            }
                                                                            className="btn-delete"
                                                                            disabled={
                                                                                isLoadingDeleteSalesDetail
                                                                            }
                                                                        />
                                                                    </Popconfirm>
                                                                </Flex>
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}

                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="text-right"
                                                >
                                                    <Flex
                                                        justify="space-between"
                                                        align="center"
                                                    >
                                                        <Button
                                                            type="link"
                                                            onClick={() =>
                                                                add()
                                                            }
                                                            icon={
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faPlus
                                                                    }
                                                                />
                                                            }
                                                            className="btn-main-primary p-0 m-0"
                                                        >
                                                            Add field
                                                        </Button>
                                                        <span>Total</span>
                                                    </Flex>
                                                </td>
                                                <td className="text-right">
                                                    {formatToCurrency(
                                                        sub_total_selling_price,
                                                    )}
                                                </td>
                                                <td className="text-right">
                                                    {formatToCurrency(
                                                        sub_total_vat,
                                                    )}
                                                </td>
                                                <td className="text-right">
                                                    {formatToCurrency(
                                                        sub_total_gross_amount,
                                                    )}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    );
                                }}
                            </Form.List>

                            <tfoot>
                                <tr>
                                    <td
                                        colSpan={4}
                                        style={{ verticalAlign: "top" }}
                                        className="warranty-table"
                                    >
                                        <Flex
                                            justify="space-between"
                                            vertical={true}
                                        >
                                            <Flex justify="space-between">
                                                <div>
                                                    <Form.Item
                                                        name="has_warranty"
                                                        className="m-0"
                                                        valuePropName="checked"
                                                    >
                                                        <Checkbox
                                                            checked={
                                                                dataSource?.has_warranty ===
                                                                1
                                                            }
                                                        >
                                                            With Warranty
                                                        </Checkbox>
                                                    </Form.Item>
                                                </div>
                                            </Flex>

                                            <Form.Item shouldUpdate noStyle>
                                                {() => {
                                                    let warranty =
                                                        form.getFieldValue(
                                                            "has_warranty",
                                                        );

                                                    if (
                                                        warranty === 1 ||
                                                        warranty === true
                                                    ) {
                                                        return (
                                                            <table>
                                                                <thead>
                                                                    <tr className="warranty-table">
                                                                        <th>
                                                                            Warranty
                                                                            No.
                                                                        </th>

                                                                        <th>
                                                                            Expiration
                                                                            Date
                                                                        </th>
                                                                        <th className="text-center">
                                                                            Action
                                                                        </th>
                                                                    </tr>
                                                                </thead>

                                                                <Form.List
                                                                    name="sales_order_warranty"
                                                                    noStyle
                                                                >
                                                                    {(
                                                                        fields,
                                                                        {
                                                                            add,
                                                                            remove,
                                                                        },
                                                                    ) => {
                                                                        return (
                                                                            <tbody>
                                                                                {fields.map(
                                                                                    ({
                                                                                        key,
                                                                                        name,
                                                                                        ...restField
                                                                                    }) => {
                                                                                        return (
                                                                                            <tr
                                                                                                key={
                                                                                                    key
                                                                                                }
                                                                                            >
                                                                                                <td>
                                                                                                    <Form.Item
                                                                                                        {...restField}
                                                                                                        name={[
                                                                                                            name,
                                                                                                            "warranty_no",
                                                                                                        ]}
                                                                                                        className="m-0"
                                                                                                    >
                                                                                                        <Input
                                                                                                            placeholder="Warranty No."
                                                                                                            type="number"
                                                                                                        />
                                                                                                    </Form.Item>
                                                                                                </td>
                                                                                                <td>
                                                                                                    <Form.Item
                                                                                                        {...restField}
                                                                                                        name={[
                                                                                                            name,
                                                                                                            "warranty_exp_date",
                                                                                                        ]}
                                                                                                        className="m-0"
                                                                                                    >
                                                                                                        <FloatDatePicker
                                                                                                            label="Expiration Date"
                                                                                                            placeholder="Expiration Date"
                                                                                                            required
                                                                                                            format="MM/DD/YYYY"
                                                                                                        />
                                                                                                    </Form.Item>
                                                                                                </td>

                                                                                                <td>
                                                                                                    <Flex
                                                                                                        align="flex-start"
                                                                                                        justify="center"
                                                                                                        style={{
                                                                                                            height: 40,
                                                                                                        }}
                                                                                                    >
                                                                                                        <Popconfirm
                                                                                                            title={
                                                                                                                <>
                                                                                                                    Are
                                                                                                                    you
                                                                                                                    sure
                                                                                                                    you
                                                                                                                    want
                                                                                                                    to
                                                                                                                    <br />
                                                                                                                    delete
                                                                                                                    this
                                                                                                                    warranty?
                                                                                                                </>
                                                                                                            }
                                                                                                            onConfirm={() => {
                                                                                                                handleDeleteSalesOrderWarranty(
                                                                                                                    name,
                                                                                                                    remove,
                                                                                                                );
                                                                                                            }}
                                                                                                            onCancel={() => {
                                                                                                                notification.error(
                                                                                                                    {
                                                                                                                        message:
                                                                                                                            "Release Item Order Warranty",
                                                                                                                        description:
                                                                                                                            "Data not deleted",
                                                                                                                    },
                                                                                                                );
                                                                                                            }}
                                                                                                            okText="Yes"
                                                                                                            cancelText="No"
                                                                                                        >
                                                                                                            <Button
                                                                                                                type="link"
                                                                                                                icon={
                                                                                                                    <FontAwesomeIcon
                                                                                                                        icon={
                                                                                                                            faTrash
                                                                                                                        }
                                                                                                                    />
                                                                                                                }
                                                                                                                className="btn-delete"
                                                                                                                disabled={
                                                                                                                    isLoadingDeleteSalesOrderWarranty
                                                                                                                }
                                                                                                            />
                                                                                                        </Popconfirm>
                                                                                                    </Flex>
                                                                                                </td>
                                                                                            </tr>
                                                                                        );
                                                                                    },
                                                                                )}

                                                                                <tr>
                                                                                    <td
                                                                                        colSpan={
                                                                                            5
                                                                                        }
                                                                                        className="text-right"
                                                                                    >
                                                                                        <Flex
                                                                                            justify="space-between"
                                                                                            align="center"
                                                                                        >
                                                                                            <Button
                                                                                                type="link"
                                                                                                onClick={() =>
                                                                                                    add()
                                                                                                }
                                                                                                icon={
                                                                                                    <FontAwesomeIcon
                                                                                                        icon={
                                                                                                            faPlus
                                                                                                        }
                                                                                                    />
                                                                                                }
                                                                                                className="btn-main-primary p-0 m-0"
                                                                                            >
                                                                                                Add
                                                                                                field
                                                                                            </Button>
                                                                                        </Flex>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        );
                                                                    }}
                                                                </Form.List>
                                                            </table>
                                                        );
                                                    }
                                                }}
                                            </Form.Item>
                                        </Flex>
                                    </td>

                                    <td />

                                    <td colSpan={3}>
                                        <Flex
                                            justify="space-between"
                                            vertical={true}
                                        >
                                            <Flex justify="space-between">
                                                <div>Total Gross Amount</div>
                                                <div>
                                                    {formatToCurrency(
                                                        total_gross_amount,
                                                    )}
                                                </div>
                                            </Flex>

                                            <Flex
                                                justify="space-between"
                                                className="underline"
                                            >
                                                <div>Add: Value-Added Tax</div>
                                                <div className="text-right">
                                                    {formatToCurrency(
                                                        total_value_added_tax,
                                                    )}
                                                </div>
                                            </Flex>

                                            <Flex justify="space-between">
                                                <div>
                                                    <strong>
                                                        Total Amount Payable
                                                    </strong>
                                                </div>
                                                <div>
                                                    <strong>
                                                        {formatToCurrency(
                                                            total_amount_payable,
                                                        )}
                                                    </strong>
                                                </div>
                                            </Flex>

                                            <Flex
                                                justify="space-between"
                                                className="underline"
                                            >
                                                <div>Less: Withholding Tax</div>

                                                <div className="text-right">
                                                    {formatToCurrency(
                                                        total_withholding_tax,
                                                    )}
                                                </div>
                                            </Flex>

                                            <Flex justify="space-between">
                                                <div>
                                                    <strong>Amount Due</strong>
                                                </div>
                                                <div>
                                                    <strong>
                                                        {formatToCurrency(
                                                            total_amount_due,
                                                        )}
                                                    </strong>
                                                </div>
                                            </Flex>

                                            <Flex
                                                justify="space-between"
                                                align="center"
                                                className="underline"
                                            >
                                                <div className="discount-label">
                                                    Less: Discount
                                                </div>
                                                <div className="text-right">
                                                    <Form.Item
                                                        noStyle
                                                        name="total_discount"
                                                    >
                                                        <Input
                                                            placeholder="Discount"
                                                            type="number"
                                                            className="text-right p-0"
                                                        />
                                                    </Form.Item>
                                                </div>
                                            </Flex>

                                            <Flex justify="space-between">
                                                <div>
                                                    <strong>
                                                        Net Amount Due
                                                    </strong>
                                                </div>
                                                <div>
                                                    <strong>
                                                        {formatToCurrency(
                                                            total_net_amount_due,
                                                        )}
                                                    </strong>
                                                </div>
                                            </Flex>
                                        </Flex>
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        </table>
                    );
                }}
            </Form.Item>
        </Card>
    );
}
