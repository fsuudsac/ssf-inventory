import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Col, Flex, Popconfirm, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../providers/CustomTableFilter";
import TableFaculty from "./components/TableFaculty";
import ModalFacultyFormUploadExcel from "./components/ModalFacultyFormUploadExcel";
import ModalFacultyShowSchedule from "./components/ModalFacultyShowSchedule";
import useTableScrollOnTop from "../../../providers/useTableScrollOnTop";

export default function PageFaculty() {
    const location = useLocation();

    const [toggleModalUploadExcel, setToggleModalUploadExcel] = useState(false);
    const [toggleModalShowSchedules, setToggleModalShowSchedules] = useState({
        open: false,
        data: null,
    });

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        isTrash: 0,
        from: location.pathname,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/profile?${new URLSearchParams(tableFilter)}`,
        "faculty_upload_excel"
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

    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useTableScrollOnTop("tbl1", location);

    return (
        <Row gutter={[20, 20]} id="tbl_wrapper">
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Button
                    type="primary"
                    className="min-w-150"
                    onClick={() => setToggleModalUploadExcel(true)}
                    name="btn_upload_excel"
                    icon={<FontAwesomeIcon icon={faFileExcel} />}
                >
                    Upload File Excel
                </Button>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <div className="tbl-top-filter first">
                    <Flex gap={15}>
                        <Button
                            className={`btn-main-primary min-w-150 ${
                                tableFilter.status === "Active"
                                    ? "active"
                                    : "outlined"
                            }`}
                            onClick={() => {
                                setTableFilter((ps) => ({
                                    ...ps,
                                    status: "Active",
                                }));
                            }}
                        >
                            Active
                        </Button>

                        <Button
                            className={`btn-main-primary min-w-150 ${
                                tableFilter.status === "Archived"
                                    ? "active"
                                    : "outlined"
                            }`}
                            onClick={() => {
                                setTableFilter((ps) => ({
                                    ...ps,
                                    status: "Archived",
                                }));
                            }}
                        >
                            Archived
                        </Button>
                    </Flex>

                    <Flex gap={15} justify="space-between">
                        {width <= 991 && (
                            <TableGlobalSearchAnimated
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />
                        )}

                        <TablePageSize
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    </Flex>
                </div>
            </Col>

            <Col xs={24} sm={24} md={24}>
                <div className="tbl-top-filter second">
                    {width > 991 && (
                        <Flex gap={15}>
                            <TableGlobalSearchAnimated
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />
                        </Flex>
                    )}

                    <Flex
                        gap={15}
                        justify={width <= 991 ? "space-between" : ""}
                        className={width <= 991 ? "w-100" : ""}
                    >
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

            <Col xs={24} sm={24} md={24}>
                <TableFaculty
                    dataSource={dataSource}
                    onChangeTable={onChangeTable}
                    setToggleModalShowSchedules={setToggleModalShowSchedules}
                />
            </Col>

            <Col xs={24} sm={24} md={24}>
                <div className="tbl-bottom-filter">
                    <TableShowingEntriesV2 />
                    <TablePagination
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                        total={dataSource?.data.total}
                        showLessItems={true}
                        showSizeChanger={false}
                        tblIdWrapper="tbl_wrapper"
                    />
                </div>
            </Col>

            <ModalFacultyFormUploadExcel
                toggleModalUploadExcel={toggleModalUploadExcel}
                setToggleModalUploadExcel={setToggleModalUploadExcel}
            />

            <ModalFacultyShowSchedule
                toggleModalShowSchedules={toggleModalShowSchedules}
                setToggleModalShowSchedules={setToggleModalShowSchedules}
            />
        </Row>
    );
}
