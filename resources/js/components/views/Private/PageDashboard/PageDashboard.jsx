import { Col, Row } from "antd";
import Highcharts from "highcharts";

import leftArrow from "../../../assets/img/left-arrow.png";
import highchartsSetOptions from "../../../providers/highchartsSetOptions";
import PageDashboardContext from "./components/PageDashboardContext";
import ListCard from "./components/ListCard";
import GraphRevenue from "./components/GraphRevenue";
import GraphProducts from "./components/GraphProducts";
import PurchaseDueList from "./components/PurchaseDueList";
import SalesDueList from "./components/SalesDueList";
import StatementOfProfitOrLoss from "./components/StatementOfProfitOrLoss";
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

export default function PageDashboard() {
    highchartsSetOptions(Highcharts);

    return (
        <PageDashboardContext.Provider
            value={{
                Highcharts,
                leftArrow,
            }}
        >
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                    <ListCard />
                </Col>

                <Col xs={24} sm={24} md={24} lg={14} xl={16} xxl={16}>
                    <Row gutter={[20, 20]}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                            <GraphRevenue />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                            <GraphProducts />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                            <GraphRevenueForcast />
                        </Col>
                    </Row>
                </Col>

                <Col xs={24} sm={24} md={24} lg={10} xl={8} xxl={8}>
                    <Row gutter={[20, 20]}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                            <PurchaseDueList />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                            <SalesDueList />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                            <StatementOfProfitOrLoss />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </PageDashboardContext.Provider>
    );
}
