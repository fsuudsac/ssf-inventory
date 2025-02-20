import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Button, Col, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../providers/useAxiosQuery";
import TableUser from "./components/TableUser";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../providers/CustomTableFilter";
import useTableScrollOnTop from "../../../providers/useTableScrollOnTop";

export default function PageUser() {
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        status: ["Active"],
        from: location.pathname,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/users?${new URLSearchParams(tableFilter)}`,
        ["users_active_list", "check_user_permission"]
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    useTableScrollOnTop("tbl_user", location);

    return (
        <Row gutter={[20, 20]} id="tbl_wrapper">
            <Col xs={24} sm={24} md={24} lg={24}>
                <Button
                    type="primary"
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    onClick={() => navigate(`/users/add`)}
                    name="btn_add"
                >
                    Add User
                </Button>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24}>
                <Flex
                    justify="space-between"
                    align="center"
                    className="tbl-top-filter"
                >
                    <div />
                    <TablePageSize
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24}>
                <Flex
                    justify="space-between"
                    align="center"
                    className="tbl-top-filter"
                >
                    <TableGlobalSearchAnimated
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />

                    <Flex align="center">
                        <TableShowingEntriesV2 />{" "}
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

            <Col xs={24} sm={24} md={24} lg={24}>
                <TableUser
                    dataSource={dataSource}
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    selectedRowKeys={selectedRowKeys}
                    setSelectedRowKeys={setSelectedRowKeys}
                />
            </Col>

            <Col xs={24} sm={24} md={24} lg={24}>
                <Flex
                    justify="space-between"
                    align="center"
                    className="tbl-bottom-filter"
                >
                    <div />

                    <Flex align="center">
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
        </Row>
    );
}
