import { useEffect, useState } from "react";
import { Button, Col, Row, Space, Table, notification, Form, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import {
    TableGlobalSearch,
    TablePageSize,
    TablePagination,
    TableShowingEntries,
} from "../../../../providers/CustomTableFilter";
import ModalFormModule from "./ModalFormModule";
import notificationErrors from "../../../../providers/notificationErrors";

export default function TabPermissionModule() {
    const [form] = Form.useForm();

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "module_code",
        sort_order: "asc",
        system_id: 1,
    });

    const [toggleModalModule, setToggleModalModule] = useState({
        open: false,
        data: null,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/module?${new URLSearchParams(tableFilter)}`,
        "module_list",
    );

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((prevState) => ({
            ...prevState,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    useEffect(() => {
        if (dataSource) {
            refetchSource();
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    const { mutate: mutateModule, loading: loadingModule } = POST(
        `api/module`,
        "module_list",
    );

    const onFinishModule = (values) => {
        let data = {
            ...values,
            module_buttons: values.module_buttons
                ? values.module_buttons.map((item) => ({
                      ...item,
                      id: item.id ? item.id : null,
                  }))
                : null,
            id:
                toggleModalModule.data && toggleModalModule.data.id
                    ? toggleModalModule.data.id
                    : "",
            system_id: 1,
        };

        mutateModule(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setToggleModalModule({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    notification.success({
                        message: "Module",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Module",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    return (
        <>
            <Row gutter={[12, 12]} id="tbl_wrapper_permission_module_opis">
                <Col xs={24} sm={24} md={24}>
                    <Button
                        type="primary"
                        onClick={() =>
                            setToggleModalModule({
                                open: true,
                                data: null,
                            })
                        }
                    >
                        Add Module
                    </Button>
                </Col>

                <Col xs={24} sm={24} md={24}>
                    <div className="tbl-top-filter">
                        <TablePageSize
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                        <TableGlobalSearch
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    </div>
                </Col>

                <Col xs={24} sm={24} md={24}>
                    <Table
                        id="tbl_permission_module_opis"
                        className="ant-table-default ant-table-striped"
                        dataSource={dataSource && dataSource.data.data}
                        rowKey={(record) => record.id}
                        pagination={false}
                        bordered={false}
                        onChange={onChangeTable}
                        scroll={{ x: "max-content" }}
                    >
                        <Table.Column
                            align="center"
                            title="Actions"
                            render={(_, record) => {
                                return (
                                    <Button
                                        type="link"
                                        icon={
                                            <FontAwesomeIcon icon={faPencil} />
                                        }
                                        onClick={() =>
                                            setToggleModalModule({
                                                open: true,
                                                data: record,
                                            })
                                        }
                                    />
                                );
                            }}
                        />

                        <Table.Column
                            title="Module Code"
                            key="module_code"
                            dataIndex="module_code"
                            sorter={true}
                            defaultSortOrder="ascend"
                        />

                        <Table.Column
                            title="Module Name"
                            key="module_name"
                            dataIndex="module_name"
                            sorter={true}
                        />

                        <Table.Column
                            title="Module Actions"
                            key="module_buttons"
                            render={(_, record) => {
                                return record.module_buttons ? (
                                    <Space direction="vertical">
                                        {record.module_buttons.map(
                                            (item, index) => (
                                                <Space
                                                    key={index}
                                                    className="module-button-wrapper"
                                                    size={0}
                                                >
                                                    <div>
                                                        {item.mod_button_code}
                                                    </div>
                                                    <div>
                                                        {item.mod_button_name}
                                                    </div>
                                                    {item.mod_button_description ? (
                                                        <div>
                                                            {
                                                                item.mod_button_description
                                                            }
                                                        </div>
                                                    ) : null}
                                                </Space>
                                            ),
                                        )}
                                    </Space>
                                ) : null;
                            }}
                        />
                    </Table>
                </Col>

                <Col xs={24} sm={24} md={24}>
                    <div className="tbl-bottom-filter">
                        <div />

                        <Flex>
                            <TableShowingEntries />
                            <TablePagination
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                                total={dataSource?.data.total}
                                showLessItems={true}
                                showSizeChanger={false}
                                tblIdWrapper="tbl_wrapper_permission_module_opis"
                            />
                        </Flex>
                    </div>
                </Col>
            </Row>

            <ModalFormModule
                toggleModalModule={toggleModalModule}
                setToggleModalModule={setToggleModalModule}
                onFinish={onFinishModule}
                loading={loadingModule}
                form={form}
            />
        </>
    );
}
