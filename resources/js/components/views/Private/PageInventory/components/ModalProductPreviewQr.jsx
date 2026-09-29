import { Modal, Button, Image, Row, Col } from "antd";

export default function ModalProductPreviewQr(props) {
    const { toggleModalPreviewQr, setToggleModalPreviewQr } = props;

    console.log("toggleModalPreviewQr: ", toggleModalPreviewQr);

    return (
        <Modal
            wrapClassName="wrap-modal-product"
            title="Preview QR Code"
            open={toggleModalPreviewQr.open}
            onCancel={() => {
                setToggleModalPreviewQr({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    key={1}
                    type="default"
                    onClick={() => {
                        setToggleModalPreviewQr({
                            open: false,
                            data: null,
                        });
                    }}
                >
                    CLOSE
                </Button>,
            ]}
        >
            <Row gutter={[12, 0]}>
                <Col xs={24} sm={24} md={24} lg={24}>
                    <Image src={toggleModalPreviewQr.data} />
                </Col>
            </Row>
        </Modal>
    );
}
