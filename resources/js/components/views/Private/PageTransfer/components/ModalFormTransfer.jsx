import React, { useContext, useEffect } from "react";
import {
    Button,
    Col,
    Form,
    Modal,
    notification,
    Row,
    Flex,
    Popconfirm,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faTrash } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { POST } from "../../../../providers/useAxiosQuery";
import PageTransferContext from "./PageTransferContext";
import validateRules from "../../../../providers/validateRules";
import notificationErrors from "../../../../providers/notificationErrors";
import FloatDatePicker from "../../../../providers/FloatDatePicker";
import FloatSelect from "../../../../providers/FloatSelect";
import FloatInput from "../../../../providers/FloatInput";

export default function ModalFormTransfer() {
    const {
        toggleModalFormTransfer,
        setToggleModalFormTransfer,
        dataWareHouse,
        dataProductDetails,
        setProductDetailFilter,
        dataProductCategory,
        productCategoryFilter,
        setProductCategoryFilter,
    } = useContext(PageTransferContext);

    const [form] = Form.useForm();

    // console.log("productCategoryFilter: ", productCategoryFilter);

    const { mutate: mutateTransfer, isLoading: isLoadingTransfer } = POST(
        `api/transfers`,
        "transfer_list"
    );

    const generateReferenceNo = () => {
        const date = dayjs().format("MMDDYY");
        const sequence = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number
        return `${date}${sequence}`;
    };

    const onFinish = (values) => {
        let data = {
            ...values,
            reference_no: generateReferenceNo(),
            date_transfer: values.date_transfer?.format("YYYY-MM-DD"),
            id: toggleModalFormTransfer.data?.id ?? "",
        };

        mutateTransfer(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Transfer",
                        description: res.message,
                    });

                    form.resetFields();
                    setToggleModalFormTransfer({ open: false, data: null });
                } else {
                    notification.error({
                        message: "Transfer",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useEffect(() => {
        if (toggleModalFormTransfer.open) {
            let modalTransferData = toggleModalFormTransfer.data;

            let transferDetails =
                toggleModalFormTransfer &&
                toggleModalFormTransfer.data &&
                toggleModalFormTransfer.data.transfer_details;

            const productCategoryIds =
                transferDetails && transferDetails
                    ? transferDetails.map((item) => ({
                          product_detail_id: item.product_detail_id,
                          product_category_id:
                              item.product_detail?.product?.product_category_id,
                      }))
                    : [];

            form.setFieldsValue({
                ...toggleModalFormTransfer.data,
                date_transfer:
                    modalTransferData && modalTransferData.date_transfer
                        ? dayjs(toggleModalFormTransfer.data.date_transfer)
                        : null,
                transfer_details:
                    modalTransferData && modalTransferData.transfer_details
                        ? modalTransferData.transfer_details?.map((detail) => ({
                              ...detail,
                              product_category_id: productCategoryIds.find(
                                  (category) =>
                                      category.product_detail_id ===
                                      detail.product_detail_id
                              )?.product_category_id,
                          }))
                        : [],
            });

            // Set product category filter with unique IDs
            const uniqueCategoryIds = [
                ...new Set(
                    productCategoryIds
                        .map((item) => item.product_category_id)
                        .filter(Boolean) // Remove null/undefined
                ),
            ];

            setProductCategoryFilter({
                productCategoryIds: uniqueCategoryIds,
            });
        }
    }, [toggleModalFormTransfer, form, setProductCategoryFilter]);

    return (
        <Modal
            wrapClassName="modal-wrap-form-transfer"
            title="Form Transfer"
            open={toggleModalFormTransfer.open}
            onCancel={() => {
                form.resetFields();
                setToggleModalFormTransfer({
                    open: false,
                    data: null,
                });
            }}
            forceRender
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key="cancel"
                    onClick={() => {
                        form.resetFields();
                        setToggleModalFormTransfer({
                            open: false,
                            data: null,
                        });
                    }}
                    disabled={isLoadingTransfer}
                >
                    CANCEL
                </Button>,
                !toggleModalFormTransfer.disabled && (
                    <Button
                        className="btn-main-primary"
                        type="primary"
                        key="submit"
                        onClick={() => form.submit()}
                        loading={isLoadingTransfer}
                    >
                        SUBMIT
                    </Button>
                ),
            ]}
        >
            <Form
                form={form}
                onFinish={onFinish}
                initialValues={{
                    status: "Completed",
                    transfer_details: [
                        {
                            product_detail_id: null,
                            quantity: null,
                        },
                    ],
                }}
            >
                <Row gutter={[20, 0]}>
                    {toggleModalFormTransfer &&
                    toggleModalFormTransfer.data &&
                    toggleModalFormTransfer.data.id ? (
                        <Col xs={24} sm={24} md={24} lg={24}>
                            <Form.Item name="reference_no">
                                <FloatInput
                                    placeholder="Reference Number"
                                    label="Reference Number"
                                    disabled={true}
                                />
                            </Form.Item>
                        </Col>
                    ) : null}

                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item
                            name="from_warehouse_id"
                            rules={[validateRules.required()]}
                            disabled={toggleModalFormTransfer.disabled}
                        >
                            <FloatSelect
                                placeholder="From Warehouse"
                                label="From Warehouse"
                                required
                                options={
                                    dataWareHouse && dataWareHouse.data
                                        ? dataWareHouse.data.map((item) => ({
                                              label: item.warehouse_name,
                                              value: item.id,
                                          }))
                                        : []
                                }
                                onChange={(value) => {
                                    form.setFieldsValue({
                                        to_warehouse_id: null,
                                    });
                                    if (value) {
                                        setProductDetailFilter({
                                            from_warehouse_id: value,
                                        });
                                    } else {
                                        setProductDetailFilter({
                                            from_warehouse_id: null,
                                        });
                                    }
                                }}
                                disabled={toggleModalFormTransfer.disabled}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item shouldUpdate noStyle>
                            {() => {
                                let from_warehouse_id =
                                    form.getFieldValue("from_warehouse_id");

                                let dataOptions =
                                    dataWareHouse && dataWareHouse.data;
                                if (dataOptions) {
                                    dataOptions = dataOptions.filter(
                                        (x) =>
                                            x.id !== Number(from_warehouse_id)
                                    );
                                }

                                return (
                                    <Form.Item
                                        name="to_warehouse_id"
                                        rules={[validateRules.required()]}
                                    >
                                        <FloatSelect
                                            placeholder="To Warehouse"
                                            label="To Warehouse"
                                            required
                                            options={
                                                from_warehouse_id
                                                    ? dataOptions.map(
                                                          (item) => ({
                                                              label: item.warehouse_name,
                                                              value: item.id,
                                                          })
                                                      )
                                                    : []
                                            }
                                            disabled={
                                                toggleModalFormTransfer.disabled
                                            }
                                        />
                                    </Form.Item>
                                );
                            }}
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item
                            name="date_transfer"
                            rules={[validateRules.required()]}
                        >
                            <FloatDatePicker
                                label="Date Transfer"
                                placeholder="Date Transfer"
                                required
                                format={{
                                    type: "mask",
                                    format: "DD/MM/YYYY",
                                }}
                                disabled={toggleModalFormTransfer.disabled}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item shouldUpdate noStyle>
                            {() => {
                                let transfer_details =
                                    form.getFieldValue("transfer_details");
                                let transfer_detail_ids =
                                    transfer_details?.reduce((acc, item) => {
                                        if (item && item.product_detail_id) {
                                            acc.push(item.product_detail_id);
                                        }
                                        return acc;
                                    }, []);
                                let productDetails =
                                    dataProductDetails &&
                                    dataProductDetails.data
                                        ? dataProductDetails.data
                                        : [];

                                // console.log("productDetails: ", productDetails);

                                return (
                                    <Form.List name="transfer_details">
                                        {(fields, { add, remove }) => (
                                            <>
                                                {fields.map(
                                                    ({
                                                        key,
                                                        name,
                                                        ...restField
                                                    }) => {
                                                        return (
                                                            <Flex key={key}>
                                                                <Row
                                                                    gutter={[
                                                                        10, 0,
                                                                    ]}
                                                                    className="w-100"
                                                                >
                                                                    <Col
                                                                        xs={24}
                                                                        sm={24}
                                                                        md={6}
                                                                    >
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[
                                                                                name,
                                                                                "product_category_id",
                                                                            ]}
                                                                            // rules={[
                                                                            //     validateRules.required(),
                                                                            // ]}
                                                                        >
                                                                            <FloatSelect
                                                                                placeholder="Category"
                                                                                label="Category"
                                                                                allowClear
                                                                                options={
                                                                                    dataProductCategory &&
                                                                                    dataProductCategory.data
                                                                                        ? dataProductCategory.data
                                                                                              .map(
                                                                                                  (
                                                                                                      item
                                                                                                  ) => {
                                                                                                      // Count only products with available stock in the selected warehouse
                                                                                                      const count =
                                                                                                          productDetails.filter(
                                                                                                              (
                                                                                                                  detail
                                                                                                              ) =>
                                                                                                                  detail.product_category ===
                                                                                                                      item.product_category &&
                                                                                                                  (detail.total_stock ??
                                                                                                                      0) >
                                                                                                                      0
                                                                                                          ).length;
                                                                                                      return {
                                                                                                          label: `${item.product_category} (${count})`,
                                                                                                          value: item.id,
                                                                                                          count,
                                                                                                      };
                                                                                                  }
                                                                                              )
                                                                                              // Only show categories that have at least 1 product with available stock
                                                                                              .filter(
                                                                                                  (
                                                                                                      item
                                                                                                  ) =>
                                                                                                      item.count >
                                                                                                      0
                                                                                              )
                                                                                        : []
                                                                                }
                                                                                onChange={(
                                                                                    value
                                                                                ) => {
                                                                                    setProductCategoryFilter(
                                                                                        {
                                                                                            product_category:
                                                                                                value,
                                                                                        }
                                                                                    );
                                                                                }}
                                                                                disabled={
                                                                                    toggleModalFormTransfer.disabled ||
                                                                                    !form.getFieldValue(
                                                                                        "from_warehouse_id"
                                                                                    )
                                                                                }
                                                                            />
                                                                        </Form.Item>
                                                                    </Col>

                                                                    <Col
                                                                        xs={24}
                                                                        sm={24}
                                                                        md={14}
                                                                    >
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[
                                                                                name,
                                                                                "product_detail_id",
                                                                            ]}
                                                                            rules={[
                                                                                validateRules.required(),
                                                                            ]}
                                                                        >
                                                                            <FloatSelect
                                                                                label="Product"
                                                                                placeholder="Product"
                                                                                required
                                                                                allowClear
                                                                                options={productDetails
                                                                                    // Filter by selected category
                                                                                    .filter(
                                                                                        (
                                                                                            item
                                                                                        ) =>
                                                                                            productCategoryFilter?.product_category
                                                                                                ? item.product_category_id ===
                                                                                                  productCategoryFilter.product_category
                                                                                                : true
                                                                                    )
                                                                                    // Only show products with available stock in the selected warehouse
                                                                                    .filter(
                                                                                        (
                                                                                            item
                                                                                        ) =>
                                                                                            (item.total_stock ??
                                                                                                0) >
                                                                                            0
                                                                                    )
                                                                                    .map(
                                                                                        (
                                                                                            item
                                                                                        ) => ({
                                                                                            value: item.id,
                                                                                            // Show product name with warehouse stock quantity
                                                                                            label: `${
                                                                                                item.product_name
                                                                                            } - ${
                                                                                                item.product_type ||
                                                                                                ""
                                                                                            } (${
                                                                                                item.product_size ||
                                                                                                ""
                                                                                            }) [Stock: ${
                                                                                                item.total_stock ??
                                                                                                0
                                                                                            }]`,
                                                                                            disabled:
                                                                                                transfer_detail_ids.includes(
                                                                                                    item.id
                                                                                                ),
                                                                                        })
                                                                                    )}
                                                                                disabled={
                                                                                    toggleModalFormTransfer.disabled ||
                                                                                    !form.getFieldValue(
                                                                                        "from_warehouse_id"
                                                                                    )
                                                                                }
                                                                            />
                                                                        </Form.Item>
                                                                    </Col>

                                                                    <Col
                                                                        xs={24}
                                                                        sm={24}
                                                                        md={4}
                                                                    >
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[
                                                                                name,
                                                                                "quantity",
                                                                            ]}
                                                                            rules={[
                                                                                validateRules.required(),
                                                                                {
                                                                                    validator:
                                                                                        (
                                                                                            _,
                                                                                            value
                                                                                        ) => {
                                                                                            let product_detail_id =
                                                                                                transfer_details[
                                                                                                    name
                                                                                                ]
                                                                                                    ?.product_detail_id;

                                                                                            let productDetail =
                                                                                                productDetails.find(
                                                                                                    (
                                                                                                        item
                                                                                                    ) =>
                                                                                                        item.id ===
                                                                                                        product_detail_id
                                                                                                );

                                                                                            if (
                                                                                                value <=
                                                                                                productDetail.total_stock
                                                                                            ) {
                                                                                                return Promise.resolve();
                                                                                            } else {
                                                                                                return Promise.reject(
                                                                                                    `Total stock: ${productDetail.total_stock}`
                                                                                                );
                                                                                            }
                                                                                        },
                                                                                },
                                                                            ]}
                                                                        >
                                                                            <FloatInput
                                                                                label="Quantity"
                                                                                placeholder="Quantity"
                                                                                type="number"
                                                                                required
                                                                                disabled={
                                                                                    toggleModalFormTransfer.disabled ||
                                                                                    !form.getFieldValue(
                                                                                        "from_warehouse_id"
                                                                                    )
                                                                                }
                                                                            />
                                                                        </Form.Item>
                                                                    </Col>
                                                                </Row>

                                                                {fields.length >
                                                                    1 && (
                                                                    <Flex
                                                                        align="center"
                                                                        justify="center"
                                                                        style={{
                                                                            height: 40,
                                                                            width: 40,
                                                                        }}
                                                                    >
                                                                        <Popconfirm
                                                                            title="Are you sure you want to remove this product?"
                                                                            onConfirm={() =>
                                                                                remove(
                                                                                    name
                                                                                )
                                                                            }
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
                                                                                disabled={
                                                                                    toggleModalFormTransfer.disabled
                                                                                }
                                                                            />
                                                                        </Popconfirm>
                                                                    </Flex>
                                                                )}
                                                            </Flex>
                                                        );
                                                    }
                                                )}

                                                {!toggleModalFormTransfer.disabled && (
                                                    <Button
                                                        className="btn-main-primary mb-20"
                                                        onClick={() => add()}
                                                        icon={
                                                            <FontAwesomeIcon
                                                                icon={faAdd}
                                                            />
                                                        }
                                                    >
                                                        Add Product
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </Form.List>
                                );
                            }}
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item
                            name="status"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                placeholder="Status"
                                label="Status"
                                required
                                options={[
                                    { label: "Pending", value: "Pending" },
                                    { label: "Completed", value: "Completed" },
                                    { label: "Canceled", value: "Canceled" },
                                ]}
                                disabled={toggleModalFormTransfer.disabled}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
