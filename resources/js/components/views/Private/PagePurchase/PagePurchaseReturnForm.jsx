import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Col, Form, notification, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { GET, POST } from "../../../providers/useAxiosQuery";
import PagePurchaseContext from "./components/PagePurchaseContext";
import PagePurchaseReturnFormContent from "./components/PagePurchaseReturnFormContent";
import notificationErrors from "../../../providers/notificationErrors";

export default function PagePurchaseReturnForm() {
    const navigate = useNavigate();

    const params = useParams();

    const [form] = Form.useForm();

    const [dataPurchaseInfo, setdataPurchaseInfo] = useState(null);
    const [hasPendingReturn, setHasPendingReturn] = useState(false);

    // Fixed: removed conditional `if` — GET wraps useQuery which is a hook and must not
    // be called conditionally. Use the `enabled` parameter to gate the actual fetch.
    GET(
        `api/purchase_return/${params.id}`,
        `purchase_return_edit${params.id}`,
        (res) => {
            if (res.data) {
                let data = res.data;

                let suppliier_name = [];

                if (data.purchase?.supplier?.profile?.firstname) {
                    suppliier_name.push(
                        data.purchase.supplier?.profile?.firstname,
                    );
                }

                if (data.purchase?.supplier?.profile?.lastname) {
                    suppliier_name.push(
                        data.purchase.supplier?.profile?.lastname,
                    );
                }

                let dataCopy = {
                    ...data,
                    suppliier_name: suppliier_name.join(" "),
                    date_return: data.date_return
                        ? dayjs(data.date_return)
                        : null,
                    purchase_return_details:
                        data.purchase_return_details.map((item) => {
                            let product_detail = item.product_detail;

                            return {
                                id: item.id,
                                purchase_detail_id: item.purchase_detail_id,
                                product_detail_id: item.product_detail_id,
                                purchase_quantity: Number(
                                    item.purchase_detail.quantity,
                                ),
                                // Updated: now populated by the show endpoint
                                available_quantity: item.available_quantity,
                                return_history: item.return_history ?? [],
                                return_quantity: Number(item.quantity),
                                product_info: product_detail,
                                cost: Number(item.purchase_detail.cost),
                                total_cost:
                                    Number(item.purchase_detail.cost) *
                                    Number(item.quantity),
                            };
                        }),
                };

                form.setFieldsValue(dataCopy);

                setdataPurchaseInfo(dataCopy);
            }
        },
        false,
        !!(params && params.id), // enabled only when editing
    );

    const { data: dataPurchase } = GET(
        `api/purchases`,
        "purchase_dropdown",
        () => {},
        false,
    );

    const { mutate: mutatePurchaseReturn, isLoading: isLoadingPurchaseReturn } =
        POST(`api/purchase_return`, "purchase_info");

    const onFinish = (values) => {
        const hasAnyReturnQty = values.purchase_return_details?.some(
            (item) => item.return_quantity && Number(item.return_quantity) > 0,
        );

        if (!hasAnyReturnQty) {
            notification.warning({
                message: "Purchase Order Return",
                description:
                    "Please enter a return quantity for at least one product.",
            });
            return;
        }

        let data = {
            ...values,
            id: params && params.id ? params.id : null,
            purchase_id: values.purchase_id,
            date_return: dayjs(values.date_return).format("YYYY-MM-DD"),
        };

        mutatePurchaseReturn(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Purchase Order Return",
                        description: res.message,
                    });

                    navigate("/purchase-order?tab=return");
                } else {
                    notification.warning({
                        message: "Purchase Order Return",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const { mutate: mutatePurchaseInfo, isLoading: isLoadingPurchaseInfo } =
        POST(`api/purchase_info`, "purchase_info");

    const handlePurchaseInfo = (value) => {
        let data = dataPurchase.data.find((item) => item.id === value);

        mutatePurchaseInfo(data, {
            onSuccess: (res) => {
                if (res.success) {
                    let data = res.data;

                    let suppliier_name = "";

                    if (data.supplier?.profile?.firstname) {
                        suppliier_name += data.supplier?.profile?.firstname;
                    }

                    if (data.supplier?.profile?.lastname) {
                        if (suppliier_name) {
                            suppliier_name += " ";
                        }
                        suppliier_name += data.supplier?.profile?.lastname;
                    }

                    setHasPendingReturn(data.has_pending_return ?? false);

                    form.setFieldsValue({
                        suppliier_name: suppliier_name,
                        purchase_id: data.id,
                        warehouse_id: data.warehouse_id,
                        purchase_return_details: data.purchase_details.map(
                            (item) => {
                                let product_detail = item.product_detail;

                                return {
                                    purchase_detail_id: item.id,
                                    product_detail_id: item.product_detail_id,
                                    purchase_quantity: item.quantity,
                                    available_quantity: item.available_quantity,
                                    return_history: item.return_history ?? [],
                                    return_quantity: null,
                                    product_info: product_detail,
                                    cost: item.cost,
                                    total_cost: null,
                                };
                            },
                        ),
                    });
                } else {
                    notification.warning({
                        message: "Purchase Order Return",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    return (
        <PagePurchaseContext.Provider
            value={{
                form,
                dataPurchase,
                handlePurchaseInfo,
                isLoadingPurchaseInfo,
                dataPurchaseInfo,
                isLoadingPurchaseReturn,
                hasPendingReturn,
            }}
        >
            <Row gutter={[20, 20]}>
                <Col sm={24} md={24} lg={24} xl={24} xxl={24}>
                    <Button
                        className="btn-main-invert-outline b-r-none"
                        icon={<FontAwesomeIcon icon={faArrowLeft} />}
                        onClick={() => navigate(-1)}
                    >
                        Back to list
                    </Button>
                </Col>
                <Col sm={24} md={24} lg={24} xl={24} xxl={24}>
                    <Form
                        form={form}
                        onFinish={onFinish}
                        initialValues={{
                            status: "Completed",
                        }}
                    >
                        <PagePurchaseReturnFormContent />
                    </Form>
                </Col>
            </Row>
        </PagePurchaseContext.Provider>
    );
}
