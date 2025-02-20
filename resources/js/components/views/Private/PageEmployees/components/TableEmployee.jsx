import { useContext } from "react";
import { Button, Flex, Table } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPencil } from "@fortawesome/pro-regular-svg-icons";

import PageEmployeeContext from "./PageEmployeeContext";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";

export default function TableEmployee({ tblId }) {
    const {
        dataSource,
        setTableFilter,
        navigate,
        location,
        setToggleModalPreview,
    } = useContext(PageEmployeeContext);

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((ps) => ({
            ...ps,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    useTableScrollOnTop(`tbl_employee_${tblId}`, location);

    return (
        <Table
            id={`tbl_employee_${tblId}`}
            className="ant-table-default ant-table-striped"
            dataSource={
                dataSource && dataSource.data.data ? dataSource.data.data : []
            }
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
                render={(text, record) => {
                    return (
                        <Flex gap={10} justify="center">
                            <Button
                                type="link"
                                className="w-auto h-auto p-0"
                                onClick={() => {
                                    navigate(
                                        `${location.pathname}/edit/${record.id}`
                                    );
                                }}
                                name="btn_edit"
                                icon={<FontAwesomeIcon icon={faPencil} />}
                            />
                            <Button
                                type="link"
                                className="w-auto h-auto p-0"
                                onClick={() => {
                                    setToggleModalPreview({
                                        open: true,
                                        data: record,
                                    });
                                }}
                                name="btn_preview"
                                icon={<FontAwesomeIcon icon={faEye} />}
                            />
                        </Flex>
                    );
                }}
                width={150}
            />
            <Table.Column
                title="Employee ID"
                key="school_id"
                dataIndex="school_id"
                sorter={true}
                render={(text, record) =>
                    text ? (
                        <Button
                            type="link"
                            className="p-0 w-auto h-auto"
                            onClick={() => {
                                navigate(
                                    `${location.pathname}/edit/${record.id}`
                                );
                            }}
                        >
                            {text}
                        </Button>
                    ) : null
                }
                width={220}
            />
            <Table.Column
                title="Full Name"
                key="fullname"
                dataIndex="fullname"
                sorter={true}
                render={(text, record) =>
                    text ? (
                        <Button
                            type="link"
                            className="p-0 w-auto h-auto"
                            onClick={() => {
                                navigate(
                                    `${location.pathname}/edit/${record.id}`
                                );
                            }}
                        >
                            {text}
                        </Button>
                    ) : null
                }
                width={220}
            />
            <Table.Column
                title="Email"
                key="email"
                dataIndex="email"
                sorter={true}
                align="center"
                render={(text, _) =>
                    text ? (
                        <Button
                            type="link"
                            className="p-0 w-auto h-auto"
                            icon={<FontAwesomeIcon icon={faEnvelope} />}
                            href={`mailto:${text}`}
                        />
                    ) : null
                }
                width={220}
            />
            <Table.Column
                title="Contact Number"
                key="contact_number"
                width={150}
            />
            <Table.Column
                title="Start Date"
                key="created_at_formatted"
                dataIndex="created_at_formatted"
                sorter
                width={150}
            />
        </Table>
    );
}
