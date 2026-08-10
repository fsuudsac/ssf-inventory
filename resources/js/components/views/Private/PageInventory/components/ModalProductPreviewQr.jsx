import { Modal, Button, Form, Image } from "antd";

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
                    className="btn-main-primary outlined"
                    key={1}
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
            <Image src={toggleModalPreviewQr.data} />
        </Modal>
    );
}
