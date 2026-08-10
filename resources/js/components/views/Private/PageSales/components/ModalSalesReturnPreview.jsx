import { useContext, useEffect } from "react";
import { Button, Modal } from "antd";

import { apiUrl } from "../../../../providers/appConfig";
import PageFormSalesContext from "./PageFormSalesContext";

export default function ModalSalesReturnPreview() {
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
                    className="btn-main-primary outlined"
                    key={1}
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
                        `api/sales_return_preview/${toggleModalSalesPreview?.data?.id}`,
                    )}
                    frameborder="0"
                />
            ) : null}
        </Modal>
    );
}
