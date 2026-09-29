import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Col, Form, notification, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { DELETE, GET, POST } from "../../../providers/useAxiosQuery";
import notificationErrors from "../../../providers/notificationErrors";
import ModalFormCustomer from "./components/ModalFormCustomer";
import PageFormSalesContext from "./components/PageFormSalesContext";
import PageFormSalesContent from "./components/PageFormSalesContent";
import ModalFormProfileAddress from "./components/ModalFormProfileAddress";

export default function PageFormSales() {
    const params = useParams();
    const navigate = useNavigate();

    const [form] = Form.useForm();

    const [companyValue, setCompanyValue] = useState("");
    const [dataCompany, setDataCompany] = useState([]);

    const [creditTermValue, setCreditTermValue] = useState(null);
    const [dataCreditTerm, setDataCreditTerm] = useState([]);

    const [ewtTypeValue, setEwtTypeValue] = useState(null);
    const [dataEwtType, setDataEwtType] = useState([]);

    const [customerAddress, setCustomerAddress] = useState([]);
    const [dataSource, setDataSource] = useState(null);

    const [toggleModalFormCustomer, setToggleModalFormCustomer] = useState({
        open: false,
        data: null,
    });

    const [toggleModalFormProfileAddress, setToggleModalFormProfileAddress] =
        useState({
            open: false,
            data: null,
        });

    const { data: dataCustomers } = GET(
        `api/users`,
        "users_customer_dropdown",
        () => {},
        false,
    );

    const { data: dataProductDetails } = GET(
        `api/product_details?from=page_sales_form`,
        "product_details_dropdown",
        () => {},
        false,
    );

    GET(
        `api/company`,
        "company_dropdown",
        (res) => {
            if (res.data && res.data.length > 0) {
                setDataCompany(res.data);
            }
        },
        false,
    );

    const { mutate: mutateCompany } = POST(`api/company`, "company_create");

    const handleAddCompany = () => {
        let data = { company: companyValue };

        mutateCompany(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setCompanyValue(null);
                    setDataCompany((prev) => [...prev, res.data]);
                    form.setFieldValue("company_id", res.data.id);

                    notification.success({
                        message: "Company",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Company",
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

    const { mutate: mutateCreditTerm } = POST(
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

    // EWT Type
    GET(
        `api/ewt_type`,
        "ewt_type_dropdown",
        (res) => {
            if (res.data && res.data.length > 0) {
                setDataEwtType(res.data);
            }
        },
        false,
    );

    const { mutate: mutateEwtType } = POST(`api/ewt_type`, "ewt_type_create");

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

    if (params && params.id) {
        GET(
            `api/sales/${params.id}`,
            `sales_edit${params.id}`,
            (res) => {
                if (res.data) {
                    let data = res.data;

                    let taxpayer_identification = "";

                    if (data.user) {
                        let supplier = data.user;

                        if (supplier.profile) {
                            taxpayer_identification =
                                supplier.profile.taxpayer_identification ?? "";

                            let profile_addresses =
                                supplier.profile.profile_addresses;

                            setCustomerAddress(profile_addresses);
                        }
                    }

                    const warranties = data.sales_order_warranties.map(
                        (warranty) => ({
                            ...warranty,
                            warranty_exp_date: dayjs(
                                warranty.warranty_exp_date,
                            ),
                        }),
                    );

                    let sales_order_details = data.sales_order_details.map(
                        (item) => ({
                            ...item,
                            product_type:
                                item?.product_detail?.product_type
                                    ?.product_type,
                            product_size:
                                item?.product_detail?.product_size
                                    ?.product_size,
                            price: Number(item.price),
                            selling_price: Number(item.total_selling_price),
                            vat: Number(item.vat),
                            gross_amount: Number(item.gross_amount),
                            total_stock:
                                Number(item.product_detail.total_stock) || 0,
                        }),
                    );

                    // console.log("sales_order_details: ", sales_order_details);

                    let dataCopy = {
                        ...data,
                        date_sales: data.date_sold
                            ? dayjs(data.date_sold)
                            : null,
                        date_due: data.date_due ? dayjs(data.date_due) : null,
                        credit_term_id: data.credit_term_id
                            ? data.credit_term_id
                            : "",
                        // sales_details: data.sales_order_details.length
                        //     ? data.sales_order_details
                        //     : [{}],
                        sales_order_warranty: warranties.length
                            ? warranties
                            : [{}],
                        customer_type: data.user
                            ? data.user.profile
                                ? data.user.profile.customer_type
                                : ""
                            : "",
                        has_warranty: data.has_warranty ? true : false,
                        total_discount: data.discount,
                        taxpayer_identification,
                        sales_details: sales_order_details,
                    };

                    form.setFieldsValue(dataCopy);
                    setDataSource(dataCopy);
                }
            },
            false,
        );
    }

    const { mutate: mutateSales, isLoading: isLoadingSales } = POST(
        `api/sales`,
        "sales_create",
    );

    const onFinish = (values) => {
        console.log("values: ", values);

        let sales_details = values.sales_details;
        let vat_type = values.vat_type;
        let ewt_type_id = values.ewt_type_id;
        let findEwtType = dataEwtType.find((x) => x.id === ewt_type_id);

        let ewt_type =
            findEwtType && findEwtType.ewt_type
                ? Number(findEwtType.ewt_type)
                : 0;

        let total_gross_amount = 0;
        let total_value_added_tax = 0;
        let total_amount_payable = 0;
        let total_discount = values.total_discount ? values.total_discount : 0;

        if (sales_details && sales_details.length > 0) {
            sales_details.forEach((item) => {
                let price = item.price ? Number(item.price) : 0;
                let quantity = item.quantity ? Number(item.quantity) : 0;
                let total_amount = price * quantity;

                let vat = 0;

                if (vat_type === "Vat") {
                    vat = (total_amount / 1.12) * 0.12;
                }

                total_value_added_tax += vat;
                total_gross_amount += total_amount - vat;
                total_amount_payable += total_amount;
            });
        }

        let total_withholding_tax = total_gross_amount * (ewt_type / 100);
        let total_amount_due = total_amount_payable - total_withholding_tax;

        let total_net_amount_due = total_amount_due - total_discount;

        let type = "";
        let date_returned = "";

        let pathname = location.pathname.split("/")[2];

        if (["add-sales-return", "edit-sales-return"].includes(pathname)) {
            type = "Release Item Return";
            date_returned = values.date_returned
                ? dayjs(values.date_returned).format("YYYY-MM-DD")
                : "";
        } else if (["add-sales", "edit-sales"].includes(pathname)) {
            type = "Release Item";
        }

        let sales_order_warranty = values.sales_order_warranty
            ? values.sales_order_warranty.map((item) => ({
                  ...item,
                  warranty_exp_date: item.warranty_exp_date
                      ? dayjs(item.warranty_exp_date).format("YYYY-MM-DD")
                      : "",
              }))
            : [];

        let data = {
            ...values,
            id: params.id,
            credit_term_id: values.credit_term_id ? values.credit_term_id : "",
            date_sales: values.date_sales
                ? dayjs(values.date_sales).format("YYYY-MM-DD")
                : "",
            date_due: values.date_due
                ? dayjs(values.date_due).format("YYYY-MM-DD")
                : "",
            total_gross_amount,
            total_value_added_tax,
            total_amount_payable,
            total_withholding_tax,
            total_amount_due,
            total_net_amount_due,
            type,
            has_warranty: values.has_warranty ? 1 : 0,
            sales_order_warranty,
        };

        mutateSales(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Release Item",
                        description: res.message,
                    });

                    if (params && !params.id) {
                        navigate("/release-item");
                    }
                } else {
                    notification.error({
                        message: "Release Item",
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
        mutate: mutateDeleteSalesDetail,
        isLoading: isLoadingDeleteSalesDetail,
    } = POST(`api/sales_order_detail_delete`, "sales_order_detail_delete");

    const handleDeleteSalesDetail = (name, remove) => {
        let sales_details = form.getFieldValue("sales_details");

        if (sales_details && sales_details.length > 0) {
            let sales_detail = sales_details[name];

            if (sales_detail && sales_detail.id) {
                mutateDeleteSalesDetail(sales_detail, {
                    onSuccess: (res) => {
                        if (res.success) {
                            notification.success({
                                message: "Release Item Detail",
                                description: res.message,
                            });
                            remove(name);
                        } else {
                            notification.error({
                                message: "Release Item Detail",
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

    const {
        mutate: mutateDeleteSalesOrderWarranty,
        isLoading: isLoadingDeleteSalesOrderWarranty,
    } = DELETE(`api/sales_order_warranty`, "sales_order_warranty_delete");

    const handleDeleteSalesOrderWarranty = (name, remove) => {
        let sales_order_warranties = form.getFieldValue("sales_order_warranty");

        if (sales_order_warranties && sales_order_warranties.length > 0) {
            let warranty = sales_order_warranties[name];

            if (warranty && warranty.id) {
                mutateDeleteSalesOrderWarranty(warranty, {
                    onSuccess: (res) => {
                        if (res.success) {
                            notification.success({
                                message: "Release Item Order Warranty",
                                description: res.message,
                            });
                            remove(name);
                        } else {
                            notification.error({
                                message: "Release Item Order Warranty",
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

    const handleUpdateDateDue = (field, value) => {
        const dateSales =
            field === "date_sales" ? value : form.getFieldValue("date_sales");
        const credit_term_id =
            field === "credit_term_id"
                ? value
                : form.getFieldValue("credit_term_id");
        const terms = field === "terms" ? value : form.getFieldValue("terms");
        const creditTerm =
            dataCreditTerm &&
            dataCreditTerm.find(
                (term) => Number(term.id) === Number(credit_term_id),
            );

        if (dateSales) {
            if (terms === "Credit" && creditTerm) {
                form.setFieldsValue({
                    date_due: dayjs(dateSales).add(
                        Number(creditTerm.credit_term),
                        "day",
                    ),
                });
            } else if (terms === "Cash") {
                form.setFieldsValue({
                    date_due: dayjs(dateSales),
                });
            }
        }
    };

    return (
        <PageFormSalesContext.Provider
            value={{
                form,
                dataSource,
                sales_order_id: params && params.id ? params.id : null,
                dataCustomers,
                dataProductDetails:
                    dataProductDetails && dataProductDetails.data
                        ? dataProductDetails.data
                        : [],
                dataCreditTerm,
                dataEwtType,
                companyValue,
                setCompanyValue,
                creditTermValue,
                setCreditTermValue,
                ewtTypeValue,
                setEwtTypeValue,
                toggleModalFormCustomer,
                setToggleModalFormCustomer,
                handleDeleteSalesDetail,
                isLoadingDeleteSalesDetail,
                handleDeleteSalesOrderWarranty,
                isLoadingDeleteSalesOrderWarranty,
                handleAddCreditTerm,
                handleAddEwtType,
                isLoadingSales,
                toggleModalFormProfileAddress,
                setToggleModalFormProfileAddress,
                dataCompany,
                setDataCompany,
                handleAddCompany,
                customerAddress,
                setCustomerAddress,
                handleUpdateDateDue,
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
                            sales_details: [{}],
                            sales_order_warranty: [{}],
                        }}
                    >
                        <PageFormSalesContent />
                    </Form>
                </Col>
            </Row>

            <ModalFormCustomer />

            <ModalFormProfileAddress />
        </PageFormSalesContext.Provider>
    );
}
