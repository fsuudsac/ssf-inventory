import { useEffect } from "react";
import { Modal, Button, Row, Col, Table } from "antd";

import { GET } from "../../../../providers/useAxiosQuery";

export default function ModalFacultyShowSchedule(props) {
    const { toggleModalShowSchedules, setToggleModalShowSchedules } = props;

    const { data: dataSchedule, refetch: refetchSchedule } = GET(
        `api/scheduling?student_id=${
            toggleModalShowSchedules.data && toggleModalShowSchedules.data.id
        }`,
        "schedule_list"
    );

    useEffect(() => {
        refetchSchedule();

        return () => {};
    }, [toggleModalShowSchedules]);

    return (
        <Modal
            title="Schedule List"
            open={toggleModalShowSchedules.open}
            wrapClassName="modal-wrap-student-upload-excel"
            onCancel={() => {
                setToggleModalShowSchedules({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalShowSchedules({
                            open: false,
                            data: null,
                        });
                    }}
                >
                    Close
                </Button>,
            ]}
            forceRender
        >
            <Row gutter={[12, 12]} id="tbl_wrapper">
                <Col xs={24} sm={24} md={24} className="text-center">
                    <Table
                        id="table-students"
                        className="ant-table-default ant-table-striped"
                        dataSource={
                            dataSchedule && dataSchedule.data
                                ? dataSchedule.data
                                : []
                        }
                        rowKey={(record) => record.id}
                        pagination={false}
                        bordered={false}
                        scroll={{ x: "max-content" }}
                    >
                        <Table.Column
                            title="Subject Code"
                            key="subject_code"
                            dataIndex="subject_code"
                            width={150}
                        />
                        <Table.Column
                            title="Section"
                            key="section"
                            dataIndex="section"
                            width={120}
                        />
                        <Table.Column
                            title="School Year"
                            key="school_year"
                            dataIndex="school_year"
                            width={120}
                        />
                        <Table.Column
                            title="Semester"
                            key="semester"
                            dataIndex="semester"
                            width={120}
                        />
                    </Table>
                </Col>
            </Row>
        </Modal>
    );
}
