import { useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { apiUrl } from "../../../../providers/appConfig";

export default function ModalInventoryLedger(props) {
    const {
        toggleModalInventoryLedger,
        setToggleModalInventoryLedger,
        tableFilter,
    } = props;

    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        if (
            toggleModalInventoryLedger.open &&
            toggleModalInventoryLedger.data
        ) {
            const url = apiUrl(
                `api/report_inventory_pdf?${new URLSearchParams(tableFilter)}`,
            );

            setPdfUrl(url);
        }
    }, [toggleModalInventoryLedger]);

    return (
        <Modal
            wrapClassName="modal-wrap-inventory-ledger-preview"
            title="Inventory Ledger Preview"
            width={900}
            open={toggleModalInventoryLedger.open}
            onCancel={() => {
                setToggleModalInventoryLedger({
                    open: false,
                    data: null,
                });
                setPdfUrl(null);
            }}
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    key={1}
                    onClick={() => {
                        setToggleModalInventoryLedger({
                            open: false,
                            data: null,
                        });
                        setPdfUrl(null);
                    }}
                >
                    CLOSE
                </Button>,
            ]}
        >
            {pdfUrl ? (
                <iframe
                    src={pdfUrl}
                    frameBorder="0"
                    width="100%"
                    height="600px"
                />
            ) : (
                <div style={{ textAlign: "center", padding: "20px" }}>
                    No Data
                </div>
            )}
        </Modal>
    );
}
