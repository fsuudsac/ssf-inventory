import { useContext } from "react";
import { Button, Modal, Table } from "antd";

import PageProductContext from "./PageProductContext";

export default function ModalProductDetailPreview() {
    const { toggleModalProductDetails, setToggleModalProductDetails } =
        useContext(PageProductContext);

    return (
        <Modal
            wrapClassName="wrap-modal-product"
            title="Product Details Preview"
            open={toggleModalProductDetails.open}
            onCancel={() => {
                setToggleModalProductDetails({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalProductDetails({
                            open: false,
                            data: null,
                        });
                    }}
                >
                    CLOSE
                </Button>,
            ]}
        >
            <Table
                id="tbl1"
                className="ant-table-default ant-table-striped"
                dataSource={
                    toggleModalProductDetails && toggleModalProductDetails.data
                }
                rowKey={(record) => record.id}
                pagination={false}
                bordered={false}
                scroll={{ x: "max-content" }}
                sticky
            >
                <Table.Column
                    title="Product Name"
                    key="product_name"
                    dataIndex="product_name"
                    width={180}
                />
                <Table.Column
                    title="Product Type"
                    key="product_type"
                    dataIndex="product_type"
                    width={180}
                />
                <Table.Column
                    title="Product Size"
                    key="product_size"
                    dataIndex="product_size"
                    width={180}
                />
                <Table.Column
                    title="Created At"
                    key="created_at_format"
                    dataIndex="created_at_format"
                    width={150}
                />
            </Table>
        </Modal>
    );
}
