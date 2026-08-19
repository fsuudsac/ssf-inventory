import { useEffect, useState } from "react";
import { Button, Modal } from "antd";

import { apiUrl } from "../../../../providers/appConfig";

export default function ModalSupplierLedger(props) {
    const { toggleModalSupplierLedger, setToggleModalSupplierLedger } = props;

    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        if (toggleModalSupplierLedger.open && toggleModalSupplierLedger.data) {
            const { supplier_id, date_range } = toggleModalSupplierLedger.data;

            const supplierId = supplier_id ? supplier_id : null;
            const dateRange = date_range ? date_range : null;

            const url = apiUrl(
                `api/report_ledger_supplier_pdf?supplier_id=${supplierId}&date_range=${dateRange}`,
            );

            setPdfUrl(url);
        }
    }, [toggleModalSupplierLedger]);

    return (
        <Modal
            wrapClassName="modal-wrap-supplier-ledger-preview"
            title="Supplier Ledger Preview"
            width={900}
            open={toggleModalSupplierLedger.open}
            onCancel={() => {
                setToggleModalSupplierLedger({
                    open: false,
                    data: null,
                });
                setPdfUrl(null);
            }}
            footer={[
                <Button
                    key={1}
                    type="default"
                    onClick={() => {
                        setToggleModalSupplierLedger({
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
            ) : null}
        </Modal>
    );
}
