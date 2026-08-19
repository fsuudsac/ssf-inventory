import { useContext, useEffect } from "react";
import { Button, Modal } from "antd";

import { apiUrl } from "../../../../providers/appConfig";
import PagePurchaseContext from "./PagePurchaseContext";

export default function ModalPurchasePreview() {
    const { toggleModalPuchasePreview, setToggleModalPuchasePreview } =
        useContext(PagePurchaseContext);

    useEffect(() => {
        return () => {};
    }, [toggleModalPuchasePreview]);

    return (
        <Modal
            wrapClassName="modal-wrap-purchase-preview"
            title="Purchase Order Preview"
            open={toggleModalPuchasePreview.open}
            onCancel={() => {
                setToggleModalPuchasePreview({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    key={1}
                    type="default"
                    onClick={() => {
                        setToggleModalPuchasePreview({
                            open: false,
                            data: null,
                        });
                    }}
                >
                    CLOSE
                </Button>,
            ]}
        >
            {toggleModalPuchasePreview &&
            toggleModalPuchasePreview.data &&
            toggleModalPuchasePreview.data.id ? (
                <iframe
                    src={apiUrl(
                        `api/purchase_preview/${toggleModalPuchasePreview?.data?.id}`,
                    )}
                    frameBorder="0"
                />
            ) : null}
        </Modal>
    );
}
