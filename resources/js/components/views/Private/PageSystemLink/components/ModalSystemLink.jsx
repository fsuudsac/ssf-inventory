import { useEffect } from "react";
import { Modal, Button, Form, notification, Upload } from "antd";
import dayjs from "dayjs";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import notificationErrors from "../../../../providers/notificationErrors";
import FloatInput from "../../../../providers/FloatInput";
import FloatQuill from "../../../../providers/FloatQuill";
import FloatDatePicker from "../../../../providers/FloatDatePicker";

export default function ModalSystemLink(props) {
    const { toggleModalForm, setToggleModalForm } = props;

    const [form] = Form.useForm();

    const { mutate: mutateSystemLink, isLoading: isLoadingSystemLink } = POST(
        `api/system_link`,
        "system_link_list"
    );

    const onFinish = (values) => {
        let data = new FormData();

        data.append("name", values.name ?? "");
        data.append("url", values.url ?? "");
        data.append("description", values.description ?? "");
        data.append(
            "date_created",
            values.date_created
                ? dayjs(values.date_created).format("YYYY-MM-DD")
                : ""
        );

        let error = false;
        if (!toggleModalForm.data) {
            if (values.file && values.file.length === 0) {
                error = true;

                notification.error({
                    message: "System Link",
                    description: "Please upload a file",
                });
            }
        }

        if (!error) {
            if (values.file && values.file.length > 0) {
                data.append(
                    "logo_file",
                    values.file[0].originFileObj,
                    values.file[0].originFileObj.name
                );
            }

            data.append(
                "id",
                toggleModalForm.data && toggleModalForm.data.id
                    ? toggleModalForm.data.id
                    : ""
            );

            mutateSystemLink(data, {
                onSuccess: (res) => {
                    console.log("res", res);
                    if (res.success) {
                        setToggleModalForm({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                        notification.success({
                            message: "System Link",
                            description: res.message,
                        });
                    } else {
                        notification.error({
                            message: "System Link",
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
        if (toggleModalForm.open && toggleModalForm.data) {
            let attachments = toggleModalForm.data.attachments.filter(
                (x) => x.file_description === "System Logo"
            );
            let logo_url = "/images/logo.png";

            if (attachments && attachments.length > 0) {
                let logo = attachments[attachments.length - 1].file_path;

                if (logo) {
                    logo_url = logo;
                }
            }

            form.setFieldsValue({
                ...toggleModalForm.data,
                date_created:
                    toggleModalForm.data && toggleModalForm.data.date_created
                        ? dayjs(toggleModalForm.data.date_created)
                        : null,
                logo_url,
            });
        }

        return () => {};
    }, [toggleModalForm]);

    return (
        <Modal
            title="Form System Link"
            open={toggleModalForm.open}
            onCancel={() => {
                setToggleModalForm({
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
                        setToggleModalForm({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                    disabled={isLoadingSystemLink}
                >
                    CANCEL
                </Button>,
                <Button
                    className="btn-main-primary"
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={isLoadingSystemLink}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item name="name" rules={[validateRules.required()]}>
                    <FloatInput
                        label="Name"
                        placeholder="Name"
                        required={true}
                    />
                </Form.Item>
                <Form.Item name="url" rules={[validateRules.required()]}>
                    <FloatInput
                        label="URL"
                        placeholder="URL"
                        required={true}
                        type="url"
                    />
                </Form.Item>
                <Form.Item name="description">
                    <FloatQuill label="Description" placeholder="Description" />
                </Form.Item>
                <Form.Item
                    name="date_created"
                    rules={[validateRules.required()]}
                >
                    <FloatDatePicker
                        label="Date Created"
                        placeholder="Date Created"
                        required={true}
                    />
                </Form.Item>

                <Form.Item shouldUpdate noStyle>
                    {() => {
                        let imageUrl = form.getFieldValue("logo_url");

                        return (
                            <Form.Item
                                name="file"
                                className="m-b-sm flex-upload"
                                valuePropName="fileList"
                                getValueFromEvent={(e) => {
                                    if (Array.isArray(e)) {
                                        return e;
                                    }

                                    return e?.fileList;
                                }}
                            >
                                <Upload
                                    className="upload-w-100"
                                    listType="picture-card"
                                    accept="image/jpg,image/jpeg,image/png"
                                    showUploadList={false}
                                    beforeUpload={(file) => {
                                        let _URL =
                                            window.URL || window.webkitURL;
                                        let objectUrl =
                                            _URL.createObjectURL(file);

                                        form.setFieldValue(
                                            "logo_url",
                                            objectUrl
                                        );

                                        return false;
                                    }}
                                    maxCount={1}
                                >
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt="avatar"
                                            style={{
                                                maxWidth: "100%",
                                            }}
                                        />
                                    ) : (
                                        "Upload"
                                    )}
                                </Upload>
                            </Form.Item>
                        );
                    }}
                </Form.Item>
            </Form>
        </Modal>
    );
}
