import { useEffect } from "react";
import { Modal, Button, notification, Upload, Row, Col, Form } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket } from "@fortawesome/pro-regular-svg-icons";

import { POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";
import validateRules from "../../../../providers/validateRules";
import FloatSelect from "../../../../providers/FloatSelect";

export default function ModalFacultyFormUploadExcel(props) {
    const { toggleModalUploadExcel, setToggleModalUploadExcel } = props;

    const [form] = Form.useForm();

    const { mutate: mutateFormUpload, isLoading: isLoadingFormUpload } = POST(
        "api/faculty_upload_excel",
        "faculty_upload_excel"
    );

    const onFinish = (values) => {
        let error = false;

        let data = new FormData();

        if (values.excel_file.length > 0) {
            let excel_file = values.excel_file[0].originFileObj;

            if (excel_file) {
                data.append("file_excel", excel_file, excel_file.name);
            } else {
                error = true;
                notification.success({
                    message: "Faculty Upload Excel",
                    description: "Please upload a file.",
                });
            }
        } else {
            notification.success({
                message: "Faculty Upload Excel",
                description: "Please upload a file.",
            });
        }

        if (!error) {
            mutateFormUpload(data, {
                onSuccess: (res) => {
                    if (res.success) {
                        notification.success({
                            message: "Faculty Upload Excel",
                            description: res.message,
                        });
                        setToggleModalUploadExcel(false);
                    } else {
                        notification.error({
                            message: "Faculty Upload Excel",
                            description: res.message,
                        });
                    }
                },
                onError: (err) => {
                    notificationErrors(err);
                },
            });
        }
    };

    useEffect(() => {
        if (!toggleModalUploadExcel) {
            form.resetFields();
        }

        return () => {};
    }, [toggleModalUploadExcel]);

    return (
        <Modal
            title="Upload File Excel"
            open={toggleModalUploadExcel}
            wrapClassName="modal-wrap-student-upload-excel"
            onCancel={() => {
                form.resetFields();
                setToggleModalUploadExcel(false);
            }}
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalUploadExcel(false);
                        form.resetFields();
                    }}
                    disabled={isLoadingFormUpload}
                >
                    Close
                </Button>,
                <Button
                    className="btn-main-primary"
                    key={0}
                    onClick={() => {
                        form.submit();
                    }}
                    loading={isLoadingFormUpload}
                >
                    Submit
                </Button>,
            ]}
            forceRender
        >
            <Form form={form} onFinish={onFinish}>
                <Row gutter={[12, 12]} id="tbl_wrapper">
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
                                className="upload-faculty-load"
                                action={null}
                                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                maxCount={1}
                                multiple={false}
                                showUploadList={false}
                                fileList={[]} // file
                            >
                                <p className="ant-upload-drag-icon ">
                                    <FontAwesomeIcon
                                        icon={faArrowUpFromBracket}
                                    />
                                </p>
                                <p className="ant-upload-text">
                                    Click or drag file to this area to upload
                                </p>
                                <p className="ant-upload-hint">
                                    Support for a single upload. Strictly
                                    prohibited from uploading banned files or
                                    other file type.
                                </p>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
