import { useContext } from "react";
import { Button, Col, Flex, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import PageEmployeeContext from "./PageEmployeeContext";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";
import TableEmployee from "./TableEmployee";

export default function TabItemContentEmployee({ tblId }) {
    const { dataSource, navigate, location, tableFilter, setTableFilter } =
        useContext(PageEmployeeContext);

    return (
        <Row gutter={[20, 20]} id={`tbl_wrapper_employee_${tblId}`}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Flex gap={20}>
                    <Button
                        type="primary"
                        onClick={() => {
                            navigate(`${location.pathname}/add`);
                        }}
                        name="btn_upload_excel"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                    >
                        Add Employee
                    </Button>
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
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

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
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
                        <TableShowingEntriesV2 />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={dataSource?.data.total}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper={`tbl_wrapper_employee_${tblId}`}
                        />
                    </Flex>
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <TableEmployee tblId={tblId} />
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
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
                            tblIdWrapper={`tbl_wrapper_employee_${tblId}`}
                        />
                    </Flex>
                </Flex>
            </Col>
        </Row>
    );
}
