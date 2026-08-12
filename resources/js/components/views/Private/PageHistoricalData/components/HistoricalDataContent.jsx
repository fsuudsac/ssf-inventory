import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Col, Flex, Row, Table } from "antd";

import { GET } from "../../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";

export default function HistoricalDataContent(props) {
    const {
        historicalable_type = [],
        profile_id = "",
        width,
        from = "",
    } = props;

    const location = useLocation();

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        from: from ? from : location.pathname,
        historicalable_type,
        profile_id,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/historical_data?${new URLSearchParams(tableFilter)}`,
        "historical_data_list",
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
        }));
    };

    useTableScrollOnTop("tbl_historical_data", location.pathname);

    return (
        <Row gutter={[20, 20]} id="tbl_historical_data_wrapper">
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Flex className="tbl-top-filter" justify="end" align="center">
                    {width >= 576 ? (
                        <TablePageSize
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    ) : (
                        <TableGlobalSearchAnimated
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    )}
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Flex
                    className="tbl-top-filter"
                    justify="space-between"
                    align={width < 576 ? "end" : "center"}
                    vertical={width < 576}
                >
                    {width >= 576 ? (
                        <TableGlobalSearchAnimated
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    ) : (
                        <TablePageSize
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    )}

                    <Flex
                        align="center"
                        gap={5}
                        vertical={width < 576}
                        className={
                            width < 576 ? "flex-column-reverse w-100" : ""
                        }
                    >
                        <TableShowingEntriesV2 />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={dataSource?.data.total}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper="tbl_historical_data_wrapper"
                        />
                    </Flex>
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Table
                    id="tbl_historical_data"
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
                >
                    <Table.Column
                        title="Created"
                        key="created_at"
                        dataIndex="created_at_format"
                        sorter
                        width={230}
                    />
                    <Table.Column
                        title="Subject"
                        key="subject"
                        dataIndex="subject"
                        sorter
                        width={180}
                    />
                    <Table.Column
                        title="Description"
                        key="description"
                        dataIndex="description"
                        sorter
                        width={220}
                    />
                    <Table.Column
                        title="Field Name"
                        key="field_name"
                        dataIndex="field_name"
                        sorter
                        width={150}
                    />
                    <Table.Column
                        title="Old Value"
                        key="old_value"
                        dataIndex="old_value"
                        sorter
                        width={150}
                    />
                    <Table.Column
                        title="New Value"
                        key="new_value"
                        dataIndex="new_value"
                        sorter
                        width={150}
                    />
                    <Table.Column
                        title="Module"
                        key="module"
                        dataIndex="module"
                        sorter
                        width={150}
                    />
                    <Table.Column
                        title="Action"
                        key="action"
                        dataIndex="action"
                        sorter
                        width={150}
                    />
                    <Table.Column
                        title="IP Address"
                        key="ip_address"
                        dataIndex="ip_address"
                        sorter
                        width={150}
                    />
                    <Table.Column
                        title="Browser"
                        key="browser"
                        dataIndex="browser"
                        sorter
                        width={200}
                    />
                    <Table.Column
                        title="Status"
                        key="status"
                        dataIndex="status"
                        align="center"
                        render={(text) => (
                            <div
                                className={`${
                                    text === "Failed"
                                        ? "danger-bg-color"
                                        : "success-bg-color"
                                } font-weight-500 text-white`}
                            >
                                {text}
                            </div>
                        )}
                        sorter
                        width={150}
                    />
                </Table>
            </Col>

            <Col xs={24} sm={24} md={24}>
                <Flex
                    className={`tbl-bottom-filter ${
                        width < 576 ? "flex-column-reverse" : ""
                    }`}
                    justify={width >= 576 ? "end" : ""}
                    align="center"
                    vertical={width < 576}
                    gap={5}
                >
                    <TableShowingEntriesV2 />

                    <TablePagination
                        tableFilter={tableFilter}
                        total={dataSource?.data.total}
                        showLessItems={true}
                        showSizeChanger={false}
                        tblIdWrapper="tbl_historical_data_wrapper"
                    />
                </Flex>
            </Col>
        </Row>
    );
}
