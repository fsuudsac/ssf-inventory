import { useState } from "react";
import { Col, Flex, Row, Table } from "antd";

import { GET } from "../../../../providers/useAxiosQuery";
import FloatSelect from "../../../../providers/FloatSelect";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";
import {
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";

export default function CollapseItemBudgetPerformance(props) {
    const { width, location } = props;

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "id",
        sort_order: "desc",
        school_year_ids: [],
        department_type_id: "",
        department_ids: [],
    });

    const { data: dataSchoolYears } = GET(
        `api/school_year`,
        "school_year_dropdown",
        () => {},
        false,
    );
    const { data: dataDepartmentTypes } = GET(
        `api/department_type`,
        "department_type_dropdown",
        () => {},
        false,
    );
    const { data: dataDepartments } = GET(
        `api/department`,
        "department_dropdown",
        () => {},
        false,
    );

    useTableScrollOnTop("tbl_wrapper_budget_performance", location);

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Row gutter={[20, 20]}>
                    <Col xs={24} sm={24} md={6}>
                        <FloatSelect
                            label="School Year"
                            placeholder="School Year"
                            mode="multiple"
                            options={dataSchoolYears?.data?.map((item) => ({
                                label: `${item.sy_from} - ${item.sy_to}`,
                                value: item.id,
                            }))}
                            onChange={(value) => {
                                setTableFilter((ps) => ({
                                    ...ps,
                                    school_year_ids: value || [],
                                }));
                            }}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={6}>
                        <FloatSelect
                            label="Department Type"
                            placeholder="Department Type"
                            options={dataDepartmentTypes?.data?.map((item) => ({
                                label: item.department_type,
                                value: item.id,
                            }))}
                            onChange={(value) => {
                                setTableFilter((ps) => ({
                                    ...ps,
                                    department_type_ids: value || "",
                                }));
                            }}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={6}>
                        <FloatSelect
                            label="Department"
                            placeholder="Department"
                            mode="multiple"
                            options={dataDepartments?.data?.map((item) => ({
                                label: item.department_name,
                                value: item.id,
                            }))}
                        />
                    </Col>
                </Row>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Row gutter={[12, 12]} id="tbl_wrapper_budget_performance">
                    <Col xs={24} sm={24} md={24}>
                        <Table
                            id="tbl_budget_performance"
                            className="ant-table-default ant-table-striped"
                            // dataSource={dataSource?.data?.data || []}
                            // loading={isLoadingSource || isFetchingSource}
                            rowKey={(record) => record.id}
                            pagination={false}
                            bordered={false}
                            // onChange={onChangeTable}
                            scroll={{ x: "max-content" }}
                            sticky
                        >
                            <Table.Column
                                title="Department"
                                key="department"
                                dataIndex="department"
                            />
                            {/* <Table.Column
                                title=""
                            /> */}
                        </Table>
                    </Col>

                    <Col xs={24} sm={24} md={24}>
                        <Flex
                            justify="space-between"
                            align="center"
                            className="tbl-bottom-filter"
                        >
                            <div />

                            <Flex align="center" gap={15}>
                                <TableShowingEntriesV2
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                />
                                <TablePagination
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                    // total={dataSource?.data?.total || 0}
                                    showLessItems={true}
                                    showSizeChanger={false}
                                    tblIdWrapper="tbl_budget_performance"
                                />
                            </Flex>
                        </Flex>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
}
