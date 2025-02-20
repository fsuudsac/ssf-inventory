import { useContext } from "react";
import { Button, Col, Form, Modal, notification, Row, Upload } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket } from "@fortawesome/pro-regular-svg-icons";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import notificationErrors from "../../../../providers/notificationErrors";
import PageStudentsContext from "./PageStudentContext";
import FloatSelect from "../../../../providers/FloatSelect";

export default function ModalStudentFormImport() {
    const {
        toggleModalUploadExcel,
        setToggleModalUploadExcel,
        dataSchoolYear,
        dataSemester,
    } = useContext(PageStudentsContext);

    const [form] = Form.useForm();

    const { mutate: mutateFormUpload, isLoading: isLoadingFormUpload } = POST(
        "api/data_imports",
        "data_import_student_dropdown_list"
    );

    const onFinish = (values) => {
        console.log("onFinish values: ", values);
        let data = new FormData();
        data.append("file_excel", values.excel_file[0].originFileObj);
        data.append("type", "profile_student_import");
        data.append("school_year_id", values.school_year_id);
        data.append("semester_id", values.semester_id);

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
                <Row gutter={[20, 0]} id="tbl_wrapper">
                    <Col xs={24} sm={24} md={24}>
                        <Button
                            onClick={() => {
                                window.open(
                                    window.location.origin +
                                        "/excel-template/student_format.xlsx"
                                );
                            }}
                            className="mb-20"
                        >
                            Download Student Template
                        </Button>
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
                                options={dataSchoolYear.map((item) => ({
                                    value: item.id,
                                    label: item.sy_from + " - " + item.sy_to,
                                }))}
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
                                options={dataSemester.map((item) => ({
                                    value: item.id,
                                    label: item.semester,
                                }))}
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
