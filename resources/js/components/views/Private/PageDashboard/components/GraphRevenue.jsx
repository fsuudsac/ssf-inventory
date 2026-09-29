import { useContext, useEffect, useState } from "react";

import { GET } from "../../../../providers/useAxiosQuery";
import PageDashboardContext from "./PageDashboardContext";
import CustomCollapse from "../../../../providers/CustomCollapse";

export default function GraphRevenue() {
    const { Highcharts, leftArrow } = useContext(PageDashboardContext);

    const [collapseActiveKey, setCollapseActiveKey] = useState(["0", "1"]);

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

            let action = data.action;
            let downTo = data.downTo;

            let title = "REVENUE";
            let subtitleText = "CLICK THE COLUMNS TO VIEW PER QUARTER";

            if (action === "year") {
                subtitleText = "CLICK THE COLUMNS TO VIEW PER QUARTER";
            } else if (action === "quarter") {
                subtitleText = "CLICK THE COLUMNS TO VIEW PER MONTH";
            } else if (action === "month") {
                subtitleText = "CLICK THE COLUMNS TO VIEW PER DAILY";
            } else if (action === "day") {
                subtitleText = "CLICK THE COLUMNS TO GO BACK TO PER YEAR";
            }

            if (document.getElementById("divGraphRevenue")) {
                let chart = Highcharts.chart(
                    "divGraphRevenue",
                    {
                        chart: {
                            zoomType: "x",
                            type: "column",
                            events: {
                                click: function (e) {
                                    let series_name =
                                        data_series_name[
                                            Math.abs(
                                                Math.round(e.xAxis[0].value),
                                            )
                                        ];

                                    setFilter((prevState) => ({
                                        ...prevState,
                                        action: downTo,
                                        [action]: series_name,
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
                            // labels: {
                            //     formatter: function () {
                            //         return `${Highcharts.numberFormat(
                            //             this.value,
                            //             0,
                            //             "",
                            //             ","
                            //         )}`;
                            //     },
                            // },
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

                                        return `₱ ${Highcharts.numberFormat(
                                            this.y,
                                            2,
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
                                            this.dataTableDiv.style.display !==
                                                "none"
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

                        if (data.action !== "year") {
                            let y = 65;
                            let x = 15;

                            // console.log("x: ", x, " y: ", y);
                            chart.renderer
                                .image(
                                    leftArrow,
                                    chart.chartWidth - y,
                                    x,
                                    18,
                                    17,
                                )
                                .add()
                                .addClass("highcharts-button-arrow-left")
                                .css({ cursor: "pointer" })
                                .attr({ title: "Back" })
                                .on("click", function () {
                                    // prcessing after image is clicked

                                    let newaction = "";

                                    if (action === "quarter") {
                                        newaction = "year";
                                    } else if (action === "month") {
                                        newaction = "quarter";
                                    } else if (action === "day") {
                                        newaction = "month";
                                    }

                                    setFilter((prevState) => ({
                                        ...prevState,
                                        action: newaction,
                                    }));
                                });
                        }
                    },
                );

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
                    label: "REVENUE - TOTAL SALES",
                    children: <div id="divGraphRevenue" />,
                },
            ]}
        />
    );
}
