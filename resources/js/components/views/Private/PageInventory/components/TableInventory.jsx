import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Flex, Popconfirm, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import PageInventoryContext from "./PageInventoryContext";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";

export default function TableInventory(props) {
    const {
        dataSource,
        tableFilter,
        onChangeTable,
        handleSelectedArchived,
        isLoadingInventoryArchive,
        location,
    } = useContext(PageInventoryContext);

    const navigate = useNavigate();

    useTableScrollOnTop("tbl_inventory", location);

    return (
        <Table
            id="tbl_inventory"
            className="ant-table-default ant-table-striped"
            dataSource={dataSource && dataSource.data.data}
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            onChange={onChangeTable}
            scroll={{ x: "max-content" }}
            sticky
        >
            <Table.Column
                title="Action"
                key="action"
                dataIndex="action"
                align="center"
                width={130}
                render={(text, record) => {
                    return (
                        <Flex justify="center" gap={15}>
                            <Tooltip title="Edit">
                                <Button
                                    type="link"
                                    className="color-1"
                                    onClick={() =>
                                        navigate(
                                            `/inventory/edit/${record.product_id}`,
                                        )
                                    }
                                    icon={<FontAwesomeIcon icon={faPencil} />}
                                    name="btn_edit"
                                />
                            </Tooltip>
                            <Popconfirm
                                title={`Are you sure to ${
                                    tableFilter.isTrash === 0
                                        ? "archive"
                                        : "restore"
                                } this data?`}
                                onConfirm={() => {
                                    handleSelectedArchived(record);
                                }}
                                onCancel={() => {
                                    notification.error({
                                        message: "Purchase Order",
                                        description: `Data is not ${
                                            tableFilter.isTrash === 0
                                                ? "archived"
                                                : "restored"
                                        }.`,
                                    });
                                }}
                                okText="Yes"
                                cancelText="No"
                                name="btn_delete"
                            >
                                <Button
                                    type="link"
                                    className={`p-0 w-auto h-auto ${
                                        tableFilter.isTrash === 0
                                            ? "text-danger"
                                            : "text-success"
                                    }`}
                                    loading={isLoadingInventoryArchive}
                                    name="btn_delete"
                                    icon={<FontAwesomeIcon icon={faTrash} />}
                                />
                            </Popconfirm>
                        </Flex>
                    );
                }}
            />
            <Table.Column
                title="Product Name"
                key="product_name"
                dataIndex="product_name"
                sorter={true}
                width={180}
            />
            <Table.Column
                title="Product Type"
                key="product_type"
                dataIndex="product_type"
                sorter={true}
                width={150}
            />
            <Table.Column
                title="Product Size"
                key="product_size"
                dataIndex="product_size"
                sorter={true}
                width={150}
            />
            <Table.Column
                title="Available Stock"
                key="available_stock"
                dataIndex="available_stock"
                sorter={true}
                width={150}
            />
            <Table.Column
                title="Cost"
                key="cost"
                dataIndex="cost"
                sorter={true}
                width={150}
                render={(text, record) => {
                    const currentDate = dayjs();
                    const productDetailPrice =
                        record.product_detail_prices.find((item) => {
                            const startDate = dayjs(item.start_date);
                            const endDate = dayjs(item.end_date);
                            return (
                                currentDate.isAfter(startDate) &&
                                currentDate.isBefore(endDate)
                            );
                        });

                    return productDetailPrice ? productDetailPrice.cost : "";
                }}
            />
            <Table.Column
                title="Dealers Price"
                key="dealers_price"
                dataIndex="dealers_price"
                sorter={true}
                width={150}
                render={(text, record) => {
                    const currentDate = dayjs();
                    const productDetailPrice = record.product_detail_prices
                        ? record.product_detail_prices.find((item) => {
                              const startDate = dayjs(item.start_date);
                              const endDate = dayjs(item.end_date);
                              return (
                                  currentDate.isAfter(startDate) &&
                                  currentDate.isBefore(endDate)
                              );
                          })
                        : [];

                    return productDetailPrice
                        ? productDetailPrice.dealers_price
                        : "";
                }}
            />
            <Table.Column
                title="Wholesale Price"
                key="wholesale_price"
                dataIndex="wholesale_price"
                sorter={true}
                width={150}
                render={(text, record) => {
                    const currentDate = dayjs();
                    const productDetailPrice = record.product_detail_prices
                        ? record.product_detail_prices.find((item) => {
                              const startDate = dayjs(item.start_date);
                              const endDate = dayjs(item.end_date);
                              return (
                                  currentDate.isAfter(startDate) &&
                                  currentDate.isBefore(endDate)
                              );
                          })
                        : [];

                    return productDetailPrice
                        ? productDetailPrice.wholesale_price
                        : "";
                }}
            />

            <Table.Column
                title="SRP"
                key="srp"
                dataIndex="srp"
                sorter={true}
                width={150}
                render={(text, record) => {
                    const currentDate = dayjs();
                    const productDetailPrice = record.product_detail_prices
                        ? record.product_detail_prices.find((item) => {
                              const startDate = dayjs(item.start_date);
                              const endDate = dayjs(item.end_date);
                              return (
                                  currentDate.isAfter(startDate) &&
                                  currentDate.isBefore(endDate)
                              );
                          })
                        : [];

                    return productDetailPrice ? productDetailPrice.srp : "";
                }}
            />
            <Table.Column
                title="Fleet Price"
                key="fleet_price"
                dataIndex="fleet_price"
                sorter={true}
                width={150}
                render={(text, record) => {
                    const currentDate = dayjs();
                    const productDetailPrice = record.product_detail_prices
                        ? record.product_detail_prices.find((item) => {
                              const startDate = dayjs(item.start_date);
                              const endDate = dayjs(item.end_date);
                              return (
                                  currentDate.isAfter(startDate) &&
                                  currentDate.isBefore(endDate)
                              );
                          })
                        : [];

                    return productDetailPrice
                        ? productDetailPrice.fleet_price
                        : "";
                }}
            />
            <Table.Column
                title="Reorder Point"
                key="reorder_point"
                dataIndex="reorder_point"
                sorter={true}
                width={150}
            />
            <Table.Column
                title="Created At"
                key="created_at_format"
                dataIndex="created_at_format"
                sorter={true}
                width={150}
            />
        </Table>
    );
}
