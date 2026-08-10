import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Button, Col, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInboxArrowDown, faPlus } from "@fortawesome/pro-regular-svg-icons";

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

export default function PageUser(props) {
    const navigate = useNavigate();
    const location = useLocation();

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
        roles:
            location.pathname === "/customers"
                ? "Customer"
                : location.pathname === "/suppliers"
                  ? "Supplier"
                  : "Super Admin,Admin,Staff,Manager",
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
            roles,
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
        <Row gutter={[12, 12]} id="tbl_wrapper">
            <Col xs={24} sm={24} md={24}>
                <Flex gap={12}>
                    <Button
                        className="btn-main-primary btn-main-invert-outline b-r-none"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() => navigate(`${location.pathname}/add`)}
                        name="btn_add"
                    >
                        {location.pathname === "/suppliers"
                            ? "Add Supplier"
                            : location.pathname === "/customers"
                              ? "Add Customer"
                              : "Add User"}
                    </Button>

                    {!location.pathname.includes("users") && (
                        <Button
                            icon={<FontAwesomeIcon icon={faInboxArrowDown} />}
                            className="btn-main-primary"
                            onClick={() =>
                                setToggleModalImport({
                                    open: true,
                                    data: null,
                                })
                            }
                            name="btn_import"
                        >
                            Import File
                        </Button>
                    )}
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24}>
                <div className="tbl-top-filter">
                    <Flex gap={12}>
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

                    <TablePageSize
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />
                </div>
            </Col>

            <Col xs={24} sm={24} md={24}>
                <div className="tbl-top-filter">
                    <TableGlobalSearchAnimated
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />

                    <TableShowingEntriesV2 />
                </div>
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

            <ModalImport
                toggleModalImport={toggleModalImport}
                setToggleModalImport={setToggleModalImport}
            />
        </Row>
    );
}
