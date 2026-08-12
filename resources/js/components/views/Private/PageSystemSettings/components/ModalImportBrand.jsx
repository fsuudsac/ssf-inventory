import { useEffect } from "react";
import { Modal, Button, Form, notification, Row, Upload } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp } from "@fortawesome/pro-regular-svg-icons";

import { POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";

export default function ModalImportBrand(props) {
    const { toggleModalImportBrand, setToggleModalImportBrand } = props;

    const [form] = Form.useForm();

    const { mutate: mutateImportBrand, isLoading: isLoadingCategory } = POST(
        `api/upload_brand`,
        "brand_list",
    );

    const onFinish = (values) => {
        let data = new FormData();

        if (
            values.file_excel &&
            values.file_excel[0] &&
            values.file_excel[0].originFileObj
        ) {
            data.append(
                "file_excel",
                values.file_excel[0].originFileObj,
                values.file_excel[0].originFileObj.name,
            );
        }

        data.append("link_origin", window.location.origin);

        mutateImportBrand(data, {
            onSuccess: (res) => {
                notification.success({
                    message: "Brand List uploaded successfully.",
                    description: res.message,
                });
                setToggleModalImportBrand({
                    open: false,
                    data: null,
                });
                form.resetFields();
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useEffect(() => {
        if (toggleModalImportBrand.open) {
            form.setFieldsValue({
                ...toggleModalImportBrand.data,
            });
        } else {
            form.resetFields();
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalImportBrand]);

    return (
        <Modal
            wrapClassName="wrap-modal-form-module"
            title="Import Brand"
            open={toggleModalImportBrand.open}
            onCancel={() => {
                setToggleModalImportBrand({
                    open: false,
                    data: null,
                });
            }}
            forceRender
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalImportBrand({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    key={2}
                    onClick={(values) => form.submit(values)}
                    loading={isLoadingCategory}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Row gutter={[12, 0]}>
                    <Form.Item
                        style={{ width: "100%" }}
                        name="file_excel"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => {
                            if (Array.isArray(e)) {
                                return e;
                            }

                            return e?.fileList;
                        }}
                        // rules={[validateRules.quillValidator()]}
                    >
                        <Upload.Dragger
                            className="upload-w-100 upload-hide-remove-icon"
                            accept="application/excel"
                            multiple
                            beforeUpload={(file) => {
                                let error = false;
                                const isLt2M = file.size / 102400 / 102400 < 5;
                                if (!isLt2M) {
                                    notification.error({
                                        message: "Exam Result",
                                        description:
                                            "Excel must smaller than 5MB!",
                                    });
                                    error = Upload.LIST_IGNORE;
                                }
                                return error;
                            }}
                        >
                            <p className="ant-upload-drag-icon">
                                <FontAwesomeIcon
                                    icon={faFileArrowUp}
                                    className="m-r-xs"
                                    style={{
                                        fontSize: "24px",
                                    }}
                                />
                            </p>
                            <p className="ant-upload-text">
                                Click or drag file to this area to upload
                            </p>
                            <p className="ant-upload-hint">
                                Support for a single or bulk upload
                            </p>
                        </Upload.Dragger>
                    </Form.Item>
                </Row>
            </Form>
        </Modal>
    );
}
