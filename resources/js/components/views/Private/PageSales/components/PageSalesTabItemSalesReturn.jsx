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
import TableSalesReturn from "./TableSalesReturn";
import PageFormSalesContext from "./PageFormSalesContext";
import notificationErrors from "../../../../providers/notificationErrors";
import ModalSalesReturnPreview from "./ModalSalesReturnPreview";

export default function PageSalesTabItemSalesReturn(props) {
    const {
        tableFilter,
        setTableFilter,
        tabActive,
        setOpenDraReleaseItemReturnFilter,
        tableColumns,
        onChangeTable,
        width,
    } = props;

    const navigate = useNavigate();
    const [toggleModalSalesPreview, setToggleModalSalesPreview] = useState({
        open: false,
        data: null,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/sales_order_return?${new URLSearchParams(tableFilter)}`,
        "sales_order_return_list",
    );

    useEffect(() => {
        if (tabActive === "sales-return") {
            refetchSource();
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter, tabActive]);

    const {
        mutate: mutateDeleteSalesReturn,
        isLoading: isLoadingDeleteSalesReturn,
    } = POST(`api/sales_return_archived`, "sales_order_return_list");

    const handleArhived = (record) => {
        let data = {
            isTrash: tableFilter.isTrash,
            id: record.id,
        };
        mutateDeleteSalesReturn(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Release Item Return",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Release Item Return",
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
                setToggleModalSalesPreview,
                toggleModalSalesPreview,
                handleArhived,
                isLoadingDeleteSalesReturn,
            }}
        >
            <Row gutter={[20, 20]} id={`tbl_wrapper_return_${tabActive}`}>
                <Col xs={24} sm={24} md={24}>
                    <Flex
                        justify="space-between"
                        align="center"
                        className="tbl-top-filter"
                    >
                        <Button
                            type="primary"
                            className={`${width < 576 ? "w-full" : "min-w-[150px]"}`}
                            icon={<FontAwesomeIcon icon={faPlus} />}
                            onClick={() => {
                                navigate("/release-item/add-sales-return");
                            }}
                            name="btn_add"
                        >
                            Release Item Return
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
                                    setOpenDraReleaseItemReturnFilter(true)
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
                                total={dataSource ? dataSource.data.total : 0}
                                showLessItems={true}
                                showSizeChanger={false}
                                tblIdWrapper={`tbl_wrapper_${tabActive}`}
                            />
                        </Flex>
                    </Flex>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <TableSalesReturn />
                </Col>

                <Col xs={24} sm={24} md={24}>
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
                                total={dataSource ? dataSource.total : 0}
                                showLessItems={true}
                                showSizeChanger={false}
                                tblIdWrapper={`tbl_wrapper_${tabActive}`}
                            />
                        </Flex>
                    </Flex>
                </Col>
            </Row>

            <ModalSalesReturnPreview />
        </PageFormSalesContext.Provider>
    );
}
