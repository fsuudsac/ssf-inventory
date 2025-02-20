import { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";
import { Button, Col, Flex, Row } from "antd";

import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";
import PageStudentsContext from "./PageStudentContext";
import TableStudents from "./TableStudents";

export default function TabItemContentStudent({ tblId }) {
    const { dataSource, navigate, location, tableFilter, setTableFilter } =
        useContext(PageStudentsContext);

    return (
        <Row gutter={[20, 20]} id={`tbl_wrapper_student_${tblId}`}>
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
                        Add Student
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
                            tblIdWrapper={`tbl_wrapper_student_${tblId}`}
                        />
                    </Flex>
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <TableStudents tblId={tblId} />
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
                            tblIdWrapper={`tbl_wrapper_student_${tblId}`}
                        />
                    </Flex>
                </Flex>
            </Col>
        </Row>
    );
}
