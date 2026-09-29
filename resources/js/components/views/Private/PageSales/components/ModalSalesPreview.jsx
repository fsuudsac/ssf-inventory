import { useContext, useEffect } from "react";
import { Button, Modal } from "antd";

import { apiUrl } from "../../../../providers/appConfig";
import PageFormSalesContext from "./PageFormSalesContext";

export default function ModalSalesPreview() {
    const { toggleModalSalesPreview, setToggleModalSalesPreview } =
        useContext(PageFormSalesContext);

    useEffect(() => {
        return () => {};
    }, [toggleModalSalesPreview]);

    return (
        <Modal
            wrapClassName="modal-wrap-sales-preview"
            title="Release Item Preview"
            open={toggleModalSalesPreview.open}
            onCancel={() => {
                setToggleModalSalesPreview({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    key={1}
                    type="default"
                    onClick={() => {
                        setToggleModalSalesPreview({
                            open: false,
                            data: null,
                        });
                    }}
                >
                    CLOSE
                </Button>,
            ]}
        >
            {toggleModalSalesPreview &&
            toggleModalSalesPreview.data &&
            toggleModalSalesPreview.data.id ? (
                <iframe
                    src={apiUrl(
                        `api/sales_preview/${toggleModalSalesPreview?.data?.id}`,
                    )}
                    frameBorder="0"
                />
            ) : null}
        </Modal>
    );
}
