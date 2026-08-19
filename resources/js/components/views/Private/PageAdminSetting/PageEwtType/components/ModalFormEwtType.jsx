import { useContext, useEffect } from "react";
import { Modal, Button, Form, notification, Popconfirm } from "antd";

import { POST } from "../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../providers/validateRules";
import notificationErrors from "../../../../../providers/notificationErrors";
import FloatInput from "../../../../../providers/FloatInput";
import PageEwtTypeContext from "./PageEwtTypeContext";

export default function ModalFormEwtType() {
    const { toggleModalFormEwtType, setToggleModalFormEwtType } =
        useContext(PageEwtTypeContext);

    const [form] = Form.useForm();

    const { mutate: mutateCreditTerm, isLoading: isLoadingCreditTerm } = POST(
        `api/ewt_type`,
        "ewt_type_list",
    );

    const onFinish = (values) => {
        let type =
            values && values.type ? values.type : toggleModalFormEwtType.type;

        let data = {
            ...values,
            type,
            id:
                toggleModalFormEwtType.data && toggleModalFormEwtType.data.id
                    ? toggleModalFormEwtType.data.id
                    : "",
        };

        mutateCreditTerm(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "EWT Type",
                        description: res.message,
                    });

                    setToggleModalFormEwtType({ open: false, data: null });

                    form.resetFields();
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

    useEffect(() => {
        if (toggleModalFormEwtType.open) {
            form.setFieldsValue({
                ...toggleModalFormEwtType.data,
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormEwtType]);

    return (
        <Modal
            title={`${toggleModalFormEwtType?.data?.id ? "Edit" : "Add"} EWT Type`}
            open={toggleModalFormEwtType.open}
            onCancel={() => {
                setToggleModalFormEwtType({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    key={1}
                    type="default"
                    onClick={() => {
                        setToggleModalFormEwtType({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                >
                    CANCEL
                </Button>,
                <Popconfirm
                    key={2}
                    title="Are you sure you want to submit this EWT Type?"
                    onConfirm={() => form.submit()}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                        className: "btn-main-invert",
                    }}
                    disabled={isLoadingCreditTerm}
                >
                    <Button type="primary" loading={isLoadingCreditTerm}>
                        SUBMIT
                    </Button>
                </Popconfirm>,
            ]}
        >
            <Form
                form={form}
                onFinish={onFinish}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            >
                <Form.Item name="ewt_type" rules={[validateRules.required()]}>
                    <FloatInput
                        label="EWT Type"
                        placeholder="EWT Type"
                        required
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
