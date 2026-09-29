import { useContext } from "react";
import { Button, Card, Col, Divider, Flex, Form, Input, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import PageFormSalesContext from "./PageFormSalesContext";
import FloatSelect from "../../../../providers/FloatSelect";
import FloatDatePicker from "../../../../providers/FloatDatePicker";
import validateRules from "../../../../providers/validateRules";
import FloatInput from "../../../../providers/FloatInput";
import SalesFormDetailContent from "./SalesFormDetailContent";

export default function PageFormSalesContent() {
    const {
        form,
        dataSource,
        dataCustomers,
        dataProductDetails,
        dataCreditTerm,
        dataEwtType,
        creditTermValue,
        setCreditTermValue,
        ewtTypeValue,
        setEwtTypeValue,
        setToggleModalFormCustomer,
        handleDeleteSalesDetail,
        isLoadingDeleteSalesDetail,
        handleDeleteSalesOrderWarranty,
        isLoadingDeleteSalesOrderWarranty,
        handleAddCreditTerm,
        handleAddEwtType,
        isLoadingSales,
        setToggleModalFormProfileAddress,
        customerAddress,
        setCustomerAddress,
        handleUpdateDateDue,
    } = useContext(PageFormSalesContext);

    // recalculate price per unit for all existing sales_details when customer type changes
    const handleCustomerTypeChange = (newCustomerType) => {
        let sales_details = form.getFieldValue("sales_details");
        let date_sales = form.getFieldValue("date_sales");
        let vat_type = form.getFieldValue("vat_type");

        if (!sales_details || sales_details.length === 0) return;

        const updated = sales_details.map((detail) => {
            if (!detail || !detail.product_detail_id) return detail;

            const product_detail = dataProductDetails.find(
                (p) => p.id === detail.product_detail_id,
            );
            if (!product_detail) return detail;

            const product_detail_price =
                product_detail.product_detail_prices.find(
                    (x) =>
                        x.start_date <= date_sales?.format("YYYY-MM-DD") &&
                        x.end_date >= date_sales?.format("YYYY-MM-DD"),
                );

            let price = 0;
            if (product_detail_price) {
                if (newCustomerType === "Dealer") {
                    price = Number(product_detail.dealers_price);
                } else if (newCustomerType === "Wholesale") {
                    price = Number(product_detail.wholesale_price);
                } else if (newCustomerType === "Walk-In") {
                    price = Number(product_detail.srp);
                } else if (newCustomerType === "Fleet") {
                    price = Number(product_detail.fleet_price);
                }
            }

            const quantity = detail.quantity ? Number(detail.quantity) : 1;
            const selling_price = price * quantity;
            let vat = 0;
            if (vat_type === "Vat") {
                vat = (selling_price / 1.12) * 0.12;
            }
            const gross_amount = selling_price - vat;

            return {
                ...detail,
                price,
                selling_price,
                vat,
                gross_amount,
            };
        });

        form.setFieldValue("sales_details", updated);
    };

    return (
        <Row gutter={[20, 20]}>
            <Col sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Card title="Release Item Information">
                    <Row gutter={[20, 0]}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Row gutter={[20, 0]}>
                                <Col
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={24}
                                    xl={24}
                                    xxl={24}
                                >
                                    <Form.Item
                                        name="customer_id"
                                        rules={[validateRules.required]}
                                    >
                                        <FloatSelect
                                            label="Customer"
                                            placeholder="Customer"
                                            required
                                            allowClear
                                            options={
                                                dataCustomers &&
                                                dataCustomers.data &&
                                                dataCustomers.data.length > 0
                                                    ? dataCustomers.data.map(
                                                          (item) => {
                                                              let label = [];

                                                              if (
                                                                  item.profile
                                                              ) {
                                                                  if (
                                                                      item
                                                                          .profile
                                                                          .firstname
                                                                  ) {
                                                                      label.push(
                                                                          `(${item.profile.firstname})`,
                                                                      );
                                                                  }
                                                                  if (
                                                                      item
                                                                          .profile
                                                                          .company &&
                                                                      item
                                                                          .profile
                                                                          .company
                                                                          .company
                                                                  ) {
                                                                      label.push(
                                                                          ` - ${item.profile.company.company}`,
                                                                      );
                                                                  }
                                                              }

                                                              return {
                                                                  value: item.id,
                                                                  label: label.join(
                                                                      "",
                                                                  ),
                                                              };
                                                          },
                                                      )
                                                    : []
                                            }
                                            onChange={(e) => {
                                                let customer =
                                                    dataCustomers.data.find(
                                                        (item) => item.id === e,
                                                    );

                                                let profile_address_id = null;
                                                let customer_type = null;
                                                let taxpayer_identification =
                                                    null;

                                                if (
                                                    customer &&
                                                    customer.profile
                                                ) {
                                                    customer_type =
                                                        customer.profile
                                                            .customer_type ??
                                                        "";

                                                    taxpayer_identification =
                                                        customer.profile
                                                            .taxpayer_identification ??
                                                        "";

                                                    setCustomerAddress(
                                                        customer.profile
                                                            .profile_addresses,
                                                    );

                                                    let profile_addresses =
                                                        customer.profile.profile_addresses.filter(
                                                            (x) =>
                                                                x.status === 1,
                                                        );

                                                    if (
                                                        profile_addresses.length >
                                                        0
                                                    ) {
                                                        profile_address_id =
                                                            profile_addresses[0]
                                                                .id ?? null;
                                                    }
                                                }

                                                form.setFieldsValue({
                                                    profile_address_id,
                                                    customer_type,
                                                    taxpayer_identification,
                                                });
                                            }}
                                            dropdownRender={(menu) => (
                                                <>
                                                    {menu}
                                                    <Divider
                                                        style={{
                                                            margin: "8px 0",
                                                        }}
                                                    />
                                                    <Flex
                                                        gap={10}
                                                        justify="flex-end"
                                                    >
                                                        <Button
                                                            type="primary"
                                                            className="b-r-none mb-10 mr-10"
                                                            icon={
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faPlus
                                                                    }
                                                                />
                                                            }
                                                            onClick={() =>
                                                                setToggleModalFormCustomer(
                                                                    {
                                                                        open: true,
                                                                        data: null,
                                                                    },
                                                                )
                                                            }
                                                            name="btn_add"
                                                        >
                                                            Add Customer
                                                        </Button>
                                                    </Flex>
                                                </>
                                            )}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={24}
                                    xl={24}
                                    xxl={24}
                                >
                                    <Form.Item shouldUpdate noStyle>
                                        {() => (
                                            <Form.Item
                                                name="customer_type"
                                                rules={[validateRules.required]}
                                            >
                                                <FloatSelect
                                                    label="Customer Type"
                                                    placeholder="Customer Type"
                                                    allowClear
                                                    options={[
                                                        {
                                                            value: "Walk-In",
                                                            label: "Walk-In",
                                                        },
                                                        {
                                                            value: "Dealer",
                                                            label: "Dealer",
                                                        },
                                                        {
                                                            value: "Wholesale",
                                                            label: "Wholesale",
                                                        },
                                                        {
                                                            value: "Fleet",
                                                            label: "Fleet",
                                                        },
                                                    ]}
                                                    disabled={
                                                        form.getFieldValue(
                                                            "customer_id",
                                                        )
                                                            ? false
                                                            : true
                                                    }
                                                    required
                                                    onChange={
                                                        handleCustomerTypeChange
                                                    }
                                                />
                                            </Form.Item>
                                        )}
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                    <Form.Item name="profile_address_id">
                                        <FloatSelect
                                            label="Address"
                                            placeholder="Address"
                                            options={customerAddress.map(
                                                (item) => ({
                                                    value: item.id,
                                                    label: item.address,
                                                }),
                                            )}
                                            dropdownRender={(menu) => (
                                                <>
                                                    {menu}
                                                    <Divider
                                                        style={{
                                                            margin: "8px 0",
                                                        }}
                                                    />
                                                    <Flex
                                                        gap={10}
                                                        justify="flex-end"
                                                    >
                                                        <Button
                                                            className="btn-main-primary btn-main-invert-outline b-r-none mb-10 mr-10"
                                                            icon={
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faPlus
                                                                    }
                                                                />
                                                            }
                                                            onClick={() => {
                                                                const customer_id =
                                                                    form.getFieldValue(
                                                                        "customer_id",
                                                                    );

                                                                if (
                                                                    customer_id
                                                                ) {
                                                                    const customer =
                                                                        dataCustomers?.data?.find(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item.id ===
                                                                                customer_id,
                                                                        );
                                                                    if (
                                                                        customer
                                                                    ) {
                                                                        setToggleModalFormProfileAddress(
                                                                            {
                                                                                open: true,
                                                                                data: customer,
                                                                            },
                                                                        );
                                                                    }
                                                                }
                                                            }}
                                                            name="btn_add"
                                                            disabled={
                                                                !form.getFieldValue(
                                                                    "customer_id",
                                                                )
                                                            }
                                                        >
                                                            Add Address
                                                        </Button>
                                                    </Flex>
                                                </>
                                            )}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={24}
                                    xl={24}
                                    xxl={24}
                                >
                                    <Form.Item name="taxpayer_identification">
                                        <FloatInput
                                            label="TIN"
                                            placeholder="TIN"
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>

                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Row gutter={[20, 0]}>
                                <Col
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={24}
                                    xl={24}
                                    xxl={24}
                                >
                                    <Form.Item
                                        name="date_sales"
                                        rules={[validateRules.required]}
                                    >
                                        <FloatDatePicker
                                            label="Date Release Item"
                                            placeholder="Date Release Item"
                                            required
                                            format="MM/DD/YYYY"
                                            onChange={(e) =>
                                                handleUpdateDateDue(
                                                    "date_sales",
                                                    e,
                                                )
                                            }
                                        />
                                    </Form.Item>
                                </Col>

                                <Col
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={12}
                                    xl={12}
                                    xxl={12}
                                >
                                    <Form.Item
                                        name="terms"
                                        rules={[validateRules.required]}
                                    >
                                        <FloatSelect
                                            label="Terms"
                                            placeholder="Terms"
                                            allowClear
                                            options={[
                                                {
                                                    value: "Cash",
                                                    label: "Cash",
                                                },
                                                {
                                                    value: "Credit",
                                                    label: "Credit",
                                                },
                                            ]}
                                            onChange={(e) =>
                                                handleUpdateDateDue("terms", e)
                                            }
                                            required
                                        />
                                    </Form.Item>
                                </Col>

                                <Form.Item shouldUpdate noStyle>
                                    {() => {
                                        let terms = form.getFieldValue("terms");

                                        if (terms === "Credit") {
                                            return (
                                                <Col
                                                    xs={24}
                                                    sm={24}
                                                    md={24}
                                                    lg={12}
                                                    xl={12}
                                                    xxl={12}
                                                >
                                                    <Form.Item name="credit_term_id">
                                                        <FloatSelect
                                                            label="Credit Term"
                                                            placeholder="Credit Term"
                                                            allowClear
                                                            options={dataCreditTerm
                                                                .sort(
                                                                    (a, b) =>
                                                                        a.id -
                                                                        b.id,
                                                                )
                                                                .map(
                                                                    (item) => ({
                                                                        value: item.id,
                                                                        label: item.credit_term,
                                                                    }),
                                                                )}
                                                            dropdownRender={(
                                                                menu,
                                                            ) => (
                                                                <>
                                                                    {menu}
                                                                    <Divider
                                                                        style={{
                                                                            margin: "8px 0",
                                                                        }}
                                                                    />
                                                                    <Flex
                                                                        gap={10}
                                                                    >
                                                                        <Input
                                                                            rules={[
                                                                                validateRules.number,
                                                                            ]}
                                                                            type="number"
                                                                            value={
                                                                                creditTermValue
                                                                            }
                                                                            placeholder="Add Credit Term"
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setCreditTermValue(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            onBlur={(
                                                                                e,
                                                                            ) =>
                                                                                setCreditTermValue(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            onPressEnter={
                                                                                handleAddCreditTerm
                                                                            }
                                                                        />
                                                                        <Button
                                                                            type="text"
                                                                            icon={
                                                                                <FontAwesomeIcon
                                                                                    icon={
                                                                                        faPlus
                                                                                    }
                                                                                />
                                                                            }
                                                                            onClick={
                                                                                handleAddCreditTerm
                                                                            }
                                                                        />
                                                                    </Flex>
                                                                </>
                                                            )}
                                                            onChange={(e) =>
                                                                handleUpdateDateDue(
                                                                    "credit_term_id",
                                                                    e,
                                                                )
                                                            }
                                                            disabled={
                                                                !form.getFieldValue(
                                                                    "date_sales",
                                                                )
                                                            }
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            );
                                        } else {
                                            return null;
                                        }
                                    }}
                                </Form.Item>

                                <Form.Item shouldUpdate noStyle>
                                    {() => {
                                        let terms = form.getFieldValue("terms");

                                        return (
                                            <Col
                                                xs={24}
                                                sm={24}
                                                md={
                                                    terms === "Credit" ? 24 : 12
                                                }
                                                lg={
                                                    terms === "Credit" ? 24 : 12
                                                }
                                                xl={
                                                    terms === "Credit" ? 24 : 12
                                                }
                                                xxl={
                                                    terms === "Credit" ? 24 : 12
                                                }
                                            >
                                                <Form.Item name="date_due">
                                                    <FloatDatePicker
                                                        label="Date Due"
                                                        placeholder="Date Due"
                                                        format="MM/DD/YYYY"
                                                        disabled
                                                    />
                                                </Form.Item>
                                            </Col>
                                        );
                                    }}
                                </Form.Item>

                                <Col
                                    xs={24}
                                    sm={24}
                                    md={12}
                                    lg={12}
                                    xl={12}
                                    xxl={12}
                                >
                                    <Form.Item
                                        name="vat_type"
                                        rules={[validateRules.required]}
                                    >
                                        <FloatSelect
                                            label="Vat Type"
                                            placeholder="Vat Type"
                                            allowClear
                                            options={[
                                                {
                                                    value: "Vat",
                                                    label: "Vat",
                                                },
                                                {
                                                    value: "Non-Vat",
                                                    label: "Non-Vat",
                                                },
                                            ]}
                                            required
                                            onChange={(e) => {
                                                let vat_type = e;

                                                let sales_details =
                                                    form.getFieldValue(
                                                        "sales_details",
                                                    );

                                                if (
                                                    sales_details &&
                                                    sales_details.length > 0
                                                ) {
                                                    sales_details =
                                                        sales_details
                                                            .filter((x) => x)
                                                            .map((item) => {
                                                                let price =
                                                                    item.price
                                                                        ? Number(
                                                                              item.price,
                                                                          )
                                                                        : 0;
                                                                let quantity =
                                                                    item.quantity
                                                                        ? Number(
                                                                              item.quantity,
                                                                          )
                                                                        : 0;
                                                                let total_selling_price =
                                                                    price *
                                                                    quantity;

                                                                let vat = 0;

                                                                if (
                                                                    vat_type ===
                                                                    "Vat"
                                                                ) {
                                                                    vat =
                                                                        (total_selling_price /
                                                                            1.12) *
                                                                        0.12;
                                                                }

                                                                let gross_amount =
                                                                    total_selling_price -
                                                                    vat;

                                                                return {
                                                                    ...item,
                                                                    total_selling_price:
                                                                        total_selling_price ??
                                                                        0,
                                                                    vat:
                                                                        vat ??
                                                                        0,
                                                                    gross_amount:
                                                                        gross_amount ??
                                                                        0,
                                                                };
                                                            });

                                                    form.setFieldValue(
                                                        "sales_details",
                                                        sales_details,
                                                    );
                                                }
                                            }}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col
                                    xs={24}
                                    sm={24}
                                    md={12}
                                    lg={12}
                                    xl={12}
                                    xxl={12}
                                >
                                    <Form.Item name="ewt_type_id">
                                        <FloatSelect
                                            label="EWT Type"
                                            placeholder="EWT Type"
                                            allowClear
                                            options={dataEwtType
                                                .sort((a, b) => a.id - b.id)
                                                .map((item) => ({
                                                    value: item.id,
                                                    label: `${item.ewt_type}%`,
                                                }))}
                                            dropdownRender={(menu) => (
                                                <>
                                                    {menu}
                                                    <Divider
                                                        style={{
                                                            margin: "8px 0",
                                                        }}
                                                    />
                                                    <Flex gap={10}>
                                                        <Input
                                                            value={ewtTypeValue}
                                                            placeholder="Add EWT Type"
                                                            onChange={(e) =>
                                                                setEwtTypeValue(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onBlur={(e) =>
                                                                setEwtTypeValue(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onPressEnter={() =>
                                                                handleAddEwtType()
                                                            }
                                                        />
                                                        <Button
                                                            type="text"
                                                            icon={
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faPlus
                                                                    }
                                                                />
                                                            }
                                                            onClick={() =>
                                                                handleAddEwtType()
                                                            }
                                                        />
                                                    </Flex>
                                                </>
                                            )}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={24}
                                    xl={24}
                                    xxl={24}
                                >
                                    <Form.Item
                                        name="invoice_no"
                                        rules={[validateRules.required]}
                                    >
                                        <FloatInput
                                            label="Invoice No"
                                            placeholder="Invoice No"
                                            allowClear
                                            required
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <SalesFormDetailContent
                    form={form}
                    dataSource={dataSource}
                    dataProductDetails={dataProductDetails}
                    handleDeleteSalesDetail={handleDeleteSalesDetail}
                    isLoadingDeleteSalesDetail={isLoadingDeleteSalesDetail}
                    handleDeleteSalesOrderWarranty={
                        handleDeleteSalesOrderWarranty
                    }
                    isLoadingDeleteSalesOrderWarranty={
                        isLoadingDeleteSalesOrderWarranty
                    }
                    dataEwtType={dataEwtType}
                />
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Button
                    htmlType="submit"
                    type="primary"
                    loading={isLoadingSales}
                >
                    Submit
                </Button>
            </Col>
        </Row>
    );
}
