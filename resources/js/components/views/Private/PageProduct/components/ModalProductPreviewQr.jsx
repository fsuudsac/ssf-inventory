import { useContext } from "react";
import { Modal, Button, Image } from "antd";
import PageProductFormContext from "./PageProductFormContext";

export default function ModalProductPreviewQr() {
    const { toggleModalPreviewQr, setToggleModalPreviewQr } = useContext(
        PageProductFormContext
    );

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
