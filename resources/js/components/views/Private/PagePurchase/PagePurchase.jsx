import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Drawer, Tabs } from "antd";

import PagePurchaseTabItemPurchase from "./components/PagePurchaseTabItemPurchase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faBoxesPacking } from "@fortawesome/pro-regular-svg-icons";
import PagePurchaseTabItemPurchaseReturn from "./components/PagePurchaseTabItemPurchaseReturn";
import PurchaseFilter from "./components/PurchaseFilter";
import PurchaseReturnFilter from "./components/PurchaseReturnFilter";

export default function PagePurchase() {
    const location = useLocation();

    const initialTab =
        new URLSearchParams(location.search).get("tab") === "purchase_return"
            ? "purchase-order-return"
            : "purchase";

    const [tabActive, setTabActive] = useState(initialTab);
    const [openDrawerPurchaseFilter, setOpenDrawerPurchaseFilter] =
        useState(false);
    const [openDrawerPurchaseReturnFilter, setOpenDrawerPurchaseReturnFilter] =
        useState(false);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_order: "desc",
        sort_field:
            initialTab === "purchase" ? "date_purchased_format" : "date_return",
        isTrash: 0,
        type:
            initialTab === "purchase"
                ? "Purchase Order"
                : "Purchase Order Return",
    });

    useEffect(() => {
        let tab = new URLSearchParams(location.search).get("tab");
        if (tab === "purchase_return") {
            setTabActive("purchase-order-return");
        }
    }, [location]);

    const onChange = (key) => {
        setTabActive(key);
        setTableFilter((prev) => ({
            ...prev,
            page: 1,
            sort_field:
                key === "purchase" ? "date_purchased_format" : "date_return",
            type:
                key === "purchase" ? "Purchase Order" : "Purchase Order Return",
        }));
    };

    useEffect(() => {
        setTableFilter((ps) => ({
            ...ps,
            sort_field:
                tabActive === "purchase"
                    ? "date_purchased_format"
                    : "date_return",
            type:
                tabActive === "purchase"
                    ? "Purchase Order"
                    : "Purchase Order Return",
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
        "vat_type",
        "ewt_type",
        "terms",
        "discount",
        "total_gross_amount",
        "value_added_tax",
        "total_amount_payable",
        "amount_due",
        "net_amount_due",
        "paid_status",
    ]);

    const items = [
        {
            key: "purchase",
            icon: <FontAwesomeIcon icon={faBox} />,
            label: "Purchase Order",
            children: (
                <PagePurchaseTabItemPurchase
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    tabActive={tabActive}
                    tableColumns={tableColumns}
                    setOpenDrawerPurchaseFilter={setOpenDrawerPurchaseFilter}
                    onChangeTable={onChangeTable}
                />
            ),
        },
        {
            key: "purchase-order-return",
            icon: <FontAwesomeIcon icon={faBoxesPacking} />,
            label: "Purchase Order Return",
            children: (
                <PagePurchaseTabItemPurchaseReturn
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    tabActive={tabActive}
                    setOpenDrawerPurchaseReturnFilter={
                        setOpenDrawerPurchaseReturnFilter
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
                    setOpenDrawerPurchaseFilter(false);
                }}
                open={openDrawerPurchaseFilter}
                size="large"
                width="300px"
                id="PagePurchaseFilter"
            >
                <PurchaseFilter
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    tableColumns={tableColumns}
                    setTableColumns={setTableColumns}
                />
            </Drawer>

            <Drawer
                title="Filter"
                onClose={() => {
                    setOpenDrawerPurchaseReturnFilter(false);
                }}
                open={openDrawerPurchaseReturnFilter}
                size="large"
                width="300px"
                id="PagePurchaseReturnFilter"
            >
                <PurchaseReturnFilter
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                />
            </Drawer>
        </>
    );
}
