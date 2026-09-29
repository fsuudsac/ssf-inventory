import { useContext } from "react";
import { Button, Card, Col, Divider, Flex, Form, Input, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import dayjs from "dayjs";
import PagePurchaseContext from "./PagePurchaseContext";
import PurchaseFormDetailContent from "./PurchaseFormDetailContent";
import FloatSelect from "../../../../providers/FloatSelect";
import FloatInput from "../../../../providers/FloatInput";
import FloatDatePicker from "../../../../providers/FloatDatePicker";
import validateRules from "../../../../providers/validateRules";

export default function PagePurchaseFormContent() {
    const {
        form,
        dataWarehouse,
        dataSupplier,
        dataProductDetails,
        dataCreditTerm,
        dataEwtType,
        ewtTypeValue,
        creditTermValue,
        setCreditTermValue,
        setEwtTypeValue,
        handleAddEwtType,
        handleChangeQuantity,
        handleAddCreditTerm,
        supplierAddress,
        setSupplierAddress,
        setToggleModalFormProfileAddress,
        handleDeletePurchaseDetail,
        isLoadingDeletePurchaseDetail,
        isLoadingEwtType,
        isLoadingPurchase,
        location,
        handleUpdateDateDue,
        handleUpdatePurchaseDetails,
    } = useContext(PagePurchaseContext);

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Card title="Purchase Order Information">
                    <Row gutter={[20, 0]}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Row gutter={[20, 0]}>
                                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                    <Form.Item
                                        name="warehouse_id"
                                        rules={[validateRules.required]}
                                    >
                                        <FloatSelect
                                            label="Warehouse"
                                            placeholder="Warehouse"
                                            required
                                            options={
                                                dataWarehouse &&
                                                dataWarehouse.data
                                                    ? dataWarehouse.data.map(
                                                          (item) => ({
                                                              label: item.warehouse_name,
                                                              value: item.id,
                                                          }),
                                                      )
                                                    : []
                                            }
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                    <Form.Item
                                        name="supplier_id"
                                        rules={[validateRules.required]}
                                    >
                                        <FloatSelect
                                            label="Supplier"
                                            placeholder="Supplier"
                                            required
                                            options={
                                                dataSupplier &&
                                                dataSupplier.data
                                                    ? dataSupplier.data.map(
                                                          (item) => ({
                                                              label: item.fullname,
                                                              value: item.id,
                                                          }),
                                                      )
                                                    : []
                                            }
                                            onChange={(e) => {
                                                let supplier =
                                                    dataSupplier.data.find(
                                                        (item) => item.id === e,
                                                    );

                                                if (
                                                    supplier &&
                                                    supplier.profile
                                                ) {
                                                    let taxpayer_identification =
                                                        supplier.profile
                                                            .taxpayer_identification ??
                                                        "";

                                                    setSupplierAddress(
                                                        supplier.profile
                                                            .profile_addresses,
                                                    );

                                                    let profile_addresses =
                                                        supplier.profile.profile_addresses.filter(
                                                            (x) =>
                                                                x.status === 1,
                                                        );

                                                    if (
                                                        profile_addresses.length >
                                                        0
                                                    ) {
                                                        form.setFieldsValue({
                                                            profile_address_id:
                                                                profile_addresses[0]
                                                                    .id,
                                                            taxpayer_identification,
                                                        });
                                                    }
                                                }
                                            }}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                    <Form.Item name="profile_address_id">
                                        <FloatSelect
                                            label="Address"
                                            placeholder="Address"
                                            // required
                                            options={supplierAddress.map(
                                                (item) => ({
                                                    label:
                                                        item.address +
                                                        " (" +
                                                        item.type +
                                                        ")",
                                                    value: item.id,
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
                                                                const supplier_id =
                                                                    form.getFieldValue(
                                                                        "supplier_id",
                                                                    );

                                                                if (
                                                                    supplier_id
                                                                ) {
                                                                    const supplier =
                                                                        dataSupplier?.data?.find(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item.id ===
                                                                                supplier_id,
                                                                        );

                                                                    if (
                                                                        supplier
                                                                    ) {
                                                                        setToggleModalFormProfileAddress(
                                                                            {
                                                                                open: true,
                                                                                data: supplier,
                                                                            },
                                                                        );
                                                                    }
                                                                }
                                                            }}
                                                            name="btn_add"
                                                            disabled={
                                                                !form.getFieldValue(
                                                                    "supplier_id",
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

                                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                    <Form.Item name="taxpayer_identification">
                                        <FloatInput
                                            label="TIN"
                                            placeholder="TIN"
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
                                        name="date_purchased"
                                        rules={[validateRules.required]}
                                    >
                                        <FloatDatePicker
                                            label="Date Purchased Order"
                                            placeholder="Date Purchased Order"
                                            format="MM/DD/YYYY"
                                            disabledDate={(current) =>
                                                current.isBefore(
                                                    dayjs().subtract(1, "days"),
                                                )
                                            }
                                            required
                                            onChange={(date) => {
                                                handleUpdateDateDue(
                                                    "date_purchased",
                                                    date,
                                                );

                                                handleUpdatePurchaseDetails(
                                                    date,
                                                );
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
                                                                            placeholder="Add CreditTerm"
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
                                                                    "date_purchased",
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
                                                        label="Due Date"
                                                        placeholder="Due Date"
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
                                            required
                                            options={[
                                                {
                                                    label: "Vat",
                                                    value: "Vat",
                                                },
                                                {
                                                    label: "Non-Vat",
                                                    value: "Non-Vat",
                                                },
                                            ]}
                                            onChange={(e) => {
                                                let vat_type = e;

                                                let purchase_details =
                                                    form.getFieldValue(
                                                        "purchase_details",
                                                    );

                                                if (
                                                    purchase_details &&
                                                    purchase_details.length > 0
                                                ) {
                                                    purchase_details =
                                                        purchase_details
                                                            .filter((x) => x)
                                                            .map((item) => {
                                                                let cost =
                                                                    item.cost
                                                                        ? Number(
                                                                              item.cost,
                                                                          )
                                                                        : 0;
                                                                let quantity =
                                                                    item.quantity
                                                                        ? Number(
                                                                              item.quantity,
                                                                          )
                                                                        : 0;
                                                                let total_cost =
                                                                    cost *
                                                                    quantity;

                                                                let vat = 0;

                                                                if (
                                                                    vat_type ===
                                                                    "Vat"
                                                                ) {
                                                                    vat =
                                                                        (total_cost /
                                                                            1.12) *
                                                                        0.12;
                                                                }

                                                                let gross_amount =
                                                                    total_cost -
                                                                    vat;

                                                                return {
                                                                    ...item,
                                                                    total_cost:
                                                                        total_cost ??
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
                                                        "purchase_details",
                                                        purchase_details,
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
                                            options={dataEwtType.map(
                                                (item) => ({
                                                    label: `${item.ewt_type}%`,
                                                    value: item.id,
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
                                                            disabled={
                                                                isLoadingEwtType
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
                                                            disabled={
                                                                isLoadingEwtType
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
                                            label="Invoice No."
                                            placeholder="Invoice No."
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
                <PurchaseFormDetailContent
                    form={form}
                    dataProductDetails={dataProductDetails}
                    handleChangeQuantity={handleChangeQuantity}
                    handleDeletePurchaseDetail={handleDeletePurchaseDetail}
                    isLoadingDeletePurchaseDetail={
                        isLoadingDeletePurchaseDetail
                    }
                    location={location}
                    dataEwtType={dataEwtType}
                />
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Button
                    htmlType="submit"
                    type="primary"
                    loading={isLoadingPurchase}
                >
                    Submit
                </Button>
            </Col>
        </Row>
    );
}
