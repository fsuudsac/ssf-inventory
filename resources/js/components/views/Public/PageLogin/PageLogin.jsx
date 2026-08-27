import { useState } from "react";
import { Layout, Typography, Card, Alert, Form, Button } from "antd";
import dayjs from "dayjs";

import { POST } from "../../../providers/useAxiosQuery";
import { encrypt, appDescription } from "../../../providers/appConfig";
import validateRules from "../../../providers/validateRules";
import FloatInput from "../../../providers/FloatInput";
import FloatInputPassword from "../../../providers/FloatInputPassword";

export default function PageLogin() {
    const [errorMessageLogin, setErrorMessageLogin] = useState({
        type: "",
        message: "",
    });

    const { mutate: mutateLogin, isLoading: isLoadingButtonLogin } = POST(
        "api/login",
        "login",
    );

    const onFinishLogin = (values) => {
        mutateLogin(values, {
            onSuccess: (res) => {
                // console.log("res", res);
                if (res.data) {
                    localStorage.userdata = encrypt(JSON.stringify(res.data));
                    localStorage.token = res.token;
                    window.location.reload();
                } else {
                    setErrorMessageLogin({
                        type: "error",
                        message: res.message,
                    });
                }
            },
            onError: (err) => {
                setErrorMessageLogin({
                    type: "error",
                    message: (
                        <div>
                            Unrecognized username or password.{" "}
                            <b>Forgot your password?</b>
                        </div>
                    ),
                });
            },
        });
    };

    return (
        <Layout.Content>
            <div className="main-content">
                <div className="content-content">
                    <div className="logo-wrapper">
                        {/* <img src={logo} alt="" /> */}
                        <img width={250} src="/images/logo.png" alt="" />
                    </div>
                    <Card className="card-login">
                        <Form onFinish={onFinishLogin} autoComplete="off">
                            <Form.Item
                                name="email"
                                rules={[validateRules.required]}
                            >
                                <FloatInput
                                    label="Username / E-mail"
                                    placeholder="Username / E-mail"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[validateRules.required]}
                            >
                                <FloatInputPassword
                                    label="Password"
                                    placeholder="Password"
                                />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isLoadingButtonLogin}
                                className="mt-10 mb-10 btn-log-in"
                                block
                            >
                                Log In
                            </Button>

                            {/* <Typography.Link
                                href="login"
                                target="_blank"
                                italic
                            >
                                Forgot Password?
                            </Typography.Link> */}

                            {errorMessageLogin.message && (
                                <Alert
                                    className="mt-10"
                                    type={errorMessageLogin.type}
                                    message={
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: errorMessageLogin.message,
                                            }}
                                        />
                                    }
                                />
                            )}
                        </Form>
                    </Card>
                </div>
            </div>

            <Layout.Footer>
                <Typography.Text>
                    {`© ${dayjs().year()} ${appDescription}. All Rights
                        Reserved.`}
                </Typography.Text>
            </Layout.Footer>
        </Layout.Content>
    );
}
