import { useState } from "react";
import {
    Alert,
    Button,
    Card,
    Col,
    Flex,
    Form,
    Layout,
    Row,
    Typography,
} from "antd";

import { POST } from "../../../providers/useAxiosQuery";
import {
    appDescription,
    appLogo,
    appName,
    encrypt,
} from "../../../providers/appConfig";
import validateRules from "../../../providers/validateRules";
import FloatInput from "../../../providers/FloatInput";
import FloatInputPassword from "../../../providers/FloatInputPassword";

export default function PageLogin() {
    const [errorMessage, setErrorMessage] = useState(null);

    const { mutate: mutateLogin, isLoading: isLoadingLogin } =
        POST("api/login");

    const onFinish = (values) => {
        mutateLogin(values, {
            onSuccess: (res) => {
                if (res.data) {
                    localStorage.userdata = encrypt(JSON.stringify(res.data));
                    localStorage.token = res.token;
                    window.location.reload();
                } else {
                    setErrorMessage(res.message);
                }
            },
            onError: (error) => {
                console.log("Error: ", error);

                setErrorMessage(error.response.data.message);
            },
        });
    };

    return (
        <Layout.Content className="flex justify-center items-center h-full">
            <Row gutter={[20, 20]} className="w-full">
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Flex
                        justify="end"
                        align="center"
                        className="h-full"
                        gap={20}
                    >
                        <img src={appLogo} className="w-50" />

                        <Flex vertical>
                            <Typography.Title
                                level={1}
                                className="mb-0! leading-normal text-white!"
                            >
                                {appName}
                            </Typography.Title>
                            <Typography.Title
                                level={5}
                                className="m-0! text-white!"
                            >
                                {appDescription}
                            </Typography.Title>
                        </Flex>
                    </Flex>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Card className="w-lg">
                        <Typography.Title
                            level={3}
                            className="text-center mb-5!"
                        >
                            Account Login
                        </Typography.Title>

                        <Form layout="vertical" onFinish={onFinish}>
                            <Form.Item
                                name="email"
                                rules={[validateRules.required()]}
                            >
                                <FloatInput label="Username/Email" />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[validateRules.required()]}
                            >
                                <FloatInputPassword
                                    label="Password"
                                    autoComplete="new-password"
                                />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                shape="round"
                                loading={isLoadingLogin}
                            >
                                Submit
                            </Button>

                            {errorMessage && (
                                <Alert
                                    className="mt-5!"
                                    type="error"
                                    message={
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: errorMessage,
                                            }}
                                        />
                                    }
                                />
                            )}
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Layout.Content>
    );
}
