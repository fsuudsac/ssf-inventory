import { useContext, useEffect, useState } from "react";

import { GET } from "../../../../providers/useAxiosQuery";
import PageDashboardContext from "./PageDashboardContext";
import CustomCollapse from "../../../../providers/CustomCollapse";

export default function GraphProducts() {
    const { Highcharts, leftArrow } = useContext(PageDashboardContext);

    const [collapseActiveKey, setCollapseActiveKey] = useState(["0", "1"]);

    const [filter, setFilter] = useState({
        date_range: [],
        date_range_string: [],
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/graph_product?${new URLSearchParams(filter)}`,
        "graph_product_graph",
        (res) => {},
        false,
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    useEffect(() => {
        if (dataSource && dataSource.data) {
            let data = dataSource.data;
            let data_series_name = data.data_series_name;
            let data_series_value = data.data_series_value;

            let title = "STOCK AVAILABILITY";
            let subtitleText = "SOLD AND REMAINING QUANTITY";

            if (document.getElementById("divGraphProducts")) {
                let chart = Highcharts.chart("divGraphProducts", {
                    chart: {
                        zoomType: "x",
                        type: "column",
                    },
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
                        pointFormat: `<tr><td style="color: {series.color}">{series.name}: </td><td style="text-align: right"><b>{point.y}</b></td></tr>`,
                        footerFormat: `</table>`,
                    },
                    legend: {
                        layout: "vertical",
                        align: "right",
                        verticalAlign: "top",
                        x: -40,
                        y: 80,
                        floating: true,
                        borderWidth: 1,
                        backgroundColor:
                            Highcharts.defaultOptions.legend.backgroundColor ||
                            "#FFFFFF",
                        shadow: true,
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

                                    return `${Highcharts.numberFormat(
                                        this.y,
                                        0,
                                        ".",
                                        ",",
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

                                    return `${Highcharts.numberFormat(
                                        this.y,
                                        0,
                                        ".",
                                        ",",
                                    )}`;
                                },
                            },
                            events: {
                                click: function (e) {
                                    setFilter((prevState) => ({
                                        ...prevState,
                                        action: downTo,
                                        [action]: e.point.category,
                                    }));

                                    let div_graph_wrapper =
                                        document.querySelector(
                                            "#divGraphRevenue",
                                        );

                                    if (div_graph_wrapper) {
                                        let highchartsDataTable =
                                            div_graph_wrapper.querySelector(
                                                ".highcharts-data-table",
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
                        filename: `report-stock-available-${title.toLowerCase()}`,
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
        <CustomCollapse
            activeKey={collapseActiveKey}
            onChange={(key) => setCollapseActiveKey(key)}
            items={[
                {
                    key: "0",
                    label: "STOCK AVAILABILITY",
                    children: <div id="divGraphProducts" />,
                },
            ]}
        />
    );
}
