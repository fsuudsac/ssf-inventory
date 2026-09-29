import { useContext } from "react";
import {
    Modal,
    Button,
    Form,
    notification,
    Radio,
    Typography,
    Popconfirm,
    Row,
    Col,
} from "antd";

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
                    key="cancel"
                    type="default"
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
                <Popconfirm
                    key="submit"
                    title="Are you sure you want to submit this address?"
                    onConfirm={() => form.submit()}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                        className: "btn-main-invert",
                    }}
                    disabled={isLoadingProfileAddress}
                >
                    <Button type="primary" loading={isLoadingProfileAddress}>
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
                <Row gutter={[12, 0]}>
                    <Col
                        xs={24}
                        sm={24}
                        md={24}
                        lg={24}
                        xl={24}
                        xxl={24}
                        className="mb-10!"
                    >
                        <Typography.Text className="ant-form-text">
                            {toggleModalFormProfileAddress.data?.fullname}
                        </Typography.Text>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
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
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                        <Form.Item name="address">
                            <FloatTextArea
                                label="Address"
                                placeholder="Address"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
