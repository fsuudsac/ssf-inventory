import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Col, Flex, notification, Popconfirm, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../providers/CustomTableFilter";
import ModalFormVideoFaqs from "./components/ModalFormVideoFaqs";
import TableVideoFaqs from "./components/TableVideoFaqs";
import notificationErrors from "../../../providers/notificationErrors";
import PageVideoFaqContext from "./components/PageVideoFaqContext";
import useTableScrollOnTop from "../../../providers/useTableScrollOnTop";

export default function PageVideoFaqs() {
    const location = useLocation();

    const [toggleModalFormVideoFaq, setToggleModalFormVideoFaq] = useState({
        open: false,
        data: null,
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_order: "desc",
        sort_field: "date_formatted",
        isTrash: 0,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/video_faq?${new URLSearchParams(tableFilter)}`,
        "video_faq_list",
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((prevState) => ({
            ...prevState,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    const { mutate: mutateDeleteEwtType, isLoading: isLoadingDeleteVideoFaq } =
        POST(`api/video_faq_archived`, "video_faq_list");

    const handleSelectedArchived = () => {
        let data = {
            isTrash: tableFilter.isTrash,
            ids: selectedRowKeys,
        };
        mutateDeleteEwtType(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Video FAQ",
                        description: res.message,
                    });
                    setSelectedRowKeys([]);
                } else {
                    notification.error({
                        message: "Video FAQ",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useTableScrollOnTop("tbl_video_faq", location);

    return (
        <PageVideoFaqContext.Provider
            value={{
                dataSource,
                toggleModalFormVideoFaq,
                setToggleModalFormVideoFaq,
                selectedRowKeys,
                setSelectedRowKeys,
                onChangeTable,
            }}
        >
            <Row gutter={[12, 12]} id="tbl_wrapper_video_faq">
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Button
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        className="btn-main-primary"
                        onClick={() =>
                            setToggleModalFormVideoFaq({
                                open: true,
                                data: null,
                            })
                        }
                    >
                        Add Video FAQ
                    </Button>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <div className="tbl-top-filter">
                        <Flex gap={10}>
                            <Button
                                className={`btn-main-primary min-w-150 ${
                                    !tableFilter.isTrash ? "active" : "outlined"
                                }`}
                                onClick={() => {
                                    setTableFilter((ps) => ({
                                        ...ps,
                                        isTrash: 0,
                                    }));
                                    setSelectedRowKeys([]);
                                }}
                            >
                                Active
                            </Button>

                            <Button
                                className={`btn-main-primary min-w-150 ${
                                    tableFilter.isTrash ? "active" : "outlined"
                                }`}
                                onClick={() => {
                                    setTableFilter((ps) => ({
                                        ...ps,
                                        isTrash: 1,
                                    }));
                                    setSelectedRowKeys([]);
                                }}
                            >
                                Archived
                            </Button>
                        </Flex>

                        <TablePageSize
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    </div>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <div className="tbl-top-filter">
                        <Flex gap={10}>
                            <TableGlobalSearchAnimated
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />
                            {selectedRowKeys.length > 0 && (
                                <Popconfirm
                                    title={
                                        <>
                                            Are you sure you want to
                                            <br />
                                            {!tableFilter.isTrash
                                                ? "archive"
                                                : "restore"}{" "}
                                            the selected{" "}
                                            {selectedRowKeys.length > 1
                                                ? "Video FAQs"
                                                : "Video FAQ"}
                                            ?
                                        </>
                                    }
                                    okText="Yes"
                                    cancelText="No"
                                    onConfirm={() => {
                                        handleSelectedArchived();
                                    }}
                                >
                                    <Button
                                        className={`${
                                            tableFilter.isTrash
                                                ? "btn-success"
                                                : "btn-main-secondary"
                                        } `}
                                        name="btn_active_archive"
                                        loading={isLoadingDeleteVideoFaq}
                                    >
                                        {!tableFilter.isTrash
                                            ? "ARCHIVE"
                                            : "ACTIVATE"}{" "}
                                        SELECTED
                                    </Button>
                                </Popconfirm>
                            )}
                        </Flex>

                        <Flex gap={10}>
                            <TableShowingEntriesV2 />

                            <TablePagination
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                                total={dataSource?.data.total}
                                showLessItems={true}
                                showSizeChanger={false}
                                tblIdWrapper="tbl_wrapper_product_type"
                            />
                        </Flex>
                    </div>
                </Col>

                <Col xs={24} sm={24} md={24}>
                    <TableVideoFaqs />
                </Col>

                <Col xs={24} sm={24} md={24}>
                    <div className="tbl-bottom-filter">
                        <div />

                        <Flex>
                            <TableShowingEntriesV2 />
                            <TablePagination
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                                total={dataSource?.data.total}
                                showLessItems={true}
                                showSizeChanger={false}
                                tblIdWrapper="tbl_wrapper"
                            />
                        </Flex>
                    </div>
                </Col>

                <ModalFormVideoFaqs />
            </Row>
        </PageVideoFaqContext.Provider>
    );
}
