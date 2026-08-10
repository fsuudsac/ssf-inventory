import {
    Button,
    Card,
    Flex,
    Form,
    Input,
    InputNumber,
    notification,
    Popconfirm,
    Select,
    Tooltip,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLightbulb,
    faPlus,
    faTrash,
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import validateRules from "../../../../providers/validateRules";
import formatToCurrency from "../../../../providers/formatToCurrency";

export default function PurchaseFormDetailContent(props) {
    const {
        form,
        dataProductDetails,
        handleChangeQuantity,
        handleDeletePurchaseDetail,
        isLoadingDeletePurchaseDetail,
        dataEwtType,
    } = props;

    return (
        <Card title={null} className="card_purchase_details">
            <Form.Item shouldUpdate noStyle>
                {() => {
                    let date_purchased = form.getFieldValue("date_purchased");
                    let purchase_details =
                        form.getFieldValue("purchase_details");

                    let vat_type = form.getFieldValue("vat_type");
                    let ewt_type_id = form.getFieldValue("ewt_type_id");

                    let disabled = true;

                    if (date_purchased) {
                        disabled = false;
                    }

                    let ewt_type = 0;
                    let findEwtType = dataEwtType.find(
                        (x) => x.id === ewt_type_id,
                    );

                    if (findEwtType && findEwtType.ewt_type) {
                        ewt_type = Number(findEwtType.ewt_type);
                    }

                    let total_cost = 0;
                    let total_vat = 0;
                    let gross_amount = 0;

                    let total_gross_amount = 0;
                    let total_value_added_tax = 0;
                    let total_amount_payable = 0;

                    if (purchase_details && purchase_details.length > 0) {
                        purchase_details
                            .filter((x) => x)
                            .forEach((item) => {
                                let cost = item.cost ? Number(item.cost) : 0;
                                let quantity = item.quantity
                                    ? Number(item.quantity)
                                    : 0;
                                let sub_total_cost = cost * quantity;

                                let vat = 0;

                                if (vat_type === "Vat") {
                                    vat = (sub_total_cost / 1.12) * 0.12;
                                }
                                total_cost += sub_total_cost;
                                total_vat += vat;
                                total_value_added_tax += vat;
                                gross_amount += sub_total_cost - vat;
                                total_gross_amount += sub_total_cost - vat;
                                total_amount_payable += sub_total_cost;
                            });
                    }

                    let total_withholding_tax =
                        total_gross_amount * (ewt_type / 100);

                    let total_amount_due =
                        total_amount_payable - total_withholding_tax;

                    let total_discount =
                        form.getFieldValue("total_discount") ?? 0;
                    let total_net_amount_due =
                        total_amount_due - total_discount;

                    return (
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        <Flex
                                            justify="space-between"
                                            align="center"
                                        >
                                            <span>Product</span>
                                            <Tooltip
                                                title="Only products with active pricing on the selected Date Purchased Order are shown."
                                                placement="top"
                                            >
                                                <span
                                                    style={{
                                                        cursor: "pointer",
                                                        marginLeft: 8,
                                                    }}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faLightbulb}
                                                        style={{
                                                            color: "#114EAF",
                                                        }}
                                                    />
                                                </span>
                                            </Tooltip>
                                        </Flex>
                                    </th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Quantity</th>
                                    <th className="text-right">Cost</th>
                                    <th className="text-right">Total Cost</th>
                                    <th className="text-right">Vat</th>
                                    <th className="text-right">Gross Amount</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>

                            <Form.List name="purchase_details" noStyle>
                                {(fields, { add, remove }) => {
                                    return (
                                        <tbody>
                                            {fields.map(
                                                ({
                                                    key,
                                                    name,
                                                    ...restField
                                                }) => {
                                                    let purchase_detail =
                                                        purchase_details &&
                                                        purchase_details.length >
                                                            0
                                                            ? purchase_details[
                                                                  name
                                                              ]
                                                            : null;

                                                    let product_type =
                                                        purchase_detail &&
                                                        purchase_detail.product_type
                                                            ? purchase_detail.product_type
                                                            : "";
                                                    let product_size =
                                                        purchase_detail &&
                                                        purchase_detail.product_size
                                                            ? purchase_detail.product_size
                                                            : "";
                                                    let cost =
                                                        purchase_detail &&
                                                        purchase_detail.cost
                                                            ? purchase_detail.cost
                                                            : "";
                                                    let total_cost =
                                                        purchase_detail &&
                                                        purchase_detail.total_cost
                                                            ? purchase_detail.total_cost
                                                            : "";
                                                    let vat =
                                                        purchase_detail &&
                                                        purchase_detail.vat
                                                            ? purchase_detail.vat
                                                            : "";
                                                    let gross_amount =
                                                        purchase_detail &&
                                                        purchase_detail.gross_amount
                                                            ? purchase_detail.gross_amount
                                                            : "";

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
                                                                        validateRules.required(),
                                                                        {
                                                                            validator:
                                                                                (
                                                                                    _,
                                                                                    value,
                                                                                ) => {
                                                                                    let product_detail =
                                                                                        dataProductDetails.data.find(
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

                                                                                    let datePurchased =
                                                                                        dayjs(
                                                                                            date_purchased ??
                                                                                                dayjs().format(
                                                                                                    "YYYY-MM-DD",
                                                                                                ),
                                                                                        ).format(
                                                                                            "YYYY-MM-DD",
                                                                                        );

                                                                                    let product_detail_price =
                                                                                        product_detail.product_detail_prices.find(
                                                                                            (
                                                                                                x,
                                                                                            ) =>
                                                                                                x.start_date <=
                                                                                                    datePurchased &&
                                                                                                x.end_date >=
                                                                                                    datePurchased,
                                                                                        );

                                                                                    if (
                                                                                        !product_detail_price
                                                                                    ) {
                                                                                        return Promise.reject(
                                                                                            new Error(
                                                                                                `Product cost not found`,
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
                                                                        disabled={
                                                                            disabled
                                                                        }
                                                                        options={
                                                                            dataProductDetails &&
                                                                            dataProductDetails.data
                                                                                ? dataProductDetails.data
                                                                                      .filter(
                                                                                          (
                                                                                              item,
                                                                                          ) => {
                                                                                              // has set prices
                                                                                              if (
                                                                                                  !item.product_detail_prices ||
                                                                                                  item
                                                                                                      .product_detail_prices
                                                                                                      .length ===
                                                                                                      0
                                                                                              ) {
                                                                                                  return false;
                                                                                              }

                                                                                              const targetDate =
                                                                                                  dayjs(
                                                                                                      date_purchased ??
                                                                                                          dayjs(),
                                                                                                  ).format(
                                                                                                      "YYYY-MM-DD",
                                                                                                  );

                                                                                              // where current date in between a start_date and end_date of a price
                                                                                              const activePrice =
                                                                                                  item.product_detail_prices.find(
                                                                                                      (
                                                                                                          price,
                                                                                                      ) => {
                                                                                                          const startDate =
                                                                                                              price.start_date
                                                                                                                  ? dayjs(
                                                                                                                        price.start_date,
                                                                                                                    ).format(
                                                                                                                        "YYYY-MM-DD",
                                                                                                                    )
                                                                                                                  : null;
                                                                                                          const endDate =
                                                                                                              price.end_date
                                                                                                                  ? dayjs(
                                                                                                                        price.end_date,
                                                                                                                    ).format(
                                                                                                                        "YYYY-MM-DD",
                                                                                                                    )
                                                                                                                  : null;

                                                                                                          if (
                                                                                                              !startDate ||
                                                                                                              !endDate ||
                                                                                                              price.cost ===
                                                                                                                  null
                                                                                                          )
                                                                                                              return false;

                                                                                                          return (
                                                                                                              targetDate >=
                                                                                                                  startDate &&
                                                                                                              targetDate <=
                                                                                                                  endDate
                                                                                                          );
                                                                                                      },
                                                                                                  );

                                                                                              return !!activePrice;
                                                                                          },
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

                                                                                              return {
                                                                                                  label: label.join(
                                                                                                      " / ",
                                                                                                  ),
                                                                                                  value: item.id,
                                                                                                  disabled:
                                                                                                      purchase_details.some(
                                                                                                          (
                                                                                                              x,
                                                                                                          ) =>
                                                                                                              x &&
                                                                                                              x.product_detail_id ===
                                                                                                                  item.id,
                                                                                                      ),
                                                                                              };
                                                                                          },
                                                                                      )
                                                                                : []
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            let product_detail =
                                                                                dataProductDetails.data.find(
                                                                                    (
                                                                                        item,
                                                                                    ) =>
                                                                                        item.id ===
                                                                                        e,
                                                                                );

                                                                            if (
                                                                                !product_detail
                                                                            ) {
                                                                                notification.error(
                                                                                    {
                                                                                        message:
                                                                                            "Product Detail",
                                                                                        description:
                                                                                            "Product detail not found",
                                                                                    },
                                                                                );
                                                                                return;
                                                                            }

                                                                            let product_detail_price =
                                                                                product_detail.product_detail_prices.find(
                                                                                    (
                                                                                        x,
                                                                                    ) =>
                                                                                        x.start_date <=
                                                                                            dayjs(
                                                                                                date_purchased,
                                                                                            ).format(
                                                                                                "YYYY-MM-DD",
                                                                                            ) &&
                                                                                        x.end_date >=
                                                                                            dayjs(
                                                                                                date_purchased,
                                                                                            ).format(
                                                                                                "YYYY-MM-DD",
                                                                                            ),
                                                                                );

                                                                            if (
                                                                                !product_detail_price
                                                                            ) {
                                                                                notification.error(
                                                                                    {
                                                                                        message:
                                                                                            "Product Cost",
                                                                                        description:
                                                                                            "Product cost not found",
                                                                                    },
                                                                                );
                                                                                return;
                                                                            }

                                                                            let cost =
                                                                                product_detail_price
                                                                                    ? Number(
                                                                                          product_detail_price.cost,
                                                                                      )
                                                                                    : 0;
                                                                            let total_cost =
                                                                                cost;
                                                                            let vat = 0;

                                                                            if (
                                                                                vat_type ===
                                                                                    "Vat" &&
                                                                                total_cost >
                                                                                    0
                                                                            ) {
                                                                                vat =
                                                                                    (total_cost /
                                                                                        1.12) *
                                                                                    0.12;
                                                                            }

                                                                            let gross_amount =
                                                                                total_cost -
                                                                                vat;

                                                                            purchase_details[
                                                                                name
                                                                            ] =
                                                                                {
                                                                                    ...purchase_detail,
                                                                                    product_detail_id:
                                                                                        e,
                                                                                    product_type:
                                                                                        product_detail.product_type,
                                                                                    product_size:
                                                                                        product_detail.product_size,
                                                                                    quantity: 1,
                                                                                    cost,
                                                                                    total_cost,
                                                                                    vat,
                                                                                    gross_amount,
                                                                                    orig_cost:
                                                                                        product_detail_price.cost,
                                                                                    orig_dealers_price:
                                                                                        product_detail_price.dealers_price,
                                                                                    orig_wholesale_price:
                                                                                        product_detail_price.wholesale_price,
                                                                                    orig_srp:
                                                                                        product_detail_price.srp,
                                                                                    orig_fleet_price:
                                                                                        product_detail_price.fleet_price,
                                                                                };

                                                                            form.setFieldValue(
                                                                                "purchase_details",
                                                                                purchase_details,
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
                                                                >
                                                                    <InputNumber
                                                                        placeholder="Quantity"
                                                                        min={1}
                                                                        disabled={
                                                                            disabled
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            handleChangeQuantity(
                                                                                {
                                                                                    value: e,
                                                                                    name,
                                                                                },
                                                                            );
                                                                        }}
                                                                    />
                                                                </Form.Item>
                                                            </td>

                                                            <td className="text-right">
                                                                <div
                                                                    style={{
                                                                        height: 40,
                                                                    }}
                                                                >
                                                                    {formatToCurrency(
                                                                        cost,
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
                                                                        total_cost,
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
                                                                            handleDeletePurchaseDetail(
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
                                                                                        faTrash
                                                                                    }
                                                                                />
                                                                            }
                                                                            className="btn-delete w-auto h-auto p-0"
                                                                            disabled={
                                                                                isLoadingDeletePurchaseDetail ||
                                                                                disabled
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
                                                <td colSpan={5}>
                                                    <Flex
                                                        justify="space-between"
                                                        align="center"
                                                    >
                                                        <Button
                                                            type="link"
                                                            onClick={() =>
                                                                add()
                                                            }
                                                            className="w-auto h-auto p-0"
                                                            disabled={disabled}
                                                            icon={
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faPlus
                                                                    }
                                                                />
                                                            }
                                                        >
                                                            Add Product
                                                        </Button>

                                                        <span>Total</span>
                                                    </Flex>
                                                </td>
                                                <td className="text-right">
                                                    {formatToCurrency(
                                                        total_cost,
                                                    )}
                                                </td>
                                                <td className="text-right">
                                                    {formatToCurrency(
                                                        total_vat,
                                                    )}
                                                </td>
                                                <td className="text-right">
                                                    {formatToCurrency(
                                                        gross_amount,
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
                                    <td colSpan={5} />
                                    <td colSpan={3}>
                                        <Flex
                                            justify="space-between"
                                            vertical={true}
                                        >
                                            <Flex justify="space-between">
                                                <div>Total Gross Amount</div>
                                                <div>
                                                    {total_gross_amount
                                                        ? formatToCurrency(
                                                              total_gross_amount,
                                                          )
                                                        : 0}
                                                </div>
                                            </Flex>

                                            <Flex
                                                justify="space-between"
                                                className="underline"
                                            >
                                                <div>Total Gross Amount</div>
                                                <div className="text-right">
                                                    {total_value_added_tax
                                                        ? formatToCurrency(
                                                              total_value_added_tax,
                                                          )
                                                        : 0}
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
                                                        {total_amount_payable
                                                            ? formatToCurrency(
                                                                  total_amount_payable,
                                                              )
                                                            : 0}
                                                    </strong>
                                                </div>
                                            </Flex>

                                            <Flex
                                                justify="space-between"
                                                className="underline"
                                            >
                                                <div>Less: Withholding Tax</div>
                                                <div className="text-right">
                                                    {total_withholding_tax
                                                        ? formatToCurrency(
                                                              total_withholding_tax,
                                                          )
                                                        : 0}
                                                </div>
                                            </Flex>
                                            <Flex justify="space-between">
                                                <div>
                                                    <strong>Amount Due</strong>
                                                </div>
                                                <div>
                                                    <strong>
                                                        {total_amount_due
                                                            ? formatToCurrency(
                                                                  total_amount_due,
                                                              )
                                                            : 0}
                                                    </strong>
                                                </div>
                                            </Flex>
                                            <Flex
                                                justify="space-between"
                                                className="underline"
                                                align="center"
                                            >
                                                <div>Less: Discount</div>
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
                                                        {total_net_amount_due
                                                            ? formatToCurrency(
                                                                  total_net_amount_due,
                                                              )
                                                            : 0}
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
