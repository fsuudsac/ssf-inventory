import { useContext } from "react";
import { Col, Form, Row } from "antd";

import validateRules from "../../../../providers/validateRules";
import FloatInput from "../../../../providers/FloatInput";
import FloatInputMask from "../../../../providers/FloatInputMask";
import PageUserFormContext from "./PageUserFormContext";

export default function UserFormCollapseItemPrimaryContact() {
    const { formDisabled, params, handleDebounce } =
        useContext(PageUserFormContext);

    return (
        <Row gutter={[20, 0]}>
            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item name="email">
                    <FloatInput
                        label="Email"
                        placeholder="Email"
                        disabled={params.id ? true : formDisabled}
                        onChange={(e) => {
                            handleDebounce({
                                field: "email",
                                value: e.target.value,
                            });
                        }}
                    />
                </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                <Form.Item name="contact_no" rules={[validateRules.phone]}>
                    <FloatInputPhone
                        label="Contact Number"
                        placeholder="Contact Number"
                        international={true}
                        defaultCountry="PH"
                        onChange={(value) => {
                            handleDebounce({
                                field: "contact_no",
                                value: value || "",
                            });
                        }}
                    />
                    {/* <FloatInputMask
                        label="Contact Number"
                        placeholder="Contact Number"
                        maskLabel="contact_no"
                        maskType="(+63) 999 999 9999"
                        onChange={(e) => {
                            handleDebounce({
                                field: "contact_no",
                                value: e.target.value,
                            });
                        }}
                    /> */}
                </Form.Item>
            </Col>
        </Row>
    );
}
