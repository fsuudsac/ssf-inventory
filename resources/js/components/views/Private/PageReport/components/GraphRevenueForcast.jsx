import { useContext, useEffect, useState } from "react";
import { Collapse } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../../providers/useAxiosQuery";
import PageReportContext from "./PageReportContext";
import predictionDataForecast from "../../../../providers/predictionDataForecast";

export default function GraphRevenueForcast() {
    const { Highcharts } = useContext(PageReportContext);

    const [filter, setFilter] = useState({
        action: "year",
        year: "",
        quarter: "",
        month: "",
        day: "",
        date_range: [],
        date_range_string: [],
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/graph_revenue?${new URLSearchParams(filter)}`,
        "graph_revenue_graph",
        (res) => {},
        false
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    useEffect(() => {
        if (dataSource && dataSource.data) {
            console.log("data: ", dataSource.data);

            let data = dataSource.data;
            let data_series_name = data.data_series_name;
            let data_series_value = data.data_series_value;

            let title = "REVENUE";
            let subtitleText =
                "THE REVENUE FORECAST GRAPH (FOR THE PAST 10 YEARS)";

            let last_series_name =
                data_series_name[data_series_name.length - 1];

            for (let x = 1; x <= 5; x++) {
                let add_series_name = parseInt(last_series_name) + x;
                data_series_name.push(add_series_name);
            }

            const data_series = data_series_value;

            data_series_value.forEach((item) => {
                let new_data_forecast = [];
                let new_data_forecast_null = [];

                for (
                    let j = 0;
                    j < predictionDataForecast(item.data).length;
                    j++
                ) {
                    if (predictionDataForecast(item.data)[j] != null) {
                        new_data_forecast.push(
                            predictionDataForecast(item.data)[j]
                        );
                    } else {
                        new_data_forecast_null.push(
                            predictionDataForecast(item.data)[j]
                        );
                    }
                }

                data_series.push({
                    type: "line",
                    name: item.name + " TREND",
                    color: "#e4151f",
                    dashStyle: "ShortDash",
                    marker: { enabled: false },
                    data: predictionDataForecast(item.data),
                });
            });

            console.log("data_series: ", data_series);

            if (document.getElementById("GraphRevenueForcast")) {
                let chart = Highcharts.chart("GraphRevenueForcast", {
                    title: {
                        text: title,
                    },
                    subtitle: {
                        text: subtitleText,
                    },
                    xAxis: {
                        title: {
                            enabled: false,
                        },
                        categories: data_series_name,
                        crosshair: true,
                        type: "category",
                    },
                    yAxis: {
                        title: {
                            text: null,
                        },
                    },
                    tooltip: {
                        shared: true,
                        useHTML: true,
                        headerFormat: `<small>{point.key}</small><table>`,
                        pointFormat: `<tr><td style="color: {series.color}">{series.name}: </td><td style="text-align: right"><b>₱ {point.y:,.2f}</b></td></tr>`,
                        footerFormat: "</table>",
                    },
                    legend: {
                        enabled: false,
                    },
                    plotOptions: {
                        series: {
                            borderWidth: 0,
                            cursor: "pointer",
                            dataLabels: {
                                enabled: true,
                                formatter: function () {
                                    if (this.y === 0) {
                                        return null;
                                    }

                                    return `₱ ${Highcharts.numberFormat(
                                        this.y,
                                        2,
                                        ".",
                                        ","
                                    )}`;
                                },
                            },
                        },
                        column: {
                            pointPadding: 0.2,
                            borderWidth: 0,
                            dataLabels: {
                                enabled: true,
                                formatter: function () {
                                    if (this.y === 0) {
                                        return null;
                                    }

                                    return `₱ ${Highcharts.numberFormat(
                                        this.y,
                                        2,
                                        ".",
                                        ","
                                    )}`;
                                },
                            },
                            events: {
                                click: function (e) {
                                    let div_graph_wrapper =
                                        document.querySelector(
                                            "#GraphRevenueForcast"
                                        );

                                    if (div_graph_wrapper) {
                                        let highchartsDataTable =
                                            div_graph_wrapper.querySelector(
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
                    series: data_series_value,
                    exporting: {
                        filename: `report-revenue-forecast-${title.toLowerCase()}`,
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
                                        this.dataTableDiv.style.display !==
                                            "none"
                                    ) {
                                        this.dataTableDiv.style.display =
                                            "none";
                                    } else {
                                        this.viewData();
                                        this.dataTableDiv.style.display = "";
                                    }
                                },
                                text: "View Data Table",
                            },
                        },
                    },
                });

                Highcharts.addEvent(chart, "aftergetTableAST", function (e) {
                    e.tree.children[2].children.forEach(function (row) {
                        row.children.forEach(function (cell, i) {
                            if (i !== 0) {
                                row.children[i].textContent = cell.textContent;
                            }
                        });
                    });
                });
            }
        }

        return () => {};
    }, [dataSource]);

    return (
        <Collapse
            className="collapse-main-primary"
            defaultActiveKey={["0", "1"]}
            size="large"
            expandIcon={({ isActive }) => (
                <FontAwesomeIcon icon={isActive ? faAngleUp : faAngleDown} />
            )}
            items={[
                {
                    key: "0",
                    label: "REVENUE - FORECAST",
                    children: <div id="GraphRevenueForcast" />,
                },
            ]}
        />
    );
}
