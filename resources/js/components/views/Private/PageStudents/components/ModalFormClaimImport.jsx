import { Button, Col, Form, Modal, Row } from "antd";

import { POST } from "../../../../providers/useAxiosQuery";
import FloatInput from "../../../../providers/FloatInput";
import { useEffect } from "react";

export default function ModalFormClaimImport(props) {
    const { toggleModalClaim, setToggleModalClaim } = props;
    console.log("toggleModalClaim: ", toggleModalClaim);

    const [form] = Form.useForm();

    const { mutate: mutateFormImport, isLoading: isLoadingFormImport } = POST(
        "api/data_import_detail",
        ["data_import_detail_update", "employee_list"]
    );

    const onFinish = (values) => {
        // mutateFormImport
    };

    useEffect(() => {
        console.log("useEffect toggleModalClaim: ", toggleModalClaim);
        if (toggleModalClaim && toggleModalClaim.data) {
            let data_json = toggleModalClaim.data.data_json
                ? JSON.parse(toggleModalClaim.data.data_json)
                : {};

            console.log("data_json: ", data_json);

            form.setFieldsValue(data_json);
        }

        return () => {};
    }, [toggleModalClaim]);

    const renderColumns = () => {
        if (toggleModalClaim && toggleModalClaim.columns) {
            return toggleModalClaim.columns.map((item, index) => {
                return (
                    <Col xs={24} sm={24} md={24} key={index}>
                        <Form.Item key={index} name={item.toLowerCase()}>
                            <FloatInput label={item} placeholder={item} />
                        </Form.Item>
                    </Col>
                );
            });
        }
    };

    return (
        <Modal
            title="Claim Import"
            open={toggleModalClaim.open}
            wrapClassName="modal-wrap-data-import-excel"
            onCancel={() => {
                setToggleModalClaim({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalClaim({
                            open: false,
                            data: null,
                        });
                    }}
                    disabled={isLoadingFormImport}
                >
                    Cancel
                </Button>,
                <Button
                    className="btn-main-primary"
                    type="primary"
                    key={2}
                    loading={isLoadingFormImport}
                    onClick={() => {
                        form.submit();
                    }}
                >
                    Submit
                </Button>,
            ]}
            forceRender
        >
            <Form form={form} onFinish={onFinish}>
                <Row gutter={[20, 20]}>{renderColumns()}</Row>
            </Form>
        </Modal>
    );
}
