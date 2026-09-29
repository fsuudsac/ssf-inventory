import { Col, Row } from "antd";
import Highcharts from "highcharts";

import { GET } from "../../../providers/useAxiosQuery";
import leftArrow from "../../../assets/img/left-arrow.png";
import highchartsSetOptions from "../../../providers/highchartsSetOptions";
import PageReportContext from "./components/PageReportContext";
import GraphRevenue from "./components/GraphRevenue";
import ReportStatementOfProfitOrLoss from "./components/ReportStatementOfProfitOrLoss";
import GraphRevenueForcast from "./components/GraphRevenueForcast";

// require("highcharts/modules/accessibility")(Highcharts);
// require("highcharts/modules/exporting")(Highcharts);
// require("highcharts/modules/export-data")(Highcharts);
// require("highcharts/modules/boost")(Highcharts);
// require("highcharts/modules/variable-pie")(Highcharts);

import "highcharts/modules/accessibility";
import "highcharts/modules/exporting";
import "highcharts/modules/export-data";
import "highcharts/modules/boost";
import "highcharts/modules/variable-pie";

export default function PageReport() {
    highchartsSetOptions(Highcharts);

    const { data: dataProductDetails } = GET(
        `api/product_details`,
        "product_details_dropdown",
        () => {},
        false,
    );

    return (
        <PageReportContext.Provider
            value={{
                Highcharts,
                leftArrow,
                dataProductDetails:
                    dataProductDetails && dataProductDetails.data
                        ? dataProductDetails.data
                        : [],
            }}
        >
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={24} md={14} lg={16} xl={18}>
                    <Row gutter={[20, 20]}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                            <GraphRevenue />
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                            <GraphRevenueForcast />
                        </Col>
                    </Row>
                </Col>
                <Col xs={24} sm={24} md={10} lg={8} xl={6}>
                    <ReportStatementOfProfitOrLoss />
                </Col>
            </Row>
        </PageReportContext.Provider>
    );
}
