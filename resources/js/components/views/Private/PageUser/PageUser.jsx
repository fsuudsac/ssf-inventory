import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Button, Col, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../providers/CustomTableFilter";
import TableUser from "./components/TableUser";
import ModalImport from "./components/ModalImport";
import useTableScrollOnTop from "../../../providers/useTableScrollOnTop";
import useWindowDimensions from "../../../providers/useWindowDimensions";

export default function PageUser(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const { width } = useWindowDimensions();

    const [toggleModalImport, setToggleModalImport] = useState({
        open: false,
        data: null,
    });

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        status: "Active",
    });

    useEffect(() => {
        let roles = "Super Admin,Admin,Staff,Manager";

        if (location.pathname === "/customers") {
            roles = "Customer";
        } else if (location.pathname === "/suppliers") {
            roles = "Supplier";
        }

        setTableFilter({
            page: 1,
            page_size: 50,
            search: "",
            sort_field: "created_at",
            sort_order: "desc",
            status: "Active",
        });

        return () => {};
    }, [location]);

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/users?${new URLSearchParams(tableFilter)}`,
        `users_list`,
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((ps) => ({
            ...ps,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    useTableScrollOnTop("tbl_user", location);

    return (
        <Row gutter={[20, 20]} id="tbl_wrapper">
            <Col xs={24} sm={24} md={24}>
                <Button
                    type="primary"
                    className={width < 576 ? "w-full" : "min-w-[150px]"}
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    onClick={() => navigate(`${location.pathname}/add`)}
                    name="btn_add"
                >
                    User
                </Button>
            </Col>

            <Col xs={24} sm={24} md={24}>
                <Flex
                    justify="space-between"
                    align="center"
                    className="tbl-top-filter"
                >
                    <Flex align="center" gap={15}>
                        <Button
                            type="primary"
                            className={`${width < 576 ? "w-full" : "min-w-[150px]"} ${
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
                            type="primary"
                            className={`${width < 576 ? "w-full" : "min-w-[150px]"} ${
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
                    <TableGlobalSearchAnimated
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />

                    <Flex align="center" gap={15}>
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
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24}>
                <TableUser
                    dataSource={dataSource}
                    onChangeTable={onChangeTable}
                    location={location}
                    tableFilter={tableFilter}
                />
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
                            total={dataSource?.data.total}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper="tbl_wrapper"
                        />
                    </Flex>
                </Flex>
            </Col>

            <ModalImport
                toggleModalImport={toggleModalImport}
                setToggleModalImport={setToggleModalImport}
            />
        </Row>
    );
}
