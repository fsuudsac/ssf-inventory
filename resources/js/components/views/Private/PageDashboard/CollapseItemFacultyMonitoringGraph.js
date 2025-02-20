import { useEffect, useState } from "react";
import { Row, Col, Form } from "antd";
import { GET } from "../../../providers/useAxiosQuery";

import leftArrow from "../../../assets/img/left-arrow.png";
import Highcharts from "highcharts";
import FloatSelect from "../../../providers/FloatSelect";

import { role } from "../../../providers/appConfig";

export default function FacultyMonitoringGraph() {
    const [filter, setFilter] = useState({
        action: "timely",
        time: "",
        day: "",
        month: "",
        status_id: "",
        department_id: "",
        user_role_id: role(),
    });

    const { refetch: refetchSource } = GET(
        `api/faculty_load_monitoring_graph?${new URLSearchParams(filter)}`,
        "faculty_load_monitoring_graph",
        (res) => {
            console.log("faculty_load_monitoring_graph", res);

            if (res.data) {
                let data = res.data;
                let action = res.data.action;

                let title = "CLASS SCHEDULE TIME";
                let subtitleText = "CLICK THE COLUMNS TO VIEW PER DAY";
                let xAxisTitle = "TIME";

                if (action === "timely") {
                    title = "CLASS SCHEDULE TIME";
                    subtitleText = "CLICK THE COLUMNS TO VIEW PER DAY";
                    xAxisTitle = "CLASS SCHEDULE TIME";
                } else if (action === "week_days") {
                    title = "WEEK DAYS";
                    subtitleText = "CLICK THE COLUMNS TO VIEW PER MONTH";
                    xAxisTitle = "DAY";
                } else if (action === "monthly") {
                    title = "MONTHLY";
                    subtitleText = "CLICK THE COLUMNS TO VIEW PER DAILY";
                    xAxisTitle = "MONTH";
                } else if (action === "daily") {
                    title = "DAILY";
                    subtitleText = "CLICK THE COLUMNS TO GO BACK TO PER YEAR";
                    xAxisTitle = "DAY";
                }

                let data_series_value_filter = data.data_series_value.filter(
                    (f) => f.y !== 0
                );

                if (data_series_value_filter.length === 0) {
                    subtitleText = "NO DATA TO VIEW";
                }

                if (document.getElementById("divFacultyMonitoringGraph")) {
                    let chart = Highcharts.chart(
                        "divFacultyMonitoringGraph",
                        {
                            chart: {
                                // zoomType: "x",
                                type: action === "timely" ? "bar" : "column",
                                events: {
                                    // load: function (event) {
                                    // 	event.target.reflow();
                                    // },
                                    click: function (e) {
                                        let action = data.action;
                                        let downTo = data.downTo;
                                        let series_name =
                                            data.data_series_name[
                                                Math.abs(
                                                    Math.round(e.xAxis[0].value)
                                                )
                                            ];

                                        if (action === "timely") {
                                            setFilter((prevState) => ({
                                                ...prevState,
                                                action: downTo,
                                                time: series_name,
                                            }));
                                        }

                                        if (action === "week_days") {
                                            setFilter((prevState) => ({
                                                ...prevState,
                                                action: downTo,
                                                day: series_name,
                                            }));
                                        }
                                        if (action === "monthly") {
                                            setFilter((prevState) => ({
                                                ...prevState,
                                                action: downTo,
                                                month: series_name,
                                            }));
                                        }
                                        if (action === "daily") {
                                            setFilter((prevState) => ({
                                                ...prevState,
                                                action: downTo,
                                            }));
                                        }

                                        let div_revenue_graph_wrapper =
                                            document.querySelector(
                                                "#divFacultyMonitoringGraph"
                                            );
                                        if (div_revenue_graph_wrapper) {
                                            let highchartsDataTable =
                                                div_revenue_graph_wrapper.querySelector(
                                                    ".highcharts-data-table"
                                                );
                                            if (highchartsDataTable) {
                                                highchartsDataTable.remove();
                                            }
                                        }
                                    },
                                },
                            },
                            title: {
                                text: title,
                            },
                            subtitle: {
                                text: subtitleText,
                            },
                            xAxis: {
                                title: {
                                    text: xAxisTitle,
                                    enabled: false,
                                },
                                categories: data.data_series_name,
                                crosshair: true,
                                type: "category",
                            },
                            yAxis: {
                                title: {
                                    text: null,
                                },
                                // labels: {
                                // 	formatter: function () {
                                // 		return `${Highcharts.numberFormat(this.value, 0, "", ",")}`;
                                // 	},
                                // },
                            },
                            tooltip: {
                                headerFormat:
                                    '<span style="font-size:10px">{point.key}</span><table>',
                                pointFormat:
                                    '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                                    '<td style="padding:0"><b>{point.y}</b></td></tr>',
                                footerFormat: "</table>",
                                shared: true,
                                useHTML: true,
                            },
                            legend: {
                                enabled: true,
                            },
                            plotOptions: {
                                series: {
                                    borderWidth: 0,
                                    dataLabels: {
                                        enabled: false,
                                        // format: "{point.y:.2f}",
                                    },
                                    cursor: "pointer",
                                },
                                bar: {
                                    events: {
                                        click: function (e) {
                                            let action = data.action;
                                            let downTo = data.downTo;

                                            if (action === "timely") {
                                                setFilter((prevState) => ({
                                                    ...prevState,
                                                    action: downTo,
                                                    time: e.point.category,
                                                }));
                                            }

                                            let div_revenue_graph_wrapper =
                                                document.querySelector(
                                                    "#divFacultyMonitoringGraph"
                                                );

                                            if (div_revenue_graph_wrapper) {
                                                let highchartsDataTable =
                                                    div_revenue_graph_wrapper.querySelector(
                                                        ".highcharts-data-table"
                                                    );
                                                if (highchartsDataTable) {
                                                    highchartsDataTable.remove();
                                                }
                                            }
                                        },
                                    },
                                },
                                column: {
                                    pointPadding: 0.2,
                                    borderWidth: 0,
                                    dataLabels: {
                                        enabled: false,
                                        // format: "{point.y:.0f}",
                                        formatter: function () {
                                            if (this.y === 0) {
                                                return null;
                                            }
                                            return this.y.toFixed(2);
                                        },
                                    },
                                    events: {
                                        click: function (e) {
                                            let action = data.action;
                                            let downTo = data.downTo;

                                            if (action === "week_days") {
                                                setFilter((prevState) => ({
                                                    ...prevState,
                                                    action: downTo,
                                                    day: e.point.category,
                                                }));
                                            }

                                            if (action === "monthly") {
                                                setFilter((prevState) => ({
                                                    ...prevState,
                                                    action: downTo,
                                                    month: e.point.category,
                                                }));
                                            }

                                            if (action === "daily") {
                                                setFilter((prevState) => ({
                                                    ...prevState,
                                                    action: downTo,
                                                }));
                                            }

                                            let div_revenue_graph_wrapper =
                                                document.querySelector(
                                                    "#divFacultyMonitoringGraph"
                                                );

                                            if (div_revenue_graph_wrapper) {
                                                let highchartsDataTable =
                                                    div_revenue_graph_wrapper.querySelector(
                                                        ".highcharts-data-table"
                                                    );
                                                if (highchartsDataTable) {
                                                    highchartsDataTable.remove();
                                                }
                                            }
                                        },
                                    },
                                },
                            },
                            series: data.data_series_value,
                            exporting: {
                                filename: `report-revenue-${title.toLowerCase()}`,
                                buttons: {
                                    contextButton: {
                                        symbolStroke: "#f58d13",
                                        symbolX: 14,
                                        menuItems: [
                                            "printChart",
                                            "separator",
                                            "downloadPNG",
                                            "downloadJPEG",
                                            "downloadPDF",
                                            "downloadSVG",
                                            "separator",
                                            // "downloadCSV",
                                            "toggleTable",
                                        ],
                                    },
                                },
                                menuItemDefinitions: {
                                    // Custom definition
                                    toggleTable: {
                                        onclick: function () {
                                            if (
                                                this.dataTableDiv &&
                                                this.dataTableDiv.style
                                                    .display !== "none"
                                            ) {
                                                this.dataTableDiv.style.display =
                                                    "none";
                                            } else {
                                                this.viewData();
                                                this.dataTableDiv.style.display =
                                                    "";
                                            }
                                        },
                                        text: "View Data Table",
                                    },
                                },
                            },
                        },
                        function (chart) {
                            // on complete

                            if (data.action !== "timely") {
                                let y = 65;
                                let x = 15;

                                // console.log("x: ", x, " y: ", y);
                                chart.renderer
                                    .image(
                                        leftArrow,
                                        chart.chartWidth - y,
                                        x,
                                        18,
                                        17
                                    )
                                    .add()
                                    .addClass("highcharts-button-arrow-left")
                                    .css({ cursor: "pointer" })
                                    .attr({ title: "Back" })
                                    .on("click", function () {
                                        // prcessing after image is clicked
                                        let action = res.data.action;

                                        if (action === "week_days") {
                                            setFilter((prevState) => ({
                                                ...prevState,
                                                action: "timely",
                                            }));
                                        }
                                        if (action === "monthly") {
                                            setFilter((prevState) => ({
                                                ...prevState,
                                                action: "week_days",
                                            }));
                                        }

                                        if (action === "daily") {
                                            setFilter((prevState) => ({
                                                ...prevState,
                                                action: "monthly",
                                            }));
                                        }
                                    });
                            }
                        }
                    );

                    Highcharts.addEvent(
                        chart,
                        "aftergetTableAST",
                        function (e) {
                            e.tree.children[2].children.forEach(function (row) {
                                row.children.forEach(function (cell, i) {
                                    if (i !== 0) {
                                        row.children[i].textContent =
                                            cell.textContent;
                                    }
                                });
                            });
                        }
                    );
                }
            }
        }
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const { data: dataStatus } = GET(
        `api/status?status_category_code=SC-01&from=PageFacultyMonitoringDashboard`,
        "status_select"
    );
    const { data: dataDepartments } = GET(
        `api/department`,
        "department_select"
    );

    return (
        <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24} lg={24}>
                <Form initialValues={{ department_id: "all" }}>
                    <Row gutter={[12, 12]}>
                        {role() !== 3 ? (
                            <Col xs={24} sm={24} md={12} lg={8}>
                                <Form.Item name="department_id">
                                    <FloatSelect
                                        label="Department"
                                        placeholder="Department"
                                        required={true}
                                        options={
                                            dataDepartments &&
                                            dataDepartments.data
                                                ? [
                                                      {
                                                          value: "all",
                                                          label: "All",
                                                      },
                                                      ...dataDepartments.data.map(
                                                          (item) => ({
                                                              label: item.department_name,
                                                              value: item.id,
                                                          })
                                                      ),
                                                  ]
                                                : []
                                        }
                                        onChange={(e) => {
                                            setFilter((ps) => ({
                                                ...ps,
                                                department_id: e ? e : "",
                                            }));
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                        ) : null}

                        <Col xs={24} sm={24} md={12} lg={8}>
                            <Form.Item name="status_id">
                                <FloatSelect
                                    label="Status"
                                    placeholder="Status"
                                    required={true}
                                    options={
                                        dataStatus && dataStatus.data
                                            ? dataStatus.data.map((item) => ({
                                                  label: item.status,
                                                  value: item.id,
                                              }))
                                            : []
                                    }
                                    onChange={(e) => {
                                        setFilter((ps) => ({
                                            ...ps,
                                            status_id: e ? e : "",
                                        }));
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24}>
                <div id="divFacultyMonitoringGraph" />
            </Col>
        </Row>
    );
}
