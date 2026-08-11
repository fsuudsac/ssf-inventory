import { useEffect, useState } from "react";
import {
    Modal,
    Button,
    Form,
    notification,
    Col,
    Row,
    Divider,
    Flex,
    Input,
    QRCode,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import { apiUrl } from "../../../../providers/appConfig";
import convertQrCodeToImage from "../../../../providers/convertQrCodeToImage";
import FloatSelect from "../../../../providers/FloatSelect";
import notificationErrors from "../../../../providers/notificationErrors";
import FloatInputNumber from "../../../../providers/FloatInputNumber";
import TableProductDetailPrice from "./TableProductDetailPrice";
import ModalProductDetailPrice from "./ModalProductDetailPrice";

export default function ModalProductDetail(props) {
    const {
        toggleModalFormProductDetail,
        setToggleModalFormProductDetail,
        productId,
    } = props;

    const [form] = Form.useForm();

    const [toggleModalProductDetailPrice, setToggleModalProductDetailPrice] =
        useState({
            open: false,
            data: null,
        });

    const [qrCode, setQrCode] = useState("");
    const [productTypeValue, setProductTypeValue] = useState("");
    const [dataProductType, setDataProductType] = useState([]);
    const [productSizeValue, setProductSizeValue] = useState("");
    const [dataProductSize, setDataProductSize] = useState([]);

    GET(
        `api/product_type`,
        "product_type_dropdown",
        (res) => {
            if (res.data && res.data.length > 0) {
                setDataProductType(res.data);
            }
        },
        false,
    );

    GET(
        `api/product_size`,
        "product_size_dropdown",
        (res) => {
            if (res.data && res.data.length > 0) {
                setDataProductSize(res.data);
            }
        },
        false,
    );

    const { mutate: mutateProductType, isLoading: isLoadingProductType } = POST(
        `api/product_type`,
        "product_type_create",
    );

    const handleAddProductType = () => {
        let data = { product_type: productTypeValue };

        mutateProductType(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setProductTypeValue(null);
                    setDataProductType((prev) => [...prev, res.data]);
                    form.setFieldValue("product_type_id", res.data.id);

                    notification.success({
                        message: "Product Type",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Product Type",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const { mutate: mutateProductSize, isLoading: isLoadingProductSize } = POST(
        `api/product_size`,
        "product_size_create",
    );

    const handleAddProductSize = () => {
        let data = { product_size: productSizeValue };

        mutateProductSize(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setProductSizeValue(null);
                    setDataProductSize((prev) => [...prev, res.data]);
                    form.setFieldValue("product_size_id", res.data.id);

                    notification.success({
                        message: "Product Size",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Product Size",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const { mutate: mutateProductDetail, isLoading: isLoadingProductDetail } =
        POST(`api/product_details`, `product_details_list_${productId}`);

    const onFinish = async (values) => {
        let data = new FormData();
        data.append(
            "id",
            toggleModalFormProductDetail &&
                toggleModalFormProductDetail.data &&
                toggleModalFormProductDetail.data.id
                ? toggleModalFormProductDetail.data.id
                : "",
        );

        data.append("product_type_id", values.product_type_id ?? "");
        data.append("product_size_id", values.product_size_id ?? "");

        let product_detail_prices = [];

        if (values.product_detail_prices) {
            product_detail_prices = values.product_detail_prices.map((item) => {
                return {
                    cost: item.cost ?? "",
                    dealers_price: item.dealers_price ?? "",
                    wholesale_price: item.wholesale_price ?? "",
                    srp: item.srp ?? "",
                    fleet_price: item.fleet_price ?? "",
                    start_date: item.start_date
                        ? dayjs(item.start_date).format("YYYY-MM-DD")
                        : "",
                    end_date: item.end_date
                        ? dayjs(item.end_date).format("YYYY-MM-DD")
                        : "",
                };
            });
        }

        data.append(
            "product_detail_prices",
            JSON.stringify(product_detail_prices),
        );
        data.append("reorder_point", values.reorder_point ?? "");
        data.append("product_id", productId);

        if (
            toggleModalFormProductDetail &&
            !toggleModalFormProductDetail.data
        ) {
            let qrCodeFile = await convertQrCodeToImage(
                "myqrcodedetail",
                "product_detail_qr_code.png",
            );

            data.append("qr_code_file", qrCodeFile);
            data.append("qr_code", qrCode);
        }

        mutateProductDetail(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Product Detail",
                        description: res.message,
                    });

                    form.resetFields();
                    setToggleModalFormProductDetail({
                        open: false,
                        data: null,
                    });
                } else {
                    notification.error({
                        message: "Product Detail",
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
        console.log(
            "toggleModalFormProductDetail: ",
            toggleModalFormProductDetail,
        );

        const generateQrCode = async () => {
            try {
                const token = localStorage.getItem("token"); // Retrieve the token

                await axios
                    .get(apiUrl("api/product_detail_generate_qr_code"), {
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

        if (toggleModalFormProductDetail.open) {
            let product_detail_prices = [
                {
                    cost: null,
                    dealers_price: null,
                    wholesale_price: null,
                    srp: null,
                    fleet_price: null,
                },
            ];

            if (
                toggleModalFormProductDetail.data &&
                toggleModalFormProductDetail.data.product_detail_prices &&
                toggleModalFormProductDetail.data.product_detail_prices.length >
                    0
            ) {
                product_detail_prices =
                    toggleModalFormProductDetail.data.product_detail_prices.map(
                        (item) => ({
                            ...item,
                            start_date: item.start_date
                                ? dayjs(item.start_date)
                                : null,
                            end_date: item.end_date
                                ? dayjs(item.end_date)
                                : null,
                        }),
                    );
            }

            form.setFieldsValue({
                ...toggleModalFormProductDetail.data,
                product_detail_prices,
            });

            if (
                toggleModalFormProductDetail &&
                !toggleModalFormProductDetail.data
            ) {
                generateQrCode();
            }
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormProductDetail]);

    return (
        <>
            {qrCode && (
                <div
                    id="myqrcodedetail"
                    style={{
                        visibility: "hidden",
                        height: 0,
                        overflow: "hidden",
                    }}
                >
                    <QRCode
                        errorLevel="H"
                        value={`${window.location.origin}/product_detail/qr_code?qr=${qrCode}`}
                        bgColor="#ffffff"
                        size={200}
                        type="svg"
                    />
                </div>
            )}
            <Modal
                wrapClassName="wrap-modal-product"
                title={`${
                    toggleModalFormProductDetail.data &&
                    toggleModalFormProductDetail.data.id
                        ? "Edit"
                        : "Add"
                } Product Detail`}
                open={toggleModalFormProductDetail.open}
                onCancel={() => {
                    form.resetFields();
                    setToggleModalFormProductDetail({
                        open: false,
                        data: null,
                    });
                }}
                footer={[
                    <Button
                        className="btn-main-primary outlined"
                        key={1}
                        onClick={() => {
                            form.resetFields();
                            setToggleModalFormProductDetail({
                                open: false,
                                data: null,
                            });
                        }}
                        disabled={isLoadingProductDetail}
                    >
                        CLOSE
                    </Button>,
                    <Button
                        type="primary"
                        type="primary"
                        key={2}
                        onClick={() => form.submit()}
                        loading={isLoadingProductDetail}
                    >
                        SUBMIT
                    </Button>,
                ]}
            >
                <Row gutter={[20, 20]}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                        {" "}
                        <Form form={form} onFinish={onFinish}>
                            <Row gutter={[12, 0]}>
                                <Col
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={12}
                                    xl={12}
                                    xxl={12}
                                >
                                    <Form.Item name="product_type_id">
                                        <FloatSelect
                                            label="Product Type"
                                            placeholder="Product Type"
                                            allowClear
                                            options={dataProductType.map(
                                                (item) => ({
                                                    value: item.id,
                                                    label: item.product_type,
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
                                                            value={
                                                                productTypeValue
                                                            }
                                                            placeholder="Add Product Type"
                                                            onChange={(e) =>
                                                                setProductTypeValue(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onBlur={(e) =>
                                                                setProductTypeValue(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onPressEnter={() =>
                                                                handleAddProductType()
                                                            }
                                                            disabled={
                                                                isLoadingProductType
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
                                                                handleAddProductType()
                                                            }
                                                            loading={
                                                                isLoadingProductType
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
                                    lg={12}
                                    xl={12}
                                    xxl={12}
                                >
                                    <Form.Item name="product_size_id">
                                        <FloatSelect
                                            label="Product Size"
                                            placeholder="Product Size"
                                            allowClear
                                            options={dataProductSize.map(
                                                (item) => ({
                                                    value: item.id,
                                                    label: item.product_size,
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
                                                            value={
                                                                productSizeValue
                                                            }
                                                            placeholder="Add Product Size"
                                                            onChange={(e) =>
                                                                setProductSizeValue(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onBlur={(e) =>
                                                                setProductSizeValue(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onPressEnter={() =>
                                                                handleAddProductSize()
                                                            }
                                                            disabled={
                                                                isLoadingProductSize
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
                                                                handleAddProductSize()
                                                            }
                                                            loading={
                                                                isLoadingProductSize
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
                                    lg={12}
                                    xl={12}
                                    xxl={12}
                                >
                                    <Form.Item name="reorder_point">
                                        <FloatInputNumber
                                            label="Reorder Point"
                                            placeholder="Reorder Point"
                                            type="number"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Col>

                    {toggleModalFormProductDetail &&
                    toggleModalFormProductDetail.data &&
                    toggleModalFormProductDetail.data.id ? (
                        <>
                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={24}
                                xl={24}
                                xxl={24}
                            >
                                <Button
                                    type="primary"
                                    onClick={() =>
                                        setToggleModalProductDetailPrice({
                                            open: true,
                                            data: null,
                                        })
                                    }
                                >
                                    Add Price
                                </Button>
                            </Col>
                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={24}
                                xl={24}
                                xxl={24}
                            >
                                <TableProductDetailPrice
                                    product_detail_id={
                                        toggleModalFormProductDetail &&
                                        toggleModalFormProductDetail.data &&
                                        toggleModalFormProductDetail.data.id
                                            ? toggleModalFormProductDetail.data
                                                  .id
                                            : ""
                                    }
                                    setToggleModalProductDetailPrice={
                                        setToggleModalProductDetailPrice
                                    }
                                />
                            </Col>
                        </>
                    ) : (
                        ""
                    )}
                </Row>
            </Modal>

            <ModalProductDetailPrice
                toggleModalProductDetailPrice={toggleModalProductDetailPrice}
                setToggleModalProductDetailPrice={
                    setToggleModalProductDetailPrice
                }
                productId={productId}
                product_detail_id={
                    toggleModalFormProductDetail &&
                    toggleModalFormProductDetail.data &&
                    toggleModalFormProductDetail.data.id
                        ? toggleModalFormProductDetail.data.id
                        : ""
                }
            />
        </>
    );
}
