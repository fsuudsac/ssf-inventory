import { useNavigate, useParams } from "react-router-dom";
import { Button, Col, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/pro-regular-svg-icons";

import { apiUrl } from "../../../providers/appConfig";

export default function PageSalesView() {
    const params = useParams();
    const navigate = useNavigate();

    return (
        <Row gutter={[20, 20]}>
            <Col sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Button
                    className="btn-main-invert-outline b-r-none"
                    icon={<FontAwesomeIcon icon={faArrowLeft} />}
                    onClick={() => navigate(-1)}
                >
                    Back to list
                </Button>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                {params && params.id ? (
                    <iframe
                        src={apiUrl(`api/sales_preview/${params?.id}`)}
                        frameBorder="0"
                        style={{ width: "100%", height: "100vh" }}
                    />
                ) : (
                    <div className="text-center">No Data Found</div>
                )}
            </Col>
        </Row>
    );
}
