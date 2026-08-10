import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Drawer, Tabs } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faBoxesPacking } from "@fortawesome/pro-regular-svg-icons";

import PageSalesTabItemSales from "./components/PageSalesTabItemSales";
import PageSalesTabItemSalesReturn from "./components/PageSalesTabItemSalesReturn";
import SalesFilter from "./components/SalesFilter";
import SalesReturnFilter from "./components/SalesReturnFilter";

export default function PageSales() {
    const location = useLocation();

    const initialTab =
        new URLSearchParams(location.search).get("tab") === "sales_return"
            ? "sales-return"
            : "sales";

    const [tabActive, setTabActive] = useState(initialTab);
    const [openDrawerReleaseItemFilter, setOpenDraReleaseItemFilter] =
        useState(false);
    const [
        openDrawerReleaseItemReturnFilter,
        setOpenDraReleaseItemReturnFilter,
    ] = useState(false);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_order: "desc",
        sort_field:
            initialTab === "sales"
                ? "date_transaction_format"
                : "date_return_formatted",
        isTrash: 0,
        type: initialTab === "sales" ? "Release Item" : "Release Item Return",
    });

    useEffect(() => {
        let tab = new URLSearchParams(location.search).get("tab");
        if (tab === "sales_return") {
            setTabActive("sales-return");
        }
    }, [location]);

    const onChange = (key) => {
        setTabActive(key);
        setTableFilter((prev) => ({
            ...prev,
            page: 1,
            sort_field:
                key === "sales"
                    ? "date_transaction_format"
                    : "date_return_formatted",
            type: key === "sales" ? "Release Item" : "Release Item Return",
        }));
    };

    useEffect(() => {
        setTableFilter((ps) => ({
            ...ps,
            page: 1,
            sort_field:
                tabActive === "sales"
                    ? "date_transaction_format"
                    : "date_return_formatted",
            type:
                tabActive === "sales" ? "Release Item" : "Release Item Return",
        }));
    }, [tabActive]);

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((prevState) => ({
            ...prevState,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    const [tableColumns, setTableColumns] = useState([
        "customer_type",
        "vat_type",
        "ewt_type",
        "terms",
        "discount",
    ]);

    const items = [
        {
            key: "sales",
            icon: <FontAwesomeIcon icon={faBox} />,
            label: "Release Item",
            children: (
                <PageSalesTabItemSales
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    tabActive={tabActive}
                    tableColumns={tableColumns}
                    setOpenDraReleaseItemFilter={setOpenDraReleaseItemFilter}
                    onChangeTable={onChangeTable}
                />
            ),
        },
        {
            key: "sales-return",
            icon: <FontAwesomeIcon icon={faBoxesPacking} />,
            label: "Release Item Return",
            children: (
                <PageSalesTabItemSalesReturn
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    tabActive={tabActive}
                    setOpenDraReleaseItemReturnFilter={
                        setOpenDraReleaseItemReturnFilter
                    }
                    onChangeTable={onChangeTable}
                />
            ),
        },
    ];

    return (
        <>
            <Tabs
                activeKey={tabActive}
                // destroyInactiveTabPane={true}
                items={items}
                onChange={onChange}
                indicator={{
                    size: (origin) => origin - 25,
                    align: "end",
                }}
            />

            <Drawer
                title="Filter"
                onClose={() => {
                    setOpenDraReleaseItemFilter(false);
                }}
                open={openDrawerReleaseItemFilter}
                size="large"
                width="300px"
                id="PageSalesFilter"
            >
                <SalesFilter
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    tableColumns={tableColumns}
                    setTableColumns={setTableColumns}
                />
            </Drawer>

            <Drawer
                title="Filter"
                onClose={() => {
                    setOpenDraReleaseItemReturnFilter(false);
                }}
                open={openDrawerReleaseItemReturnFilter}
                size="large"
                width="300px"
                id="PageSalesReturnFilter"
            >
                <SalesReturnFilter
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    tableColumns={tableColumns}
                    setTableColumns={setTableColumns}
                />
            </Drawer>
        </>
    );
}
