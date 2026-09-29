import React, { useEffect } from "react";
import Highcharts from "highcharts";

export default function BarChart() {
    useEffect(() => {
        Highcharts.chart("bar-container", {
            chart: {
                type: "column",
            },
            title: {
                text: "Chart",
            },
            xAxis: {
                categories: [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ],
            },
            credits: {
                enabled: false,
            },
            plotOptions: {
                column: {
                    borderRadius: "25%",
                },
            },
            series: [
                {
                    name: "Product Canvas Price",
                    data: [5, 3, 4, 7, 2],
                },
                {
                    name: "Purchase Order",
                    data: [2, -2, -3, 2, 1],
                },
                {
                    name: "Release Item",
                    data: [3, 4, 4, -2, 5],
                },
            ],
        });
    }, []);

    return <div id="bar-container"></div>;
}
