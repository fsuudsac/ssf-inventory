import { useEffect, useState } from "react";
import {
    Modal,
    Button,
    Form,
    notification,
    Row,
    Col,
    Divider,
    Input,
    Flex,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import FloatSelect from "../../../../providers/FloatSelect";
import FloatInput from "../../../../providers/FloatInput";
import FloatTextArea from "../../../../providers/FloatTextArea";
import FloatInputMask from "../../../../providers/FloatInputMask";
import notificationErrors from "../../../../providers/notificationErrors";

export default function ModalFormSupplier(props) {
    const { toggleModalFormSupplier, setToggleModalFormSupplier } = props;

    // console.log(":toggleModalFormSupplier: ", toggleModalFormSupplier);

    const [form] = Form.useForm();
    const [companyValue, setCompanyValue] = useState("");
    const [dataCompany, setDataCompany] = useState([]);

    GET(
        `api/company`,
        "company_dropdown",
        (res) => {
            if (res.data && res.data.length > 0) {
                setDataCompany(res.data);
            }
        },
        false,
    );

    const { mutate: mutateCompany, isLoading: isLoadingCompany } = POST(
        `api/company`,
        "company_create",
    );

    const handleAddCompany = () => {
        let data = { company: companyValue };

        mutateCompany(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setCompanyValue(null);
                    setDataCompany((prev) => [...prev, res.data]);
                    form.setFieldValue("company_id", res.data.id);

                    notification.success({
                        message: "Company",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Company",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const { mutate: mutateSuppliers, isLoading: isLoadingImportSuppliers } =
        POST(`api/supplier`, ["supplier_list", "users_supplier"]);

    const onFinish = (values) => {
        let data = {
            ...values,
            id: toggleModalFormSupplier.data
                ? toggleModalFormSupplier.data.id
                : null,
        };

        mutateSuppliers(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Supplier",
                        description: res.message,
                    });
                    setToggleModalFormSupplier({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                } else {
                    notification.error({
                        message: "Supplier",
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
        if (toggleModalFormSupplier.open) {
            if (toggleModalFormSupplier.data) {
                let data = toggleModalFormSupplier.data;
                let profile = data.profile;
                delete profile.id;

                let profileAddresses = profile.profile_addresses || [];

                // Filter addresses with status 1 and remove duplicates
                let uniqueAddresses = profileAddresses
                    .filter((address) => address.status === 1)
                    .reduce((unique, address) => {
                        if (!unique.some((a) => a.id === address.id)) {
                            unique.push(address);
                        }
                        return unique;
                    }, []);

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
    }, [toggleModalFormSupplier]);

    return (
        <Modal
            wrapClassName="wrap-modal-form-module wrap-modal-form-supplier"
            title="Form Add Supplier"
            open={toggleModalFormSupplier.open}
            onCancel={() => {
                setToggleModalFormSupplier({
                    open: false,
                    data: null,
                });
            }}
            forceRender
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalFormSupplier({
                            open: false,
                            data: null,
                        });
                        // form.resetFields();
                    }}
                    disabled={isLoadingImportSuppliers}
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={isLoadingImportSuppliers}
                    name="btn_submit"
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form
                form={form}
                onFinish={onFinish}
                initialValues={{ profile_addresses: [{}] }}
            >
                <Row gutter={[12, 0]}>
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
                        <Form.Item
                            name="company_id"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="Company"
                                placeholder="Company"
                                allowClear
                                required
                                options={dataCompany
                                    .map((item) => ({
                                        value: item.id,
                                        label: item.company,
                                    }))
                                    .sort((a, b) =>
                                        a.label.localeCompare(b.label),
                                    )}
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
                                                placeholder="Add Company"
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
                        <Form.Item
                            name="taxpayer_identification"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput
                                label="TIN"
                                placeholder="TIN"
                                required
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item name="salutation">
                            <FloatSelect
                                label="Mr./Mrs./Ms."
                                placeholder="Mr./Mrs./Ms."
                                options={[
                                    { label: "Mr.", value: "Mr." },
                                    { label: "Mrs.", value: "Mrs." },
                                    { label: "Ms.", value: "Ms." },
                                ]}
                                allowClear
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                        <Divider orientation="left">
                            Contact Information
                        </Divider>
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
                            rules={[
                                validateRules.phone,
                                validateRules.required(),
                            ]}
                        >
                            <FloatInputMask
                                label="Contact No."
                                placeholder="Contact No."
                                maskLabel="contact_no"
                                maskType="(+63) 999 999 9999"
                                required
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                        <Form.Item name="email" rules={[validateRules.email]}>
                            <FloatInput label="Email" placeholder="Email" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                        <Form.List name="profile_addresses">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(
                                        ({ key, name, ...restField }) => (
                                            <Row key={key} gutter={[12, 0]}>
                                                <Col
                                                    xs={24}
                                                    sm={24}
                                                    md={24}
                                                    lg={24}
                                                    xl={24}
                                                    xxl={24}
                                                    className="text-right"
                                                >
                                                    <Button
                                                        className="btn-main-primary p-0 w-0 h-0"
                                                        onClick={() =>
                                                            remove(name)
                                                        }
                                                        type="link"
                                                        icon={
                                                            <FontAwesomeIcon
                                                                icon={faTrash}
                                                            />
                                                        }
                                                    />
                                                </Col>

                                                <Col
                                                    xs={24}
                                                    sm={24}
                                                    md={24}
                                                    lg={24}
                                                    xl={24}
                                                    xxl={24}
                                                >
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, "address"]}
                                                    >
                                                        <FloatTextArea
                                                            label="Address"
                                                            placeholder="Address"
                                                            required
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        ),
                                    )}

                                    <Button
                                        className="btn-main-primary p-0 w-0 h-0"
                                        onClick={() => add()}
                                        type="link"
                                        icon={<FontAwesomeIcon icon={faPlus} />}
                                    >
                                        Add New Address
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
