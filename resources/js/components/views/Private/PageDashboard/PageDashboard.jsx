import { Row, Col } from "antd";

import Highcharts from "highcharts";
import "highcharts/modules/accessibility";
// import "highcharts/modules/no-data-to-display";
import "highcharts/modules/exporting";
import "highcharts/modules/export-data";
import "highcharts/modules/boost";

import highchartsSetOptions from "../../../providers/highchartsSetOptions";

export default function PageDashboard() {
    highchartsSetOptions(Highcharts);

    return (
        <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={16} xxl={16}></Col>
        </Row>
    );
}
