import { useContext, useEffect } from "react";
import { Modal, Button, notification, Upload, Row, Col, Form } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket } from "@fortawesome/pro-regular-svg-icons";

import { POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";
import validateRules from "../../../../providers/validateRules";
import FloatSelect from "../../../../providers/FloatSelect";
import PageStudentsContext from "./PageStudentContext";

export default function ModalStudentFormUploadExcel() {
    const {
        toggleModalUploadExcel,
        setToggleModalUploadExcel,
        dataSchoolYear,
        dataSemester,
    } = useContext(PageStudentsContext);

    const [form] = Form.useForm();

    const { mutate: mutateFormUpload, isLoading: isLoadingFormUpload } = POST(
        "api/student_subject_upload_excel",
        "student_list"
    );

    const onFinish = (values) => {
        if (values.excel_file.length > 0) {
            let excel_file = values.excel_file[0].originFileObj;

            let data = new FormData();
            data.append("school_year_id", values.school_year_id);
            data.append("semester_id", values.semester_id);
            data.append("file_excel", excel_file, excel_file.name);

            mutateFormUpload(data, {
                onSuccess: (res) => {
                    if (res.success) {
                        notification.success({
                            message: "Student Upload Excel",
                            description: res.message,
                        });
                        setToggleModalUploadExcel(false);
                    } else {
                        notification.error({
                            message: "Student Upload Excel",
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
                    <Col xs={24} sm={24} md={24} className="text-center">
                        <a
                            href={
                                window.location.origin +
                                "/assets/excel-format/Students Summary FORMAT.xls"
                            }
                        >
                            Download Students Summary FORMAT.xls
                        </a>
                    </Col>

                    <Col xs={24} sm={24} md={24}>
                        <Form.Item
                            name="school_year_id"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="School Year"
                                placeholder="School Year"
                                required
                                options={
                                    dataSchoolYear && dataSchoolYear.data
                                        ? dataSchoolYear.data.map((item) => ({
                                              value: item.id,
                                              label:
                                                  item.sy_from +
                                                  " - " +
                                                  item.sy_to,
                                          }))
                                        : []
                                }
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24}>
                        <Form.Item
                            name="semester_id"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="Semester"
                                placeholder="Semester"
                                required
                                options={
                                    dataSemester && dataSemester.data
                                        ? dataSemester.data.map((item) => ({
                                              value: item.id,
                                              label: item.semester,
                                          }))
                                        : []
                                }
                            />
                        </Form.Item>
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
                                className="upload-faculty-load"
                                action={null}
                                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
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
