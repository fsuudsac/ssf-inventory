import { useContext } from "react";
import { Button, Flex, Table, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/pro-regular-svg-icons";

import PageCreditTermsContext from "./PageCreditTermsContext";

export default function TableCreditTerms() {
    const {
        dataSource,
        isLoadingSource,
        isFetchingSource,
        setToggleModalFormCreditTerms,
        setSelectedRowKeys,
        selectedRowKeys,
        onChangeTable,
    } = useContext(PageCreditTermsContext);

    return (
        <Table
            id="tbl_credit_term"
            className="ant-table-default ant-table-striped"
            dataSource={dataSource?.data?.data || []}
            loading={isLoadingSource || isFetchingSource}
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            onChange={onChangeTable}
            scroll={{ x: "max-content" }}
            rowSelection={{
                selectedRowKeys,
                onChange: (selectedRowKeys) => {
                    setSelectedRowKeys(selectedRowKeys);
                },
            }}
            sticky
        >
            <Table.Column
                title="Action"
                key="action"
                dataIndex="action"
                align="center"
                width={80}
                render={(_, record) => {
                    return (
                        <Flex justify="center">
                            <Tooltip title="Edit">
                                <Button
                                    type="link"
                                    className="color-1"
                                    onClick={() =>
                                        setToggleModalFormCreditTerms({
                                            open: true,
                                            data: record,
                                        })
                                    }
                                    icon={<FontAwesomeIcon icon={faPencil} />}
                                    name="btn_edit"
                                />
                            </Tooltip>
                        </Flex>
                    );
                }}
            />

            <Table.Column
                title="Credit Term"
                key="credit_term"
                dataIndex="credit_term"
                sorter={true}
            />
            <Table.Column
                title="Created At"
                key="date_formatted"
                dataIndex="date_formatted"
                sorter={true}
                defaultSortOrder="descend"
            />
        </Table>
    );
}
