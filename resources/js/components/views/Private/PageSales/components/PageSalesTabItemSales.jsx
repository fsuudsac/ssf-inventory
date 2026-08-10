import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Button, Col, Flex, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilterList, faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";
import TableSales from "./TableSales";
import ModalSalesPreview from "./ModalSalesPreview";
import ModalFormPayment from "./ModalFormPayment";
import PageFormSalesContext from "./PageFormSalesContext";
import notificationErrors from "../../../../providers/notificationErrors";

export default function PageSalesTabItemSales(props) {
    const {
        tableFilter,
        setTableFilter,
        tabActive,
        setOpenDraReleaseItemFilter,
        tableColumns,
        onChangeTable,
    } = props;

    const navigate = useNavigate();
    const [toggleModalSalesPreview, setToggleModalSalesPreview] = useState({
        open: false,
        data: null,
    });
    const [toggleModalSalesPayment, setToggleModalSalesPayment] = useState({
        open: false,
        data: null,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/sales?${new URLSearchParams(tableFilter)}`,
        "sales_order_list",
    );

    useEffect(() => {
        if (tabActive === "sales") {
            refetchSource();
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter, tabActive]);

    const { mutate: mutateDeleteSales, isLoading: isLoadingDeleteSales } = POST(
        `api/sales_archived`,
        "sales_order_list",
    );

    const handleArhived = (record) => {
        let data = {
            isTrash: tableFilter.isTrash,
            id: record.id,
        };
        mutateDeleteSales(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Release Item",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Release Item",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    return (
        <PageFormSalesContext.Provider
            value={{
                dataSource,
                tableFilter,
                onChangeTable,
                tabActive,
                toggleModalSalesPreview,
                setToggleModalSalesPreview,
                toggleModalSalesPayment,
                setToggleModalSalesPayment,
                handleArhived,
                isLoadingDeleteSales,
                tableColumns,
            }}
        >
            <Row gutter={[12, 12]} id={`tbl_wrapper_sales_${tabActive}`}>
                <Col xs={24} sm={24} md={24}>
                    <div className="tbl-top-filter">
                        <Button
                            className="btn-main-primary btn-main-invert-outline b-r-none"
                            icon={<FontAwesomeIcon icon={faPlus} />}
                            onClick={() => {
                                navigate("/release-item/add-sales");
                            }}
                            name="btn_add"
                        >
                            Add Release Item
                        </Button>

                        <TablePageSize
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    </div>
                </Col>

                <Col xs={24} sm={24} md={24}>
                    <div className="tbl-top-filter">
                        <Flex>
                            <Button
                                type="default"
                                shape="round"
                                onClick={() =>
                                    setOpenDraReleaseItemFilter(true)
                                }
                                icon={<FontAwesomeIcon icon={faFilterList} />}
                            >
                                Filter
                            </Button>

                            <TableGlobalSearchAnimated
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />
                        </Flex>

                        <Flex gap={10}>
                            <TableShowingEntriesV2 />
                            <TablePagination
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                                total={dataSource ? dataSource.data.total : 0}
                                showLessItems={true}
                                showSizeChanger={false}
                                tblIdWrapper={`tbl_wrapper_${tabActive}`}
                            />
                        </Flex>
                    </div>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <TableSales />
                </Col>

                <Col xs={24} sm={24} md={24}>
                    <div className="tbl-bottom-filter">
                        <div />

                        <Flex>
                            <TableShowingEntriesV2 />
                            <TablePagination
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                                total={dataSource ? dataSource.total : 0}
                                showLessItems={true}
                                showSizeChanger={false}
                                tblIdWrapper={`tbl_wrapper_sales_${tabActive}`}
                            />
                        </Flex>
                    </div>
                </Col>
            </Row>

            <ModalSalesPreview />
            <ModalFormPayment />
        </PageFormSalesContext.Provider>
    );
}
