import { useEffect } from "react";
import { Modal, Button, Form, notification, Col, Row, Divider } from "antd";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import FloatDatePicker from "../../../../providers/FloatDatePicker";
import FloatInput from "../../../../providers/FloatInput";
import FloatSelect from "../../../../providers/FloatSelect";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/pro-regular-svg-icons";
import FloatInputNumber from "../../../../providers/FloatInputNumber";

export default function ModalPurchase(props) {
    const {
        toggleModalFormPurchase,
        setToggleModalFormPurchase,
        dataProduct,
        dataSupplier,
        dataWarehouse,
        dataCategories,
    } = props;

    const [form] = Form.useForm();

    const { mutate: mutatePurchase, isLoading: isLoadingPurchase } = POST(
        `api/purchase-order`,
        "category_purchase_list",
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            date_purchased: values.date_purchased
                ? dayjs(values.date_purchased).format("YYYY-MM-DD")
                : null,

            date_returned: values.date_returned
                ? dayjs(values.date_returned).format("YYYY-MM-DD")
                : null,

            discount: values.discount ? values.discount : null,

            id:
                toggleModalFormPurchase.data && toggleModalFormPurchase.data.id
                    ? toggleModalFormPurchase.data.id
                    : "",
            category_id: toggleModalFormPurchase.data
                ? values.category_id
                : toggleModalFormPurchase.category_id,
            purchase_details: values.purchase_details.map((item) => ({
                ...item,
                id: item.id ? item.id : "",
            })),
        };

        mutatePurchase(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Purchase Order Added",
                        description: res.message,
                    });

                    setToggleModalFormPurchase({
                        open: false,
                        data: null,
                        category_id: null,
                    });

                    form.resetFields();
                } else {
                    notification.error({
                        message: "Something went wrong",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notification.error({
                    message: "Purchase Order not Added",
                    description: "Something went Wrong",
                });
            },
        });
    };

    useEffect(() => {
        if (toggleModalFormPurchase.open) {
            console.log(
                "toggleModalFormPurchase",
                toggleModalFormPurchase.data,
            );
            form.setFieldsValue({
                ...toggleModalFormPurchase.data,
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormPurchase]);

    return (
        <Modal
            className="modal-add-purchase"
            width="1000px"
            title="Add Purchase Order"
            open={toggleModalFormPurchase.open}
            onCancel={() => {
                setToggleModalFormPurchase({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalFormPurchase({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                    disabled={isLoadingPurchase}
                >
                    CANCEL
                </Button>,
                <Button
                    className="btn-main-primary"
                    type="primary"
                    key={2}
                    onClick={(values) => form.submit(values)}
                    loading={isLoadingPurchase}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form
                form={form}
                onFinish={onFinish}
                initialValues={{
                    purchase_details: [{}],
                }}
            >
                <Row gutter={[12, 0]}>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item
                            name="type"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="Type"
                                placeholder="Type"
                                required
                                options={[
                                    {
                                        value: "Purchase Order",
                                        label: "Purchase Order",
                                    },
                                    {
                                        value: "Purchase Order Return",
                                        label: "Purchase Order Return",
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>

                    <Form.Item shouldUpdate noStyle>
                        {() => {
                            let type = form.getFieldValue("type");

                            if (type === "Purchase Order") {
                                return (
                                    <Col
                                        xs={24}
                                        sm={24}
                                        md={24}
                                        lg={12}
                                        xl={12}
                                        xxl={12}
                                        className="date-purchased"
                                    >
                                        <Form.Item
                                            name="date_purchased"
                                            rules={[validateRules.required()]}
                                        >
                                            <FloatDatePicker
                                                label="Date Purchased Order"
                                                placeholder="Date Purchased Order"
                                                required
                                            />
                                        </Form.Item>
                                    </Col>
                                );
                            } else if (type === "Purchase Order Return") {
                                return (
                                    <Col
                                        xs={24}
                                        sm={24}
                                        md={24}
                                        lg={12}
                                        xl={12}
                                        xxl={12}
                                        className="date-returned"
                                    >
                                        <Form.Item
                                            name="date_returned"
                                            rules={[validateRules.required()]}
                                        >
                                            <FloatDatePicker
                                                label="Date Returned"
                                                placeholder="Date Returned"
                                                required
                                            />
                                        </Form.Item>
                                    </Col>
                                );
                            }
                        }}
                    </Form.Item>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item
                            name="warehouse_id"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="Warehouse"
                                placeholder="Warehouse"
                                required
                                options={
                                    dataWarehouse && dataWarehouse.data
                                        ? dataWarehouse.data.map((item) => ({
                                              value: item.id,
                                              label: item.warehouse_name,
                                          }))
                                        : []
                                }
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item
                            name="supplier_id"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="Supplier"
                                placeholder="Supplier"
                                required
                                options={
                                    dataSupplier && dataSupplier.data
                                        ? dataSupplier.data.map((item) => ({
                                              value: item.id,
                                              label: item.username,
                                          }))
                                        : []
                                }
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item
                            name="tracking_number"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput
                                label="Tracking Number"
                                placeholder="Tracking Number"
                                required
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item
                            name="credit_terms"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput
                                label="Credit Terms"
                                placeholder="Credit Terms"
                                required
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item name="discount">
                            <FloatInputNumber
                                step="0.00"
                                label="Total Discount"
                                placeholder="Total Discount"
                                // required
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item
                            name="paid_status"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="Paid Status"
                                placeholder="Paid Status"
                                required
                                options={[
                                    { value: "Paid", label: "Paid" },
                                    {
                                        value: "Partially Paid",
                                        label: "Partially Paid",
                                    },
                                    { value: "Not Paid", label: "Not Paid" },
                                ]}
                            />
                        </Form.Item>
                    </Col>

                    {toggleModalFormPurchase.data ? (
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                            <Form.Item
                                name="category_id"
                                rules={[validateRules.required()]}
                            >
                                <FloatSelect
                                    label="Category"
                                    placeholder="Category"
                                    required
                                    options={dataCategories}
                                />
                            </Form.Item>
                        </Col>
                    ) : null}

                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                        <Divider orientation="left">
                            Purchase Order Details
                        </Divider>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                        <Form.List name="purchase_details">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(
                                        ({ key, name, ...restField }) => (
                                            <Row key={key} gutter={[12, 0]}>
                                                <Col
                                                    xs={24}
                                                    sm={24}
                                                    md={24}
                                                    lg={24}
                                                    xl={24}
                                                    xxl={24}
                                                    className="text-right"
                                                >
                                                    <Button
                                                        className="btn-main-primary p-0 w-0 h-0"
                                                        onClick={() =>
                                                            remove(name)
                                                        }
                                                        type="link"
                                                        icon={
                                                            <FontAwesomeIcon
                                                                icon={faTrash}
                                                            />
                                                        }
                                                    />
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
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            "product_id",
                                                        ]}
                                                        rules={[
                                                            validateRules.required(),
                                                        ]}
                                                    >
                                                        <FloatSelect
                                                            label="Product"
                                                            placeholder="Product"
                                                            required
                                                            options={
                                                                dataProduct &&
                                                                dataProduct.data
                                                                    ? dataProduct.data.map(
                                                                          (
                                                                              item,
                                                                          ) => ({
                                                                              value: item.id,
                                                                              label: item.product_name,
                                                                          }),
                                                                      )
                                                                    : []
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
                                                        {...restField}
                                                        name={[
                                                            name,
                                                            "quantity",
                                                        ]}
                                                        rules={[
                                                            validateRules.required(),
                                                        ]}
                                                    >
                                                        <FloatInput
                                                            label="Quantity"
                                                            placeholder="Quantity"
                                                            required
                                                            type="number"
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
                                                        {...restField}
                                                        name={[name, "cost"]}
                                                        rules={[
                                                            validateRules.required(),
                                                        ]}
                                                    >
                                                        <FloatInput
                                                            label="Cost"
                                                            placeholder="Cost"
                                                            required
                                                            type="number"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        ),
                                    )}

                                    <Button
                                        className="btn-main-primary p-0 w-0 h-0"
                                        onClick={() => add()}
                                        type="link"
                                        icon={<FontAwesomeIcon icon={faPlus} />}
                                    >
                                        Add New
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
