import { useState } from "react";
import { Alert, Button, Card, Form, Layout, Typography } from "antd";
import dayjs from "dayjs";

import { GET, POST } from "../../../providers/useAxiosQuery";
import { description, logo } from "../../../providers/appConfig";
import validateRules from "../../../providers/validateRules";
import FloatInput from "../../../providers/FloatInput";
import FloatSelect from "../../../providers/FloatSelect";
import notificationErrors from "../../../providers/notificationErrors";

export default function PageRegister() {
    const [errorMessageLogin, setErrorMessageLogin] = useState({
        type: "",
        message: "",
    });

    const [dataCourse, setDataCourse] = useState([]);

    const { data: dataDepartment } = GET(
        `api/department_with_course`,
        "department_with_course",
    );

    const { mutate: mutateRegister, isLoading: isLoadingRegister } = POST(
        "api/register",
        "register",
    );

    const onFinishRegistration = (values) => {
        mutateRegister(values, {
            onSuccess: (res) => {
                // console.log("res", res);
                if (res.success) {
                    setErrorMessageLogin({
                        type: "success",
                        message: res.message,
                    });
                } else {
                    setErrorMessageLogin({
                        type: "error",
                        message: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    return (
        <Layout.Content>
            <div className="main-content">
                <div className="left-content">
                    <div className="content-wrapper">
                        <div className="logo-wrapper zoom-in-out-box-1">
                            <img src={logo} alt="" />
                        </div>
                    </div>
                </div>

                <div className="right-content">
                    <Card className="card-login">
                        <Typography.Title
                            level={4}
                            className="mt-0 mb-20 text-center"
                        >
                            Registration
                        </Typography.Title>

                        <Form
                            onFinish={onFinishRegistration}
                            autoComplete="off"
                        >
                            <Form.Item
                                name="email"
                                rules={[
                                    validateRules.required,
                                    validateRules.email,
                                ]}
                            >
                                <FloatInput
                                    label="E-mail"
                                    placeholder="E-mail"
                                    type="email"
                                    required
                                />
                            </Form.Item>

                            <Form.Item
                                name="username"
                                rules={[validateRules.required]}
                            >
                                <FloatInput
                                    label="Student ID"
                                    placeholder="Student ID"
                                    required
                                />
                            </Form.Item>

                            <Form.Item
                                name="firstname"
                                rules={[validateRules.required]}
                            >
                                <FloatInput
                                    label="First Name"
                                    placeholder="First Name"
                                    required
                                />
                            </Form.Item>

                            <Form.Item name="middlename">
                                <FloatInput
                                    label="Middle Name"
                                    placeholder="Middle Name"
                                />
                            </Form.Item>

                            <Form.Item
                                name="lastname"
                                rules={[validateRules.required]}
                            >
                                <FloatInput
                                    label="Last Name"
                                    placeholder="Last Name"
                                    required
                                />
                            </Form.Item>

                            <Form.Item
                                name="name_ext"
                                rules={[validateRules.required]}
                            >
                                <FloatInput
                                    label="Name Ext."
                                    placeholder="Name Ext."
                                    required
                                />
                            </Form.Item>

                            <Form.Item name="gender">
                                <FloatSelect
                                    label="Gender"
                                    placeholder="Gender"
                                    options={[
                                        {
                                            value: "Male",
                                            label: "Male",
                                        },
                                        {
                                            value: "Female",
                                            label: "Female",
                                        },
                                    ]}
                                />
                            </Form.Item>

                            <Form.Item
                                name="department_id"
                                rules={[validateRules.required]}
                            >
                                <FloatSelect
                                    label="Department"
                                    placeholder="Department"
                                    required
                                    options={
                                        dataDepartment && dataDepartment.data
                                            ? dataDepartment.data.map(
                                                  (item) => ({
                                                      value: item.id,
                                                      label: item.department_name,
                                                  }),
                                              )
                                            : []
                                    }
                                    onChange={(e) => {
                                        if (e) {
                                            let departments =
                                                dataDepartment.data.find(
                                                    (f) => f.id === e,
                                                );
                                            if (departments) {
                                                setDataCourse(
                                                    departments.courses,
                                                );
                                            } else {
                                                setDataCourse([]);
                                            }
                                        } else {
                                            setDataCourse([]);
                                        }
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="course_id"
                                rules={[validateRules.required]}
                            >
                                <FloatSelect
                                    label="Course"
                                    placeholder="Course"
                                    required
                                    options={
                                        dataCourse
                                            ? dataCourse.map((item) => ({
                                                  value: item.id,
                                                  label: item.course_name,
                                              }))
                                            : []
                                    }
                                />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isLoadingRegister}
                                className="mt-10 mb-10 btn-log-in"
                                block
                            >
                                Register
                            </Button>

                            {/* <Typography.Link href="login" target="_blank" italic>
						Forgot Password?
					</Typography.Link> */}

                            {errorMessageLogin.message && (
                                <Alert
                                    className="mt-10"
                                    type={errorMessageLogin.type}
                                    message={errorMessageLogin.message}
                                />
                            )}
                        </Form>
                    </Card>
                </div>
            </div>

            <Layout.Footer>
                <Typography.Text>
                    {`© ${dayjs().format("YYYY")} ${description}. All Rights
                        Reserved.`}
                </Typography.Text>
            </Layout.Footer>
        </Layout.Content>
    );
}
