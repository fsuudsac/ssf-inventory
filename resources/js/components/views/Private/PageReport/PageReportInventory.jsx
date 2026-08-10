import { Button, Col, DatePicker, Flex, Row, Select, Table } from "antd";
import { useEffect, useState } from "react";
import {
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../providers/CustomTableFilter";
import { GET } from "../../../providers/useAxiosQuery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/pro-regular-svg-icons";
import ModalInventoryLedger from "./components/ModalInventoryLedger";
import FloatSelect from "../../../providers/FloatSelect";
import useTableScrollOnTop from "../../../providers/useTableScrollOnTop";

export default function PageReportInventory() {
    const [toggleModalInventoryLedger, setToggleModalInventoryLedger] =
        useState({
            open: false,
            data: null,
        });

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_order: "desc",
        warehouse_ids: [],
        sort_field: "available_stock",
        inventoryStatus: null,
    });

    const { data: dataWarehouse } = GET(
        `api/warehouse`,
        "warehouse_dropdown_list",
        () => {},
        false,
    );

    const { data: dataInventory, refetch: refetchInventory } = GET(
        `api/product_inventory?${new URLSearchParams(tableFilter)}`,
        "inventory_product_list",
    );

    useEffect(() => {
        refetchInventory();

        return () => {};
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

    useTableScrollOnTop("tbl_inventory", "tbl_inventory");

    return (
        <Row gutter={[12, 12]} id="tbl_wrapper_inventory">
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <div className="tbl-top-filter">
                    <Flex className="flex-wrapper-filter">
                        <Select
                            className="w-100"
                            placeholder="Select Status"
                            showSearch
                            allowClear
                            options={[
                                {
                                    value: "Low Inventory",
                                    label: "Low Inventory",
                                },
                                {
                                    value: "Out of Stock",
                                    label: "Out of Stock",
                                },
                                {
                                    value: "Higher than 'Reorder Point'",
                                    label: "Higher than 'Reorder Point'",
                                },
                            ]}
                            value={tableFilter.inventoryStatus || undefined}
                            onChange={(value) => {
                                setTableFilter((prevState) => ({
                                    ...prevState,
                                    inventoryStatus: value,
                                }));
                            }}
                        />

                        <FloatSelect
                            placeholder="Select Warehouse"
                            className="w-100 b-0"
                            multi="multiple"
                            allowClear
                            showSearch
                            filterOption={(input, option) => {
                                return option.label
                                    .toLowerCase()
                                    .includes(input.toLowerCase());
                            }}
                            options={
                                dataWarehouse && dataWarehouse.data
                                    ? dataWarehouse.data.map((item) => ({
                                          value: item.id,
                                          label: item.warehouse_name,
                                      }))
                                    : []
                            }
                            value={tableFilter.warehouse_ids || null}
                            onChange={(value) => {
                                setTableFilter((ps) => ({
                                    ...ps,
                                    warehouse_ids: value ?? [],
                                }));
                            }}
                        />
                    </Flex>
                </div>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Flex justify="end">
                    <TablePageSize
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <div className="tbl-top-filter">
                    <Flex gap={10}>
                        <Button
                            className="btn-main-primary"
                            icon={<FontAwesomeIcon icon={faDownload} />}
                            iconPosition="end"
                            onClick={() => {
                                setToggleModalInventoryLedger({
                                    open: true,
                                    data: {
                                        warehouse_id: tableFilter.warehouse_id,
                                        status: tableFilter.inventoryStatus,
                                    },
                                });
                            }}
                        >
                            Export Pdf
                        </Button>
                        {/* <Button
                            className="btn-main-primary"
                            icon={<FontAwesomeIcon icon={faDownload} />}
                            iconPosition="end"
                        >
                            Export Excel
                        </Button> */}
                    </Flex>
                    <Flex gap={10}>
                        <TableShowingEntriesV2 />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={dataInventory?.data.total}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper="tbl_wrapper_inventory"
                        />
                    </Flex>
                </div>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Table
                    id="tbl_inventory"
                    className="ant-table-default ant-table-striped"
                    dataSource={dataInventory && dataInventory.data.data}
                    rowKey={(record) => record.id}
                    pagination={false}
                    bordered={false}
                    onChange={onChangeTable}
                    scroll={{ x: "max-content" }}
                    sticky
                >
                    <Table.Column
                        title="Product Name"
                        key="product_name"
                        dataIndex="product_name"
                        sorter={true}
                        width={220}
                    />
                    <Table.Column
                        title="Product Type"
                        key="product_type"
                        dataIndex="product_type"
                        width={150}
                        sorter={true}
                    />
                    <Table.Column
                        title="Product size"
                        key="product_size"
                        dataIndex="product_size"
                        width={150}
                        sorter={true}
                    />
                    <Table.Column
                        title="Status"
                        key="reorder_point"
                        dataIndex="reorder_point"
                        sorter={true}
                        align="center"
                        width={150}
                        render={(text, record) => {
                            console.log("record: ", record);

                            return (
                                <span>
                                    {record.available_stock === 0 ? (
                                        <strong style={{ color: "red" }}>
                                            Out of Stock
                                        </strong>
                                    ) : Number(record.reorder_point) >
                                      record.available_stock ? (
                                        <p style={{ color: "orange" }}>
                                            Low Inventory
                                        </p>
                                    ) : Number(record.reorder_point) <
                                      record.available_stock ? (
                                        <p
                                            style={{
                                                color: "green",
                                            }}
                                        >
                                            Higher than 'Reorder Point'
                                        </p>
                                    ) : (
                                        ""
                                    )}
                                </span>
                            );
                        }}
                    />
                    <Table.Column
                        title="Inventory Count"
                        key="available_stock"
                        dataIndex="available_stock"
                        sorter={true}
                        width={150}
                    />
                </Table>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <div className="tbl-bottom-filter">
                    <div />

                    <Flex>
                        <TableShowingEntriesV2 />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={dataInventory ? dataInventory.data.total : 0}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper="tbl_wrapper_inventory"
                        />
                    </Flex>
                </div>
            </Col>

            <ModalInventoryLedger
                toggleModalInventoryLedger={toggleModalInventoryLedger}
                setToggleModalInventoryLedger={setToggleModalInventoryLedger}
                tableFilter={tableFilter}
            />
        </Row>
    );
}
