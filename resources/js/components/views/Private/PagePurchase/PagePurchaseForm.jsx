import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, Col, Form, notification, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { GET, POST } from "../../../providers/useAxiosQuery";
import notificationErrors from "../../../providers/notificationErrors";
import PagePurchaseContext from "./components/PagePurchaseContext";
import PagePurchaseFormContent from "./components/PagePurchaseFormContent";
import ModalFormProfileAddress from "./components/ModalFormProfileAddress";

export default function PagePurchaseForm() {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [form] = Form.useForm();

    const [ewtTypeValue, setEwtTypeValue] = useState(null);
    const [dataEwtType, setDataEwtType] = useState([]);
    const [dataCreditTerm, setDataCreditTerm] = useState([]);
    const [dataSource, setDataSource] = useState(null);
    const [supplierAddress, setSupplierAddress] = useState([]);
    const [creditTermValue, setCreditTermValue] = useState(null);

    const [toggleModalFormProfileAddress, setToggleModalFormProfileAddress] =
        useState({
            open: false,
            data: null,
        });

    GET(
        `api/ewt_type`,
        "ewt_type_dropdown",
        (res) => {
            if (res.data) {
                setDataEwtType(res.data);
            }
        },
        false,
    );

    GET(
        `api/credit_term`,
        "credit_term_dropdown",
        (res) => {
            if (res.data && res.data.length > 0) {
                setDataCreditTerm(res.data);
            }
        },
        false,
    );

    const { data: dataWarehouse } = GET(
        `api/warehouse`,
        "warehouse_dropdown",
        () => {},
        false,
    );
    const { data: dataSupplier, refetch: refetchDataSupplier } = GET(
        `api/users?roles=Supplier`,
        "users_supplier_dropdown",
        (res) => {},
        false,
    );

    const { data: dataProductDetails } = GET(
        `api/product_details`,
        "product_details_dropdown",
        () => {},
        false,
    );

    if (params && params.id) {
        GET(
            `api/purchases/${params.id}`,
            `purchases_edit`,
            (res) => {
                if (res.data) {
                    let data = res.data;

                    setDataSource(data);

                    let taxpayer_identification = "";

                    if (data.supplier) {
                        let supplier = data.supplier;

                        if (supplier.profile) {
                            taxpayer_identification =
                                supplier.profile.taxpayer_identification ?? "";

                            let profile_addresses =
                                supplier.profile.profile_addresses;

                            setSupplierAddress(profile_addresses);
                        }
                    }

                    let purchase_details = data.purchase_details.map(
                        (item) => ({
                            ...item,
                            product_type:
                                item?.product_detail?.product_type
                                    ?.product_type,
                            product_size:
                                item?.product_detail?.product_size
                                    ?.product_size,
                        }),
                    );

                    form.setFieldsValue({
                        ...data,
                        date_purchased: data.date_purchased
                            ? dayjs(data.date_purchased)
                            : null,
                        date_due: data.date_due ? dayjs(data.date_due) : null,
                        credit_term_id: data.credit_term_id
                            ? data.credit_term_id
                            : "",
                        purchase_details: purchase_details.length
                            ? purchase_details
                            : [{}],
                        total_discount: data.discount,
                        taxpayer_identification,
                    });
                }
            },
            false,
        );
    }

    const { mutate: mutatePurchase, isLoading: isLoadingPurchase } = POST(
        `api/purchases`,
        "purchase_create",
    );

    const onFinish = (values) => {
        let purchase_details = values.purchase_details;
        let vat_type = values.vat_type;
        let ewt_type = 0;
        let ewt_type_id = values.ewt_type_id;
        let findEwtType = dataEwtType.find((x) => x.id === ewt_type_id);

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
            purchase_details.forEach((item) => {
                let cost = item.cost ? Number(item.cost) : 0;
                let quantity = item.quantity ? Number(item.quantity) : 0;
                let sub_total_cost = cost * quantity;

                let vat = 0;

                if (vat_type === "Vat" && sub_total_cost) {
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

        let total_withholding_tax = total_gross_amount * (ewt_type / 100);
        let total_amount_due = total_amount_payable - total_withholding_tax;

        let total_net_amount_due =
            total_amount_due -
            (values.total_discount ? Number(values.total_discount) : 0);

        let type = "";

        let pathname = location.pathname.split("/")[2];

        if (
            [
                "add-purchase-order-return",
                "edit-purchase-order-return",
            ].includes(pathname)
        ) {
            type = "Purchase Order Return";
        } else if (["add-purchase", "edit-purchase"].includes(pathname)) {
            type = "Purchase Order";
        }

        let data = {
            ...values,
            id: params.id,
            credit_term_id: values.credit_term_id ? values.credit_term_id : "",
            date_purchased: values.date_purchased
                ? dayjs(values.date_purchased).format("YYYY-MM-DD")
                : "",
            date_due: values.date_due
                ? dayjs(values.date_due).format("YYYY-MM-DD")
                : "",
            total_gross_amount,
            total_value_added_tax,
            total_amount_payable,
            total_withholding_tax,
            total_amount_due,
            total_discount: values.total_discount,
            total_net_amount_due,
            type,
        };

        mutatePurchase(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Purchase Order",
                        description: res.message,
                    });

                    if (params && !params.id) {
                        navigate("/purchase-order");
                    }
                } else {
                    notification.warning({
                        message: "Purchase Order",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    // EWT Type
    const { mutate: mutateEwtType, isLoading: isLoadingEwtType } = POST(
        `api/ewt_type`,
        "ewt_type_create",
    );

    const handleAddEwtType = () => {
        let data = { ewt_type: ewtTypeValue };

        mutateEwtType(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setEwtTypeValue(null);
                    setDataEwtType((prev) => [...prev, res.data]);
                    form.setFieldValue("ewt_type_id", res.data.id);

                    notification.success({
                        message: "EWT Type",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "EWT Type",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    // CreditTerm

    const { mutate: mutateCreditTerm, isLoading: isLoadingCreditTerm } = POST(
        `api/credit_term`,
        "credit_term_create",
    );

    const handleAddCreditTerm = () => {
        let data = { credit_term: creditTermValue };

        mutateCreditTerm(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setCreditTermValue(null);
                    setDataCreditTerm((prev) => [...prev, res.data]);
                    form.setFieldValue("credit_term_id", res.data.id);

                    notification.success({
                        message: "Credit Term",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Credit Term",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const {
        mutate: mutateDeletePurchaseDetail,
        isLoading: isLoadingDeletePurchaseDetail,
    } = POST(`api/purchase_detail_delete`, "purchase_detail_delete");

    const handleDeletePurchaseDetail = (name, remove) => {
        let purchase_details = form.getFieldValue("purchase_details");

        if (purchase_details && purchase_details.length > 0) {
            let purchase_detail = purchase_details[name];

            if (purchase_detail && purchase_detail.id) {
                mutateDeletePurchaseDetail(purchase_detail, {
                    onSuccess: (res) => {
                        if (res.success) {
                            notification.success({
                                message: "Purchase Order Detail",
                                description: res.message,
                            });
                            remove(name);
                        } else {
                            notification.error({
                                message: "Purchase Order Detail",
                                description: res.message,
                            });
                        }
                    },
                    onError: (err) => {
                        notificationErrors(err);
                    },
                });
            } else {
                remove(name);
            }
        } else {
            remove(name);
        }
    };

    const handleUpdatePurchaseDetails = (datePurchased) => {
        let purchase_details = form.getFieldValue("purchase_details");
        let vat_type = form.getFieldValue("vat_type");

        if (purchase_details && purchase_details.length > 0) {
            purchase_details = purchase_details.map((item) => {
                if (!item.product_detail_id) {
                    return {
                        ...item,
                        cost: 0,
                        total_cost: 0,
                        vat: 0,
                        gross_amount: 0,
                    };
                }

                let product_detail = dataProductDetails.data.find(
                    (x) => x.id === item.product_detail_id,
                );

                if (!product_detail) {
                    return {
                        ...item,
                        cost: 0,
                        total_cost: 0,
                        vat: 0,
                        gross_amount: 0,
                    };
                }

                let product_detail_price =
                    product_detail.product_detail_prices.find(
                        (x) =>
                            x.start_date <=
                                dayjs(datePurchased).format("YYYY-MM-DD") &&
                            x.end_date >=
                                dayjs(datePurchased).format("YYYY-MM-DD"),
                    );

                if (!product_detail_price) {
                    return {
                        ...item,
                        cost: 0,
                        total_cost: 0,
                        vat: 0,
                        gross_amount: 0,
                    };
                }

                let cost =
                    product_detail_price && product_detail_price.cost
                        ? Number(product_detail_price.cost)
                        : 0;
                let quantity = item.quantity ? Number(item.quantity) : 0;
                let sub_total_cost = cost * quantity;

                let vat = 0;

                if (vat_type === "Vat" && sub_total_cost) {
                    vat = (sub_total_cost / 1.12) * 0.12;
                }

                let gross_amount = sub_total_cost - vat;

                return {
                    ...item,
                    cost,
                    total_cost: sub_total_cost,
                    vat,
                    gross_amount,
                };
            });

            form.setFieldValue("purchase_details", purchase_details);
        }
    };

    const handleChangeQuantity = ({ value, name }) => {
        let purchase_details = form.getFieldValue("purchase_details");

        let quantity = value;
        let vat_type = form.getFieldValue("vat_type");

        if (purchase_details && purchase_details.length > 0) {
            let purchase_detail = purchase_details[name];
            let cost = purchase_detail.cost;
            let total_cost = quantity * cost;
            let vat = 0;
            if (vat_type === "Vat") {
                vat = (total_cost / 1.12) * 0.12;
            }
            let gross_amount = total_cost - vat;

            purchase_details[name] = {
                ...purchase_detail,
                total_cost,
                vat,
                gross_amount,
            };

            form.setFieldValue("purchase_details", purchase_details);
        }
    };

    const handleUpdateDateDue = (field, value) => {
        const datePurchased =
            field === "date_purchased"
                ? value
                : form.getFieldValue("date_purchased");
        const terms = field === "terms" ? value : form.getFieldValue("terms");
        const creditTerm = dataCreditTerm.find(
            (term) => term.id === form.getFieldValue("credit_term_id"),
        );
        if (datePurchased) {
            if (terms === "Credit" && creditTerm) {
                form.setFieldValue(
                    "date_due",
                    dayjs(datePurchased).add(creditTerm.credit_term, "day"),
                );
            } else if (terms === "Cash") {
                form.setFieldValue("date_due", dayjs(datePurchased));
            }
        }
    };

    return (
        <PagePurchaseContext.Provider
            value={{
                form,
                params,
                dataSource,
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
                toggleModalFormProfileAddress,
                setToggleModalFormProfileAddress,
                handleDeletePurchaseDetail,
                isLoadingDeletePurchaseDetail,
                isLoadingEwtType,
                isLoadingPurchase,
                location,
                handleUpdateDateDue,
                handleUpdatePurchaseDetails,
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
                        initialValues={{ purchase_details: [{}] }}
                    >
                        <PagePurchaseFormContent />
                    </Form>
                </Col>
            </Row>

            <ModalFormProfileAddress />
        </PagePurchaseContext.Provider>
    );
}
