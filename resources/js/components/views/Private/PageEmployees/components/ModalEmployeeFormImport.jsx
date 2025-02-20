import { useContext } from "react";
import { Button, Col, Form, Modal, notification, Row, Upload } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket } from "@fortawesome/pro-regular-svg-icons";

import { POST } from "../../../../providers/useAxiosQuery";
import PageEmployeeContext from "./PageEmployeeContext";
import validateRules from "../../../../providers/validateRules";
import notificationErrors from "../../../../providers/notificationErrors";

export default function ModalEmployeeFormImport() {
    const { toggleModalUploadExcel, setToggleModalUploadExcel } =
        useContext(PageEmployeeContext);

    const [form] = Form.useForm();

    const { mutate: mutateFormUpload, isLoading: isLoadingFormUpload } = POST(
        "api/data_imports",
        "data_import_employee_dropdown_list"
    );

    const onFinish = (values) => {
        console.log("onFinish values: ", values);
        let data = new FormData();
        data.append("file_excel", values.excel_file[0].originFileObj);
        data.append("type", "profile_employee_import");

        mutateFormUpload(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Data Import",
                        description: res.message,
                    });
                    setToggleModalUploadExcel(false);
                } else {
                    notification.error({
                        message: "Data Import",
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
        <Modal
            title="Upload Excel"
            open={toggleModalUploadExcel}
            wrapClassName="modal-wrap-data-import-excel"
            onCancel={() => {
                setToggleModalUploadExcel(false);
            }}
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalUploadExcel(false);
                    }}
                    disabled={isLoadingFormUpload}
                >
                    Cancel
                </Button>,
                <Button
                    className="btn-main-primary"
                    type="primary"
                    key={2}
                    loading={isLoadingFormUpload}
                    onClick={() => {
                        form.submit();
                    }}
                >
                    Submit
                </Button>,
            ]}
            forceRender
        >
            <Form form={form} onFinish={onFinish}>
                <Row gutter={[20, 20]} id="tbl_wrapper">
                    <Col xs={24} sm={24} md={24}>
                        <Button
                            onClick={() => {
                                window.open(
                                    window.location.origin +
                                        "/excel-template/employee_format.xlsx"
                                );
                            }}
                        >
                            Download Employee Template
                        </Button>
                    </Col>

                    <Col xs={24} sm={24} md={24}>
                        <Form.Item
                            name="excel_file"
                            rules={[validateRules.required()]}
                            valuePropName="fileList"
                            getValueFromEvent={(e) => {
                                if (Array.isArray(e)) {
                                    return e;
                                }

                                return e?.fileList;
                            }}
                        >
                            <Upload
                                className="data-import"
                                action={null}
                                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                maxCount={1}
                                multiple={false}
                                disabled={isLoadingFormUpload}
                            >
                                <p className="ant-upload-drag-icon ">
                                    <FontAwesomeIcon
                                        icon={faArrowUpFromBracket}
                                    />
                                </p>
                                <p className="ant-upload-text">
                                    Click or drag file Excel to this area to
                                    upload
                                </p>
                                <p className="ant-upload-hint">
                                    30 MB max file size .xls, .xlsx
                                    <br />
                                    file formats accepted
                                </p>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
