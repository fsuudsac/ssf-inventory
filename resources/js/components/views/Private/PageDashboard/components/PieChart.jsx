import React, { useEffect } from "react";
import Highcharts from "highcharts";

export default function PieChart() {
    useEffect(() => {
        Highcharts.chart("pie-container", {
            chart: {
                type: "variablepie",
            },
            title: {
                text: "Products",
                align: "left",
            },
            tooltip: {
                headerFormat: "",
                pointFormat:
                    '<span style="color:{point.color}">\u25CF</span> <b> ' +
                    "{point.name}</b><br/>" +
                    "Purchase Products: <b>{point.y}</b><br/>" +
                    "Sales Products: <b>{point.z}</b><br/>",
            },
            series: [
                {
                    minPointSize: 10,
                    innerSize: "20%",
                    zMin: 0,
                    name: "countries",
                    borderRadius: 5,
                    data: [
                        {
                            name: "Warehouse 1",
                            y: 505992,
                            z: 92,
                        },
                        {
                            name: "Warehouse 2",
                            y: 551695,
                            z: 119,
                        },
                        {
                            name: "Warehouse 3",
                            y: 312679,
                            z: 121,
                        },
                    ],
                    colors: ["#4caefe", "#3dc3e8", "#2dd9db"],
                },
            ],
        });
    }, []);

    return <div id="pie-container"></div>;
}
