import { useContext, useEffect, useState } from "react";
import { Button, Col, Flex, notification, Row, Select, Table } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import PageEmployeeContext from "./PageEmployeeContext";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";
import ModalFormClaimImport from "./ModalFormClaimImport";
import notificationErrors from "../../../../providers/notificationErrors";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";

export default function TabItemContentImportEmployee() {
    const { navigate, location, setToggleModalUploadExcel } =
        useContext(PageEmployeeContext);

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [toggleModalClaim, setToggleModalClaim] = useState({
        open: false,
        data: null,
        columns: null,
    });

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at_formatted",
        sort_order: "desc",
        status: "Pending,Failed",
        from: location.pathname,
        type: "profile_employee_import",
        data_import_id: "",
    });

    const { data: dataImportSource } = GET(
        `api/data_imports?type=profile_employee_import&status=Pending,Failed`,
        "data_import_employee_dropdown_list"
    );

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/data_import_detail?${new URLSearchParams(tableFilter)}`,
        "data_import_detail_employee_list"
    );

    useEffect(() => {
        refetchSource();

        return () => {};
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

    const { mutate: mutateClaimImport, isLoading: isLoadingClaimImport } = POST(
        "api/data_import_detail_multiple",
        "data_import_detail_employee_list"
    );

    const handleClaimAll = () => {
        let columHeader = dataImportSource.data.find(
            (x) => x.id == tableFilter.data_import_id
        );

        let dataSourceCopy = dataSource?.data?.data
            .filter((x) => selectedRowKeys.find((y) => y === x.id))
            .map((item) => ({
                ...item,
                data_json: item.data_json ? JSON.parse(item.data_json) : {},
            }));

        let data = {
            header: columHeader,
            data: dataSourceCopy,
            type: "profile_employee_import",
        };

        mutateClaimImport(data, {
            onSuccess: (res) => {
                console.log("onSuccess: ", res);

                if (res.success) {
                    setSelectedRowKeys([]);
                    notification.success({
                        message: "Claim All",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Claim All",
                        description: res.message,
                    });
                }
            },
            onError: (error) => {
                notificationErrors(error);
            },
        });
    };

    const renderColumns = () => {
        if (dataImportSource && dataImportSource.data) {
            let dataImportSourceFind = dataImportSource.data.find(
                (x) => x.id == tableFilter.data_import_id
            );

            if (dataImportSourceFind && dataImportSourceFind.json_header) {
                let json_header = JSON.parse(dataImportSourceFind.json_header);

                const headerMapping = {
                    employeeno: "EMPLOYEE NO",
                    departmentcode: "DEPARTMENT CODE",
                    employeeclassification: "EMPLOYEE CLASSIFICATION",
                    employeestatus: "EMPLOYEE STATUS",
                    datehired: "DATE HIRED",
                };

                return json_header.map((item, index) => {
                    let header = headerMapping[item.toLowerCase()] || item;

                    const fieldMapping = {
                        employeeno: "school_id",
                        departmentcode: "department_code",
                        employeeclassification: "employee_classification",
                        employeestatus: "employee_status",
                        datehired: "date_hired",
                        monthlyrate: "monthly_rate",
                        pagibigno: "pag_ibig_no",
                        civilstatus: "civil_status",
                        contactnumber: "contact_number",
                        dateseparated: "date_separated",
                        payrollmode: "payroll_mode",
                        peraaidno: "peraa_id_no",
                        philhealthno: "philhealth_no",
                        sssno: "sss_no",
                        taxidno: "tax_id_no",
                        withpagibigdeduction: "with_pagibig_deduction",
                        withphilhealthdeduction: "with_philhealth_deduction",
                        withsssdeduction: "with_sss_deduction",
                        withtaxdeduction: "with_tax_deduction",
                    };

                    return (
                        <Table.Column
                            title={header}
                            key={index}
                            width={150}
                            sorter={(a, b) => {
                                let dataA = JSON.parse(a.data_json);
                                let dataB = JSON.parse(b.data_json);
                                let fieldKey = item.toLowerCase();
                                let valueA =
                                    dataA[fieldMapping[fieldKey] || fieldKey];
                                let valueB =
                                    dataB[fieldMapping[fieldKey] || fieldKey];
                                if (typeof valueA === "string") {
                                    return valueA.localeCompare(valueB);
                                }
                                return valueA - valueB;
                            }}
                            render={(_, record) => {
                                let data_json = JSON.parse(record.data_json);
                                const fieldKey = item.toLowerCase();
                                const displayValue =
                                    data_json[
                                        fieldMapping[fieldKey] || fieldKey
                                    ];

                                return <div>{displayValue}</div>;
                            }}
                        />
                    );
                });
            }
        }
    };

    useTableScrollOnTop("tbl_data_import", location);

    return (
        <Row gutter={[20, 20]} id="tbl_wrapper">
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Flex gap={20}>
                    <Button
                        type="primary"
                        onClick={() => setToggleModalUploadExcel(true)}
                        name="btn_upload_excel"
                        icon={<FontAwesomeIcon icon={faFileExcel} />}
                    >
                        Upload File Excel
                    </Button>
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Flex className="tbl-top-filter">
                    <Select
                        placeholder="Select Data Import"
                        className="select-data-import-dropdown"
                        value={
                            tableFilter.data_import_id
                                ? tableFilter.data_import_id
                                : null
                        }
                        options={
                            dataImportSource && dataImportSource.data
                                ? dataImportSource.data.map((item) => ({
                                      value: item.id,
                                      label: item.file_name,
                                  }))
                                : []
                        }
                        allowClear
                        onChange={(value) => {
                            setTableFilter((ps) => ({
                                ...ps,
                                data_import_id: value ?? "",
                            }));
                        }}
                    />
                    <TablePageSize
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Flex className="tbl-top-filter">
                    <Flex gap={15}>
                        <TableGlobalSearchAnimated
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />

                        {selectedRowKeys.length > 0 && (
                            <Button
                                className="btn-main-primary"
                                onClick={() => handleClaimAll()}
                                loading={isLoadingClaimImport}
                            >
                                Claim All
                            </Button>
                        )}
                    </Flex>

                    <Flex>
                        <TableShowingEntriesV2 />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={dataSource?.data?.total}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper="tbl_wrapper"
                        />
                    </Flex>
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Table
                    id="tbl_data_import"
                    className="ant-table-default ant-table-striped"
                    dataSource={
                        dataSource && dataSource.data.data
                            ? dataSource.data.data
                            : []
                    }
                    rowKey={(record) => record.id}
                    pagination={false}
                    bordered={false}
                    onChange={onChangeTable}
                    scroll={{ x: "max-content" }}
                    sticky
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (selectedRowKeys) => {
                            setSelectedRowKeys(selectedRowKeys);
                        },
                    }}
                >
                    <Table.Column
                        title="Action"
                        key="action"
                        dataIndex="action"
                        align="center"
                        render={(text, record) => {
                            return (
                                <Flex gap={15} justify="center">
                                    <Button
                                        onClick={() => {
                                            console.log("record: ", record);
                                            let dataImportSourceFind =
                                                dataImportSource.data.find(
                                                    (x) =>
                                                        x.id ==
                                                        tableFilter.data_import_id
                                                );

                                            setToggleModalClaim({
                                                open: true,
                                                data: record,
                                                columns:
                                                    dataImportSourceFind.json_header
                                                        ? JSON.parse(
                                                              dataImportSourceFind.json_header
                                                          )
                                                        : null,
                                            });
                                        }}
                                        name="btn_claim"
                                    >
                                        Claim
                                    </Button>
                                </Flex>
                            );
                        }}
                        width={150}
                    />

                    {renderColumns()}

                    <Table.Column
                        title="Remarks"
                        key="remarks"
                        dataIndex="remarks"
                        width={250}
                    />
                </Table>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Flex className="tbl-bottom-filter">
                    <div />

                    <Flex>
                        <TableShowingEntriesV2 />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={dataSource?.data?.total}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper="tbl_wrapper"
                        />
                    </Flex>
                </Flex>
            </Col>

            <ModalFormClaimImport
                toggleModalClaim={toggleModalClaim}
                setToggleModalClaim={setToggleModalClaim}
            />
        </Row>
    );
}
