import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    Button,
    Card,
    Col,
    Form,
    Image as AntImage,
    notification,
    QRCode,
    Row,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode } from "@fortawesome/pro-regular-svg-icons";
import axios from "axios";

import { DELETE, GET, POST } from "../../../providers/useAxiosQuery";
import { apiUrl } from "../../../providers/appConfig";
import PageProductFormContext from "./components/PageProductFormContext";
import validateRules from "../../../providers/validateRules";
import FloatInput from "../../../providers/FloatInput";
import FloatTextArea from "../../../providers/FloatTextArea";
import notificationErrors from "../../../providers/notificationErrors";
import globalLoading from "../../../providers/globalLoading";
import convertQrCodeToImage from "../../../providers/convertQrCodeToImage";
import TableProductDetail from "./components/TableProductDetail";
import ModalProductPreviewQr from "./components/ModalProductPreviewQr";
import ProductPhotoUpload from "./components/ProductPhotoUpload";
import FloatSelect from "../../../providers/FloatSelect";
import { debounce } from "lodash";

export default function PageProductForm() {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [form] = Form.useForm();
    const [disabledForm, setDisabledForm] = useState(true);
    const [attachments, setAttachments] = useState([]);

    const [qrCode, setQrCode] = useState("");
    const [toggleModalPreviewQr, setToggleModalPreviewQr] = useState({
        open: false,
        data: null,
    });
    const [dataSource, setDataSource] = useState(null);

    const [productId, setProductId] = useState(
        params && params.id ? params.id : "",
    );
    useEffect(() => {
        globalLoading();
        form.resetFields();

        setProductId(params && params.id ? params.id : "");

        return () => {};
    }, [params]);

    const { data: dataProductCategories } = GET(
        `api/product_category`,
        "product_category_dropdown",
        (res) => {},
        false,
    );

    const { refetch: refetchProduct } = GET(
        `api/products/${productId ? productId : ""}`,
        `product_info_${productId}`,
        (res) => {
            if (productId) {
                if (res.data) {
                    let data = res.data;

                    let attachments = data.attachments.map((item) => ({
                        ...item,
                        uid: item.id,
                        type: item.file_type,
                        name: item.file_name,
                        status: "done",
                        src: apiUrl(item.file_path),
                        created_at: item.created_at,
                    }));

                    setDataSource(data);
                    form.setFieldsValue(data);
                    setAttachments(attachments);
                }
            }
        },
    );

    useEffect(() => {
        refetchProduct();

        return () => {};
    }, [productId]);

    const { mutate: mutateProduct, isLoading: isLoadingProduct } = POST(
        `api/products`,
        ["product_info", `product_info_${productId}`],
    );

    const onFinish = async (values) => {
        let data = new FormData();
        data.append("id", params && params.id ? params.id : "");
        data.append("product_name", values.product_name);
        data.append("product_category_id", values.product_category_id);
        data.append(
            "description",
            values.description ? values.description : "",
        );

        if (params && !params.id) {
            let qrCodeFile = await convertQrCodeToImage(
                "myqrcode",
                "product_qr_code.png",
            );

            console.log("qrCodeFile: ", qrCodeFile);

            data.append("qr_code_file", qrCodeFile);
            data.append("qr_code", qrCode);
        }

        attachments.forEach((item) => {
            if (item.originFileObj) {
                data.append(`attachments[]`, item.originFileObj);
            }
        });

        mutateProduct(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Product",
                        description: res.message,
                    });

                    if (params && !params.id) {
                        setQrCode("");
                        let pathname = location.pathname.split("/");
                        navigate(`/${pathname[1]}/edit/${res.data.id}`);
                    }
                } else {
                    notification.error({
                        message: "Product",
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
        const generateQrCode = async () => {
            try {
                const token = localStorage.getItem("token"); // Retrieve the token

                await axios
                    .get(apiUrl("api/product_generate_qr_code"), {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    .then((res) => {
                        if (res) {
                            let data = res.data.data;
                            setQrCode(data);
                        }
                    });
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };

        if (params && !params.id) {
            generateQrCode();
        }
        setDisabledForm(false);
        globalLoading(false);
    }, [params]);

    const { mutate: mutateProductAttachment } = POST(
        `api/product_attachment`,
        `product_attachment_${productId}`,
    );

    const { mutate: mutateDeleteAttachment } = POST(
        `api/product_attachment_delete`,
        `product_attachment_${productId}`,
    );

    const handleUploadDebounce = (desiredList) => {
        const toUpload = desiredList.filter((f) => f.originFileObj);
        toUpload.forEach((file) => {
            let data = new FormData();
            data.append("product_id", params.id);
            data.append("attachment", file.originFileObj);

            mutateProductAttachment(data, {
                onSuccess: (res) => {
                    if (res.success) {
                        let saved = res.data;
                        notification.success({
                            message: "Product Attachment",
                            description: res.message,
                        });
                        setAttachments((ps) => [
                            ...ps.filter((f) => f.uid !== file.uid),
                            {
                                ...saved,
                                type: saved.file_type,
                                uid: saved.id,
                                name: saved.file_name,
                                status: "done",
                                src: apiUrl(saved.file_path),
                                created_at: saved.created_at,
                            },
                        ]);
                    } else {
                        notification.error({
                            message: "Product Attachment",
                            description: res.message,
                        });
                    }
                },
                onError: (err) => {
                    notificationErrors(err);
                },
            });
        });

        const toDelete = attachments.filter(
            (existing) =>
                existing.id && !desiredList.find((f) => f.uid === existing.uid),
        );
        toDelete.forEach((file) => {
            mutateDeleteAttachment(
                { id: file.id },
                {
                    onSuccess: (res) => {
                        if (res.success) {
                            notification.success({
                                message: "Product Attachment",
                                description: res.message,
                            });
                            setAttachments((ps) =>
                                ps.filter((f) => f.uid !== file.uid),
                            );
                        } else {
                            notification.error({
                                message: "Product Attachment",
                                description: res.message,
                            });
                        }
                    },
                    onError: (err) => {
                        notificationErrors(err);
                    },
                },
            );
        });
    };

    const handleInputTriggerDebounce = debounce((field, value) => {
        let oldValue = dataSource[field];
        if (oldValue !== value) {
            form.submit();
        }
    }, 1000);

    const handleInputDebounce = useCallback(
        (field, value) => {
            handleInputTriggerDebounce(field, value);
        },
        [handleInputTriggerDebounce],
    );

    return (
        <PageProductFormContext.Provider
            value={{
                params,
                dataSource,
                setDataSource,
                toggleModalPreviewQr,
                setToggleModalPreviewQr,
                attachments,
                setAttachments,
                location,
                handleUploadDebounce,
                dataProductCategories,
            }}
        >
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Form
                        form={form}
                        onFinish={onFinish}
                        disabled={disabledForm}
                    >
                        {qrCode && (
                            <div
                                id="myqrcode"
                                style={{
                                    visibility: "hidden",
                                    height: 0,
                                    overflow: "hidden",
                                }}
                            >
                                <QRCode
                                    errorLevel="H"
                                    value={`${window.location.origin}/products/qr_code?qr=${qrCode}`}
                                    bgColor="#ffffff"
                                    size={200}
                                    type="svg"
                                />
                            </div>
                        )}

                        <Row gutter={[20, 20]}>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                <Card
                                    title="Product Information"
                                    extra={
                                        params &&
                                        params.id && (
                                            <Button
                                                type="link"
                                                icon={
                                                    <FontAwesomeIcon
                                                        icon={faQrcode}
                                                    />
                                                }
                                                className="m-0 p-0 w-auto h-auto"
                                                onClick={() =>
                                                    setToggleModalPreviewQr({
                                                        open: true,
                                                        data: apiUrl(
                                                            dataSource.qr_file_path,
                                                        ),
                                                    })
                                                }
                                            />
                                        )
                                    }
                                >
                                    <Row gutter={[20, 0]}>
                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={24}
                                            lg={24}
                                            xl={24}
                                        >
                                            <Form.Item
                                                name="product_name"
                                                rules={[
                                                    validateRules.required(),
                                                ]}
                                            >
                                                <FloatInput
                                                    label="Product Name"
                                                    placeholder="Product Name"
                                                    required
                                                    onChange={(e) =>
                                                        handleInputDebounce(
                                                            "product_name",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={24}
                                            lg={24}
                                            xl={24}
                                        >
                                            <Form.Item name="description">
                                                <FloatTextArea
                                                    label="Description"
                                                    placeholder="Description"
                                                    onChange={(e) =>
                                                        handleInputDebounce(
                                                            "description",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={24}
                                            lg={24}
                                            xl={24}
                                        >
                                            <Form.Item
                                                name="product_category_id"
                                                rules={[
                                                    validateRules.required(),
                                                ]}
                                            >
                                                <FloatSelect
                                                    label="Product Category"
                                                    placeholder="Product Category"
                                                    required
                                                    options={
                                                        dataProductCategories &&
                                                        dataProductCategories.data
                                                            ? dataProductCategories.data.map(
                                                                  (item) => ({
                                                                      label: item.product_category,
                                                                      value: item.id,
                                                                  }),
                                                              )
                                                            : []
                                                    }
                                                    onChange={(e) =>
                                                        handleInputDebounce(
                                                            "product_category_id",
                                                            e,
                                                        )
                                                    }
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>

                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                <ProductPhotoUpload />
                            </Col>

                            {params && params.id ? (
                                ""
                            ) : (
                                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                    <Button
                                        className="btn-main-primary"
                                        htmlType="submit"
                                        loading={isLoadingProduct}
                                    >
                                        Submit
                                    </Button>
                                </Col>
                            )}
                        </Row>
                    </Form>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    {params && params.id && (
                        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                            <Card title="Product Details">
                                <TableProductDetail />
                            </Card>
                        </Col>
                    )}
                </Col>
            </Row>

            <ModalProductPreviewQr />
        </PageProductFormContext.Provider>
    );
}
