import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Col, Form, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/pro-regular-svg-icons";

import PageEmployeeContext from "./components/PageEmployeeContext";
import FloatInput from "../../../providers/FloatInput";

export default function PageEmployeeForm() {
    const params = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log("onFinish values: ", values);
    };

    return (
        <PageEmployeeContext.Provider value={{ form }}>
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                    <Button
                        type="link"
                        icon={<FontAwesomeIcon icon={faArrowLeft} />}
                        onClick={() => navigate(-1)}
                        className="p-0 w-auto"
                    >
                        Back
                    </Button>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                    <Form form={form} onFinish={onFinish}>
                        <Row gutter={[20, 20]}>
                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={24}
                                xl={24}
                                xxl={24}
                            >
                                <Card title="Basic Information">
                                    <Row gutter={[20, 20]}></Row>
                                </Card>
                                <Form.Item name="firstname">
                                    <FloatInput label="Fist Name" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </PageEmployeeContext.Provider>
    );
}
