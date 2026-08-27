import { useContext } from "react";
import { Button, Form, Modal, notification, Upload } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp } from "@fortawesome/pro-regular-svg-icons";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import PageProductContext from "./PageProductContext";

export default function ModalImportProducts() {
    const { toggleModalImportProduct, setToggleModalImportProduct } =
        useContext(PageProductContext);

    const [form] = Form.useForm();

    const { mutate: mutateImportProducts, isLoading: isLoadingProductImport } =
        POST(`api/upload_products`, "products_list");

    const onFinish = (values) => {};

    return (
        <Modal
            wrapClassName="wrap-modal-form-import"
            title="Upload Product List"
            open={toggleModalImportProduct.open}
            onCancel={() => {
                setToggleModalImportProduct({
                    open: false,
                    data: null,
                });
                form.resetFields();
            }}
            forceRender
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalImportProduct({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                    loading={isLoadingProductImport}
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={isLoadingProductImport}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item
                    name="file_excel"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                        if (Array.isArray(e)) {
                            return e;
                        }
                        return e?.fileList;
                    }}
                    rules={[validateRules.required]}
                >
                    <Upload.Dragger
                        className="upload-w-100 upload-hide-remove-icon"
                        action={false}
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        maxCount={1}
                        beforeUpload={(file) => {
                            let error = false;
                            const isLt2M = file.size / 102400 / 102400 < 5;
                            if (!isLt2M) {
                                notification.error({
                                    message: "Upload Product List",
                                    description: "Excel must smaller than 5MB!",
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
            </Form>
        </Modal>
    );
}
