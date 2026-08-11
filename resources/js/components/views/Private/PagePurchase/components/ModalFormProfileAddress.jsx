import { useContext, useState } from "react";
import { Modal, Button, Form, notification, Radio, Typography } from "antd";

import { POST } from "../../../../providers/useAxiosQuery";
import FloatTextArea from "../../../../providers/FloatTextArea";
import notificationErrors from "../../../../providers/notificationErrors";
import PagePurchaseContext from "./PagePurchaseContext";
import validateRules from "../../../../providers/validateRules";

export default function ModalFormProfileAddress() {
    const {
        toggleModalFormProfileAddress,
        setToggleModalFormProfileAddress,
        setSupplierAddress,
    } = useContext(PagePurchaseContext);

    const [form] = Form.useForm();
    const [addressType, setAddressType] = useState(null);

    const { mutate: mutateProfileAddress, isLoading: isLoadingProfileAddress } =
        POST(`api/profile_address`, "create_users_info");

    const onFinish = (values) => {
        const data = new FormData();
        console.log(
            "toggleModalFormProfileAddress: ",
            toggleModalFormProfileAddress,
        );

        data.append(
            "profile_id",
            toggleModalFormProfileAddress.data.profile.id,
        );
        data.append("type", values.type);
        data.append("address", values.address);
        data.append("status", 1);

        mutateProfileAddress(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Address",
                        description: res.message,
                    });
                    setToggleModalFormProfileAddress({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    setSupplierAddress(res.data);
                } else {
                    notification.error({
                        message: "Address",
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
            wrapClassName="wrap-modal-form-module wrap-modal-form-address"
            title="Form Add Address TEST"
            open={toggleModalFormProfileAddress.open}
            onCancel={() =>
                setToggleModalFormProfileAddress({ open: false, data: null })
            }
            forceRender
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key="cancel"
                    onClick={() =>
                        setToggleModalFormProfileAddress({
                            open: false,
                            data: null,
                        })
                    }
                    disabled={isLoadingProfileAddress}
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    type="primary"
                    key="submit"
                    onClick={() => form.submit()}
                    loading={isLoadingProfileAddress}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item label="Customer" shouldUpdate className="mb-10">
                    {() => (
                        <Typography.Text className="ant-form-text">
                            {toggleModalFormProfileAddress.data?.fullname}
                        </Typography.Text>
                    )}
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Type"
                    rules={[validateRules.required()]}
                >
                    <Radio.Group>
                        <Radio value="Bill">Bill</Radio>
                        <Radio value="Ship">Ship</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item name="address">
                    <FloatTextArea label="Address" placeholder="Address" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
