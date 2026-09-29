import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Flex, notification, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilterList, faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";
import TablePurchase from "./TablePurchase";
import ModalPurchasePreview from "./ModalPurchasePreview";
import ModalFormPayment from "./ModalFormPayment";
import PagePurchaseContext from "./PagePurchaseContext";
import notificationErrors from "../../../../providers/notificationErrors";

export default function PagePurchaseTabItemPurchase(props) {
    const {
        tableFilter,
        setTableFilter,
        tabActive,
        setOpenDrawerPurchaseFilter,
        tableColumns,
        onChangeTable,
        width,
    } = props;

    const navigate = useNavigate();
    const [toggleModalPuchasePreview, setToggleModalPuchasePreview] = useState({
        open: false,
        data: null,
    });
    const [toggleModalPuchasePayment, setToggleModalPuchasePayment] = useState({
        open: false,
        data: null,
    });

    const { data: dataPurchaseOrder, refetch: refetchSource } = GET(
        `api/purchases?${new URLSearchParams(tableFilter)}`,
        `purchases_list`,
    );

    useEffect(() => {
        if (tabActive === "purchase") {
            refetchSource();
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    const {
        mutate: mutatePurchaseArchived,
        isLoading: isLoadingPurchaseArchived,
    } = POST(`api/purchase_archived`, "purchases_list");

    const handleArchived = (id) => {
        let data = { id, isTrash: tableFilter.isTrash };

        mutatePurchaseArchived(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Purchase Order",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Purchase Order",
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
        <PagePurchaseContext.Provider
            value={{
                dataPurchaseOrder,
                tableFilter,
                tabActive,
                onChangeTable,
                toggleModalPuchasePreview,
                setToggleModalPuchasePreview,
                toggleModalPuchasePayment,
                setToggleModalPuchasePayment,
                handleArchived,
                isLoadingPurchaseArchived,
                tableColumns,
            }}
        >
            <Row gutter={[20, 20]} id={`tbl_wrapper_${tabActive}`}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Flex
                        justify="space-between"
                        align="center"
                        className="tbl-top-filter"
                    >
                        <Button
                            type="primary"
                            className={`${width < 576 ? "w-full" : "min-w-[150px]"}`}
                            onClick={() => {
                                if (tabActive === "purchase") {
                                    navigate("/purchase-order/add-purchase");
                                } else {
                                    navigate(
                                        "/purchase-order/add-purchase-order-return",
                                    );
                                }
                            }}
                            icon={<FontAwesomeIcon icon={faPlus} />}
                            name="btn_add"
                        >
                            Purchase Order{" "}
                            {tabActive !== "purchase" ? "Return" : ""}
                        </Button>

                        <TablePageSize
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    </Flex>
                </Col>

                <Col xs={24} sm={24} md={24}>
                    <Flex
                        justify="space-between"
                        align="center"
                        className="tbl-top-filter"
                    >
                        <Flex align="center">
                            <Button
                                type="default"
                                shape="round"
                                onClick={() =>
                                    setOpenDrawerPurchaseFilter(true)
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

                        <Flex align="center" gap={15}>
                            <TableShowingEntriesV2 />
                            <TablePagination
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                                total={
                                    dataPurchaseOrder
                                        ? dataPurchaseOrder.data.total
                                        : 0
                                }
                                showLessItems={true}
                                showSizeChanger={false}
                                tblIdWrapper={`tbl_wrapper_${tabActive}`}
                            />
                        </Flex>
                    </Flex>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <TablePurchase />
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Flex
                        justify="space-between"
                        align="center"
                        className="tbl-bottom-filter"
                    >
                        <div />

                        <Flex align="center" gap={15}>
                            <TableShowingEntriesV2 />
                            <TablePagination
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                                total={
                                    dataPurchaseOrder
                                        ? dataPurchaseOrder.data.total
                                        : 0
                                }
                                showLessItems={true}
                                showSizeChanger={false}
                                tblIdWrapper={`tbl_wrapper_${tabActive}`}
                            />
                        </Flex>
                    </Flex>
                </Col>
            </Row>

            <ModalPurchasePreview />
            <ModalFormPayment />
        </PagePurchaseContext.Provider>
    );
}
