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
import ModalPurchasePreview from "./ModalPurchasePreview";
import TablePurchaseReturn from "./TablePurchaseReturn";
import PagePurchaseContext from "./PagePurchaseContext";
import notificationErrors from "../../../../providers/notificationErrors";

export default function PagePurchaseTabItemPurchaseReturn(props) {
    const {
        tableFilter,
        setTableFilter,
        tabActive,
        setOpenDrawerPurchaseReturnFilter,
        tableColumns,
        onChangeTable,
    } = props;

    const navigate = useNavigate();
    const [toggleModalPuchasePreview, setToggleModalPuchasePreview] = useState({
        open: false,
        data: null,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/purchase_return?${new URLSearchParams(tableFilter)}`,
        `purchase_return_list`,
    );

    useEffect(() => {
        if (tabActive === "purchase-order-return") {
            refetchSource();
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter, tabActive]);

    const {
        mutate: mutatePurchaseArchived,
        isLoading: isLoadingPurchaseArchived,
    } = POST(`api/purchase_return_archived`, "purchase_return_list");

    const handleArchived = (id) => {
        let data = { id, isTrash: tableFilter.isTrash };

        mutatePurchaseArchived(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Purchase Order Return",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Purchase Order Return",
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
                dataSource:
                    dataSource && dataSource.data && dataSource.data.data
                        ? dataSource.data.data
                        : [],
                tableFilter,
                onChangeTable,
                tabActive,
                toggleModalPuchasePreview,
                setToggleModalPuchasePreview,
                handleArchived,
                isLoadingPurchaseArchived,
                tableColumns,
            }}
        >
            <Row gutter={[12, 12]} id={`tbl_wrapper_${tabActive}`}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <div className="tbl-top-filter">
                        <Button
                            className="btn-main-primary"
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
                        >
                            Add Purchase Order{" "}
                            {tabActive !== "purchase" ? "Return" : ""}
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
                                    setOpenDrawerPurchaseReturnFilter(true)
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
                    <TablePurchaseReturn />
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <div className="tbl-bottom-filter">
                        <div />

                        <Flex>
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
            </Row>

            <ModalPurchasePreview />
        </PagePurchaseContext.Provider>
    );
}
