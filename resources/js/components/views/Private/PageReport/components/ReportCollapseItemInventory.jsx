import { useEffect, useState } from "react";
import { Button, Col, DatePicker, Flex, Row, Select, Table } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../../providers/useAxiosQuery";
import {
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
    useTableScrollOnTop,
} from "../../../../providers/CustomTableFilter";

export default function ReportCollapseItemInventory() {
    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_order: "desc",
        warehouse_id: [],
        product_id: [],
        sort_field: "date_inventory_formatted",
        date_inventory: [],
    });

    // console.log("tableFilter: ", tableFilter);

    const { data: dataWarehouse } = GET(
        `api/warehouse`,
        "warehouse_dropdown_list",
        () => {},
        false
    );
    const { data: dataProduct } = GET(
        `api/products`,
        "products_dropdown_list",
        () => {},
        false
    );

    const { data: dataInventory, refetch: refetchInventory } = GET(
        `api/inventory`,
        "inventory_product_list"
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

    // console.log("dataInventory: ", dataInventory);
    // console.log("dataWarehouse: ", dataWarehouse);
    // console.log("dataProduct: ", dataProduct);

    useTableScrollOnTop("tbl_inventory", "tbl_inventory");

    return (
        // <></>
        <Row gutter={[20, 20]} id="tbl_wrapper_inventory">
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <div className="tbl-top-filter">
                    <Flex className="flex-wrapper-filter">
                        <Select
                            mode="multiple"
                            className="w-100"
                            placeholder="Select Warehouse"
                            showSearch
                            allowClear
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
                            onChange={(value) => {
                                setTableFilter((ps) => ({
                                    ...ps,
                                    warehouse_id: value,
                                }));
                            }}
                        />

                        <Select
                            mode="multiple"
                            className="w-100"
                            placeholder="Select Product"
                            showSearch
                            allowClear
                            filterOption={(input, option) => {
                                return option.label
                                    .toLowerCase()
                                    .includes(input.toLowerCase());
                            }}
                            options={
                                dataProduct && dataProduct.data
                                    ? dataProduct.data
                                          .filter((product) =>
                                              dataInventory &&
                                              dataInventory.data
                                                  ? dataInventory.data.some(
                                                        (inventory) =>
                                                            tableFilter
                                                                .warehouse_id
                                                                .length === 0 ||
                                                            (tableFilter.warehouse_id.includes(
                                                                inventory.warehouse_id
                                                            ) &&
                                                                inventory.product_detail_id ===
                                                                    product.id)
                                                    )
                                                  : true
                                          )
                                          .map((item) => ({
                                              value: item.id,
                                              label: item.product_name,
                                          }))
                                    : []
                            }
                            onChange={(value) => {
                                setTableFilter((ps) => ({
                                    ...ps,
                                    product_id: value,
                                }));
                            }}
                        />

                        <DatePicker.RangePicker
                            value={tableFilter.date_inventory}
                            onChange={(date, dateString) => {
                                setTableFilter((ps) => ({
                                    ...ps,
                                    date_inventory: date,
                                    date_inventory_string: dateString,
                                }));
                            }}
                        />
                    </Flex>

                    <TablePageSize
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />
                </div>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <div className="tbl-top-filter">
                    <Flex gap={10}>
                        <Button
                            className="btn-main-primary"
                            icon={<FontAwesomeIcon icon={faDownload} />}
                            iconPosition="end"
                        >
                            Export Pdf
                        </Button>
                        <Button
                            className="btn-main-primary"
                            icon={<FontAwesomeIcon icon={faDownload} />}
                            iconPosition="end"
                        >
                            Export Excel
                        </Button>
                    </Flex>
                    <Flex gap={10}>
                        <TableShowingEntriesV2 />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={
                                dataInventory ? dataInventory.data.length : 0
                            }
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
                    dataSource={
                        dataInventory && dataInventory.data
                            ? dataInventory.data.filter((item) => {
                                  const matchesWarehouse =
                                      tableFilter.warehouse_id.length > 0
                                          ? tableFilter.warehouse_id.includes(
                                                item.warehouse_id
                                            )
                                          : true;
                                  const matchesProduct =
                                      tableFilter.product_id.length > 0
                                          ? tableFilter.product_id.includes(
                                                item.product_detail_id
                                            )
                                          : true;
                                  const matchesDateInventory =
                                      Array.isArray(
                                          tableFilter.date_inventory
                                      ) && tableFilter.date_inventory.length
                                          ? new Date(item.date_inventory) >=
                                                new Date(
                                                    tableFilter.date_inventory[0]
                                                ) &&
                                            new Date(item.date_inventory) <=
                                                new Date(
                                                    tableFilter.date_inventory[1]
                                                )
                                          : true;
                                  return (
                                      matchesWarehouse &&
                                      matchesProduct &&
                                      matchesDateInventory
                                  );
                              })
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
                        title="Warehouse"
                        key="warehouse_name"
                        dataIndex="warehouse_name"
                        sorter={true}
                        width={200}
                    />
                    <Table.Column
                        title="Address"
                        key="address"
                        dataIndex="address"
                        sorter={true}
                        width={300}
                    />
                    <Table.Column
                        title="Product"
                        key="product_name"
                        dataIndex="product_name"
                        sorter={true}
                    />
                    <Table.Column
                        title="Type"
                        key="type"
                        dataIndex="type"
                        sorter={true}
                    />
                    <Table.Column
                        title="Quantity"
                        key="quantity"
                        dataIndex="quantity"
                        sorter={true}
                        width={150}
                    />
                    <Table.Column
                        title="Amount"
                        key="amount"
                        dataIndex="amount"
                        sorter={true}
                        width={250}
                    />
                    <Table.Column
                        title="Date Inventory"
                        key="date_inventory_formatted"
                        dataIndex="date_inventory_formatted"
                        sorter={true}
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
        </Row>
    );
}
