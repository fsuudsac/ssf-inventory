import { useContext, useState } from "react";
import { Button, Col, Form, Row } from "antd";

import validateRules from "../../../../providers/validateRules";
import FloatInput from "../../../../providers/FloatInput";
import FloatInputPassword from "../../../../providers/FloatInputPassword";
import ModalFormPassword from "./ModalFormPassword";
import ModalFormEmail from "./ModalFormEmail";
import PageUserFormContext from "./PageUserFormContext";

export default function UserFormCollapseItemAccountInfo() {
    const { formDisabled, params } = useContext(PageUserFormContext);

    const [toggleModalFormEmail, setToggleModalFormEmail] = useState({
        open: false,
        data: null,
    });

    const [toggleModalFormPassword, setToggleModalFormPassword] = useState({
        open: false,
        data: null,
    });

    return (
        <Row gutter={[20, 0]}>
            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item name="username" rules={[validateRules.required()]}>
                    <FloatInput
                        label="Username"
                        placeholder="Username"
                        required
                        disabled={params.id ? true : formDisabled}
                    />
                </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item
                    name="email"
                    rules={[validateRules.required(), validateRules.email]}
                >
                    <FloatInput
                        label="Email"
                        placeholder="Email"
                        required={true}
                        disabled={params.id ? true : formDisabled}
                    />
                </Form.Item>
            </Col>

            {location.pathname.includes("user") && !params.id ? (
                <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                    <Form.Item
                        name="password"
                        rules={[validateRules.required()]}
                    >
                        <FloatInputPassword
                            label="Password"
                            placeholder="Password"
                            required
                            autoComplete="new-password"
                            disabled={formDisabled}
                        />
                    </Form.Item>
                </Col>
            ) : null}

            {params.id ? (
                <Col xs={24} sm={24} md={24} lg={24}>
                    <Button
                        type="link"
                        className="p-0 w-auto h-auto"
                        onClick={() =>
                            setToggleModalFormEmail({
                                open: true,
                                data: {
                                    id: params.id,
                                },
                            })
                        }
                    >
                        Change Email
                    </Button>
                </Col>
            ) : null}

            {params.id ? (
                <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                    <Button
                        type="link"
                        className="p-0 w-auto h-auto"
                        onClick={() =>
                            setToggleModalFormPassword({
                                open: true,
                                data: {
                                    id: params.id,
                                },
                            })
                        }
                    >
                        Change Password
                    </Button>
                </Col>
            ) : null}

            <ModalFormEmail
                toggleModalFormEmail={toggleModalFormEmail}
                setToggleModalFormEmail={setToggleModalFormEmail}
            />

            <ModalFormPassword
                toggleModalFormPassword={toggleModalFormPassword}
                setToggleModalFormPassword={setToggleModalFormPassword}
            />
        </Row>
    );
}
