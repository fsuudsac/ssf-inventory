import { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScreenUsers } from "@fortawesome/pro-regular-svg-icons";
import { Button, Table } from "antd";

import PageStudentsContext from "./PageStudentContext";
import useTableScrollOnTop from "../../../../providers/useTableScrollOnTop";

export default function TableStudents({ tblId }) {
    const { dataSource, onChangeTable, setToggleModalShowSchedules } =
        useContext(PageStudentsContext);

    useTableScrollOnTop(`tbl_student_${tblId}`);

    return (
        <Table
            id={`tbl_student_${tblId}`}
            className="ant-table-default ant-table-striped"
            dataSource={
                dataSource && dataSource.data ? dataSource.data.data : []
            }
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            onChange={onChangeTable}
            scroll={{ x: "max-content" }}
            sticky
        >
            <Table.Column
                title="Created At"
                key="created_at_formatted"
                dataIndex="created_at_formatted"
                width={150}
                sorter
            />
            <Table.Column
                title="School ID"
                key="school_id"
                dataIndex="school_id"
                width={120}
                sorter
            />
            <Table.Column
                title="Name"
                key="fullname"
                dataIndex="fullname"
                width={120}
                sorter
            />
            <Table.Column
                title="Schedule"
                key="schedule_list"
                align="center"
                width={100}
                render={(text, record) => {
                    return (
                        <>
                            <Button
                                type="link"
                                className="p-0 w-auto h-auto"
                                onClick={() => {
                                    setToggleModalShowSchedules({
                                        open: true,
                                        data: record,
                                    });
                                }}
                                icon={<FontAwesomeIcon icon={faScreenUsers} />}
                            />
                        </>
                    );
                }}
            />
        </Table>
    );
}
