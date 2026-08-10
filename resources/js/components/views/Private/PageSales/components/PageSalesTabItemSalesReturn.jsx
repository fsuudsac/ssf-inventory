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
            <Row gutter={[12, 12]} id={`tbl_wrapper_return_${tabActive}`}>
                <Col xs={24} sm={24} md={24}>
                    <div className="tbl-top-filter">
                        <Button
                            className="btn-main-primary btn-main-invert-outline b-r-none"
                            icon={<FontAwesomeIcon icon={faPlus} />}
                            onClick={() => {
                                navigate("/release-item/add-sales-return");
                            }}
                            name="btn_add"
                        >
                            Add Release Item Return
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
                    <TableSalesReturn />
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
                                tblIdWrapper={`tbl_wrapper_${tabActive}`}
                            />
                        </Flex>
                    </div>
                </Col>
            </Row>

            <ModalSalesReturnPreview />
        </PageFormSalesContext.Provider>
    );
}
