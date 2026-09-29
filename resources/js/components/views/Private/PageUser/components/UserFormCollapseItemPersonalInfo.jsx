import { useContext, useEffect, useState } from "react";
import {
    Button,
    Col,
    Divider,
    Flex,
    Form,
    Input,
    notification,
    Row,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";
import optionGender from "../../../../providers/optionGender";
import FloatInput from "../../../../providers/FloatInput";
import FloatSelect from "../../../../providers/FloatSelect";
import FloatInputPhone from "../../../../providers/FloatInputPhone";
import notificationErrors from "../../../../providers/notificationErrors";
import PageUserFormContext from "./PageUserFormContext";

export default function UserFormCollapseItemPersonalInfo({
    dataUserRole,
    setRoleType,
}) {
    const { form, handleDebounce, formDisabled, location } =
        useContext(PageUserFormContext);

    const [companyValue, setCompanyValue] = useState("");
    const [dataCompany, setDataCompany] = useState([]);
    const [initialCompanyName, setInitialCompanyName] = useState(null);

    // console.log("companyValue: ", companyValue);
    // console.log("initialCompanyName: ", initialCompanyName);
    // console.log("dataCompany: ", dataCompany);

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

    const { data: dataDepartment } = GET(
        `api/department`,
        "department_dropdown",
        (res) => {},
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

    useEffect(() => {
        if (initialCompanyName) {
            form.setFieldsValue({ firstname: initialCompanyName });
        }
    }, [initialCompanyName, form]);

    return (
        <Row gutter={[20, 0]}>
            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item name="role_type" rules={[validateRules.required]}>
                    <FloatSelect
                        label="Role"
                        placeholder="Role"
                        required={true}
                        options={
                            dataUserRole?.data?.length > 0
                                ? dataUserRole.data
                                      .sort((a, b) => a.id - b.id)
                                      .map((item) => ({
                                          value: item.role,
                                          label: item.role,
                                      }))
                                : []
                        }
                        disabled={formDisabled}
                        onChange={(value) => {
                            handleDebounce({
                                field: "role",
                                value: value,
                            });
                            setRoleType(value);
                        }}
                    />
                </Form.Item>
            </Col>

            <Form.Item shouldUpdate noStyle>
                {() => {
                    const role_type = form.getFieldValue("role_type");

                    if (role_type === "Customer" || role_type === "Supplier") {
                        return (
                            <>
                                {role_type === "Customer" && (
                                    <Col
                                        xs={24}
                                        sm={24}
                                        md={24}
                                        lg={12}
                                        xl={12}
                                        xxl={12}
                                    >
                                        <Form.Item name="customer_type">
                                            <FloatSelect
                                                label="Customer Type"
                                                placeholder="Customer Type"
                                                disabled={formDisabled}
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
                                                    {
                                                        value: "Fleet",
                                                        label: "Fleet",
                                                    },
                                                ]}
                                                onChange={(value) => {
                                                    handleDebounce({
                                                        field: "customer_type",
                                                        value: value,
                                                    });
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                )}

                                <Col
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={12}
                                    xl={12}
                                    xxl={12}
                                >
                                    <Form.Item
                                        name="company_id"
                                        rules={[validateRules.required]}
                                    >
                                        <FloatSelect
                                            label="Company"
                                            placeholder="Company"
                                            disabled={formDisabled}
                                            allowClear
                                            required
                                            options={
                                                dataCompany?.length > 0
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
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onBlur={(e) =>
                                                                setCompanyValue(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onPressEnter={() =>
                                                                handleAddCompany()
                                                            }
                                                            style={{
                                                                width: 140,
                                                                flex: "none",
                                                            }}
                                                        />

                                                        <Button
                                                            type="text"
                                                            icon={
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faPlus
                                                                    }
                                                                />
                                                            }
                                                            loading={
                                                                isLoadingCompany
                                                            }
                                                            onClick={() =>
                                                                handleAddCompany()
                                                            }
                                                            disabled={
                                                                !companyValue
                                                            }
                                                        >
                                                            Add
                                                        </Button>
                                                    </Flex>
                                                </>
                                            )}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={12}
                                    xl={12}
                                    xxl={12}
                                >
                                    <Form.Item name="taxpayer_identification">
                                        <FloatInput
                                            label="TIN"
                                            placeholder="TIN"
                                            disabled={formDisabled}
                                            onChange={(e) => {
                                                handleDebounce({
                                                    field: "taxpayer_identification",
                                                    value: e.target.value,
                                                });
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                            </>
                        );
                    }

                    // Employee
                    return (
                        <>
                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={12}
                                xl={12}
                                xxl={12}
                            >
                                <Form.Item
                                    name="department_id"
                                    rules={[validateRules.required]}
                                >
                                    <FloatSelect
                                        label="Department"
                                        placeholder="Department"
                                        disabled={formDisabled}
                                        allowClear
                                        required
                                        options={
                                            dataDepartment?.data?.length > 0
                                                ? dataDepartment.data
                                                      .map((item) => ({
                                                          label: item.department_name,
                                                          value: item.id,
                                                      }))
                                                      .sort((a, b) =>
                                                          a.label.localeCompare(
                                                              b.label,
                                                          ),
                                                      )
                                                : []
                                        }
                                        onChange={(value) => {
                                            handleDebounce({
                                                field: "department_id",
                                                value,
                                            });
                                        }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={12}
                                xl={12}
                                xxl={12}
                            >
                                <Form.Item
                                    name="school_id"
                                    rules={[validateRules.required]}
                                >
                                    <FloatInput
                                        label="School ID"
                                        placeholder="School ID"
                                        required={true}
                                        disabled={formDisabled}
                                        onChange={(e) => {
                                            handleDebounce({
                                                field: "school_id",
                                                value: e.target.value,
                                            });
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                        </>
                    );
                }}
            </Form.Item>

            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item name="firstname" rules={[validateRules.required]}>
                    <FloatInput
                        label="First Name"
                        placeholder="First Name"
                        required={true}
                        disabled={formDisabled}
                        onChange={(e) => {
                            handleDebounce({
                                field: "firstname",
                                value: e.target.value,
                            });
                        }}
                    />
                </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item name="middlename">
                    <FloatInput
                        label="Middle Name"
                        placeholder="Middle Name"
                        disabled={formDisabled}
                        onChange={(e) => {
                            handleDebounce({
                                field: "middlename",
                                value: e.target.value,
                            });
                        }}
                    />
                </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item name="lastname" rules={[validateRules.required]}>
                    <FloatInput
                        label="Last Name"
                        placeholder="Last Name"
                        disabled={formDisabled}
                        onChange={(e) => {
                            handleDebounce({
                                field: "lastname",
                                value: e.target.value,
                            });
                        }}
                        required
                    />
                </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item name="name_ext">
                    <FloatInput
                        label="Name Ext"
                        placeholder="Name Ext"
                        disabled={formDisabled}
                        onChange={(e) => {
                            handleDebounce({
                                field: "name_ext",
                                value: e.target.value,
                            });
                        }}
                    />
                </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item name="gender">
                    <FloatSelect
                        label="Gender"
                        placeholder="Gender"
                        disabled={formDisabled}
                        options={optionGender}
                        onChange={(e) => {
                            handleDebounce({
                                field: "gender",
                                value: e,
                            });
                        }}
                    />
                </Form.Item>
            </Col>

            <Form.Item shouldUpdate noStyle>
                {() => {
                    const role_type = form.getFieldValue("role_type");

                    if (role_type === "Customer" || role_type === "Supplier") {
                        return (
                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={12}
                                xl={12}
                                xxl={12}
                            >
                                <Form.Item
                                    name="contact_number"
                                    rules={[
                                        validateRules.required,
                                        validateRules.phone_international,
                                    ]}
                                >
                                    <FloatInputPhone
                                        international={true}
                                        required={true}
                                        label="Contact Number"
                                        placeholder="Contact Number"
                                        defaultCountry="PH"
                                    />
                                </Form.Item>
                            </Col>
                        );
                    }
                }}
            </Form.Item>
        </Row>
    );
}
