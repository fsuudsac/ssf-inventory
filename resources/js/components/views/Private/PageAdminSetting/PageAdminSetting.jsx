import { Tabs } from "antd";

import PageProductType from "./PageProductType/PageProductType";
import PageProductCategory from "./PageProductCategory/PageProductCategory";
import PageProductSize from "./PageProductSize/PageProductSize";
import PageCreditTerms from "./PageCreditTerms/PageCreditTerms";
import PageEwtType from "./PageEwtType/PageEwtType";
import PageDepartment from "./PageDepartment/PageDepartment";

export default function PageAdminSetting() {
    const onChange = (key) => {};

    const items = [
        {
            key: "department",
            label: "Department",
            children: <PageDepartment />,
        },
        {
            key: "product_type",
            label: "Product Type",
            children: <PageProductType />,
        },
        {
            key: "product_category",
            label: "Product Category",
            children: <PageProductCategory />,
        },
        {
            key: "product_size",
            label: "Product Size",
            children: <PageProductSize />,
        },
        {
            key: "credit_terms",
            label: "Credit Terms",
            children: <PageCreditTerms />,
        },
        {
            key: "ewt_type",
            label: "EWT Type",
            children: <PageEwtType />,
        },
    ];

    return <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;
}
