import { useContext, useEffect, useState } from "react";
import {
    Modal,
    Button,
    Form,
    notification,
    Row,
    Col,
    Divider,
    Flex,
    Input,
    Radio,
} from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import { POST } from "../../../../providers/useAxiosQuery";
import FloatSelect from "../../../../providers/FloatSelect";
import FloatInput from "../../../../providers/FloatInput";
import FloatTextArea from "../../../../providers/FloatTextArea";
import FloatInputMask from "../../../../providers/FloatInputMask";
import validateRules from "../../../../providers/validateRules";
import notificationErrors from "../../../../providers/notificationErrors";
import PageFormSalesContext from "./PageFormSalesContext";

export default function ModalFormCustomer() {
    const {
        toggleModalFormCustomer,
        setToggleModalFormCustomer,
        companyValue,
        setCompanyValue,
        dataCompany,
        handleAddCompany,
        refetchDataCustomers,
    } = useContext(PageFormSalesContext);

    const [form] = Form.useForm();
    const [addressType, setAddressType] = useState(null);

    const { mutate: mutateAddCustomer, isLoading: isLoadingCustomer } = POST(
        `api/users`,
        "create_users_info",
    );

    const onFinish = (values) => {
        let data = new FormData();

        data.append("email", values.email);
        data.append("firstname", values.firstname);
        data.append("middlename", values.middlename ?? "");
        data.append("lastname", values.lastname ?? "");
        data.append("name_ext", values.name_ext ?? "");
        data.append("gender", values.gender ?? "");
        data.append("contact_no", values.contact_no ?? "");

        data.append("role", "Customer");
        data.append("customer_type", values.customer_type ?? "");
        data.append("company_id", values.company_id ?? "");
        data.append(
            "taxpayer_identification",
            values.taxpayer_identification ?? "",
        );

        data.append("type", values.type);
        data.append("address", values.address);
        data.append("status", "Active");

        mutateAddCustomer(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Customer",
                        description: res.message,
                    });
                    setToggleModalFormCustomer({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    refetchDataCustomers();
                } else {
                    notification.error({
                        message: "Customer",
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
        if (toggleModalFormCustomer.open) {
            if (toggleModalFormCustomer.data) {
                let data = toggleModalFormCustomer.data;
                let profile = data.profile;
                delete profile.id;

                let profileAddress = data.profile.profile_addresses;

                let filteredAddresses = profileAddress.filter(
                    (address) => address.status === 1,
                );

                // Remove duplicates
                let uniqueAddresses = filteredAddresses.filter(
                    (address, index, self) =>
                        index === self.findIndex((a) => a.id === address.id),
                );

                form.setFieldsValue({
                    ...data,
                    ...profile,
                    profile_addresses: uniqueAddresses,
                });
            }
        } else {
            form.resetFields();
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormCustomer]);

    return (
        <Modal
            wrapClassName="wrap-modal-form-module wrap-modal-form-supplier"
            title="Form Add Customer"
            open={toggleModalFormCustomer.open}
            onCancel={() => {
                setToggleModalFormCustomer({
                    open: false,
                    data: null,
                });
            }}
            forceRender
            footer={[
                <Button
                    type="default"
                    key={1}
                    onClick={() => {
                        setToggleModalFormCustomer({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                    disabled={isLoadingCustomer}
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={isLoadingCustomer}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Row gutter={[12, 0]}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                        <Divider orientation="left">
                            Personal Information
                        </Divider>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item
                            name="customer_type"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="Customer Type"
                                placeholder="Customer Type"
                                allowClear
                                required
                                options={[
                                    {
                                        value: "Walk-In",
                                        label: "Walk-In",
                                    },
                                    {
                                        value: "Dealer",
                                        label: "Dealer",
                                    },
                                    {
                                        value: "Wholesale",
                                        label: "Wholesale",
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item
                            name="firstname"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput
                                label="First Name"
                                placeholder="First Name"
                                required
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item name="middlename">
                            <FloatInput
                                label="Middle Name"
                                placeholder="Middle Name"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item name="lastname">
                            <FloatInput
                                label="Last Name"
                                placeholder="Last Name"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item name="gender">
                            <FloatSelect
                                label="Gender"
                                placeholder="Gender"
                                options={[
                                    { label: "Male", value: "Male" },
                                    { label: "Female", value: "Female" },
                                ]}
                                allowClear
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item name="company_id">
                            <FloatSelect
                                label="Company/ Department"
                                placeholder="Company/ Department"
                                allowClear
                                options={
                                    dataCompany && dataCompany.length > 0
                                        ? dataCompany
                                              .map((item) => ({
                                                  value: item.id,
                                                  label: item.company,
                                              }))
                                              .sort((a, b) =>
                                                  a.label.localeCompare(
                                                      b.label,
                                                  ),
                                              )
                                        : []
                                }
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider
                                            style={{
                                                margin: "8px 0",
                                            }}
                                        />
                                        <Flex gap={10}>
                                            <Input
                                                value={companyValue}
                                                placeholder="Add Company/ Department"
                                                onChange={(e) =>
                                                    setCompanyValue(
                                                        e.target.value,
                                                    )
                                                }
                                                onBlur={(e) =>
                                                    setCompanyValue(
                                                        e.target.value,
                                                    )
                                                }
                                                onPressEnter={() =>
                                                    handleAddCompany()
                                                }
                                            />
                                            <Button
                                                type="text"
                                                icon={
                                                    <FontAwesomeIcon
                                                        icon={faPlus}
                                                    />
                                                }
                                                onClick={() =>
                                                    handleAddCompany()
                                                }
                                            />
                                        </Flex>
                                    </>
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item name="taxpayer_identification">
                            <FloatInput label="TIN" placeholder="TIN" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                        <Divider orientation="left">Primary Contact</Divider>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item
                            name="email"
                            rules={[validateRules.required]}
                        >
                            <FloatInput
                                label="Email"
                                placeholder="Email"
                                required
                            />
                        </Form.Item>
                    </Col>

                    <Col
                        xs={24}
                        sm={12}
                        md={12}
                        lg={12}
                        xl={12}
                        className="contact-info"
                    >
                        <Form.Item
                            name="contact_no"
                            rules={[validateRules.phone]}
                        >
                            <FloatInputPhone
                                label="Contact Number"
                                placeholder="Contact Number"
                                international={true}
                                defaultCountry="PH"
                            />
                            {/* <FloatInputMask
                                label="Contact No."
                                placeholder="Contact No."
                                maskLabel="contact_no"
                                maskType="(+63) 999 999 9999"
                            /> */}
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                        <Divider orientation="left">
                            Address Information
                        </Divider>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                        <Col span={24}>
                            <Form.Item name={"type"} className="m-0">
                                <Radio.Group
                                    onChange={(e) =>
                                        setAddressType(e.target.value)
                                    }
                                    value={addressType}
                                >
                                    <Radio value="Bill">Bill</Radio>
                                    <Radio value="Ship">Ship</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name={"address"}>
                                <FloatTextArea
                                    label="Address"
                                    placeholder="Address"
                                />
                            </Form.Item>
                        </Col>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
