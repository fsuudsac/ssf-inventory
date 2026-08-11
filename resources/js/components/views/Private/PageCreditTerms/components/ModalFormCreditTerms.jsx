import { useContext, useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import notificationErrors from "../../../../providers/notificationErrors";
import FloatInput from "../../../../providers/FloatInput";
import PageCreditTermsContext from "./PageCreditTermsContext";

export default function ModalFormCreditTerms() {
    const { toggleModalFormCreditTerms, setToggleModalFormCreditTerms } =
        useContext(PageCreditTermsContext);

    const [form] = Form.useForm();

    const { mutate: mutateCreditTerm, isLoading: isLoadingCreditTerm } = POST(
        `api/credit_term`,
        "credit_term_list",
    );

    const onFinish = (values) => {
        let type =
            values && values.type
                ? values.type
                : toggleModalFormCreditTerms.type;

        let data = {
            ...values,
            type,
            id:
                toggleModalFormCreditTerms.data &&
                toggleModalFormCreditTerms.data.id
                    ? toggleModalFormCreditTerms.data.id
                    : "",
        };

        mutateCreditTerm(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Credit Term",
                        description: res.message,
                    });

                    setToggleModalFormCreditTerms({ open: false, data: null });

                    form.resetFields();
                } else {
                    notification.error({
                        message: "Credit Term",
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
        if (toggleModalFormCreditTerms.open) {
            form.setFieldsValue({
                ...toggleModalFormCreditTerms.data,
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormCreditTerms]);

    return (
        <Modal
            title={`${
                toggleModalFormCreditTerms &&
                toggleModalFormCreditTerms.data &&
                toggleModalFormCreditTerms.data.id
                    ? "Edit"
                    : "Add"
            } Credit Term`}
            open={toggleModalFormCreditTerms.open}
            onCancel={() => {
                setToggleModalFormCreditTerms({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalFormCreditTerms({
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
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={isLoadingCreditTerm}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item
                    name="credit_term"
                    rules={[validateRules.required()]}
                >
                    <FloatInput
                        label="Credit Term"
                        placeholder="Credit Term"
                        required
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
