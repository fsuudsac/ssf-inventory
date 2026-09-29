import { useEffect, useState } from "react";
import { Button, Modal } from "antd";

import { apiUrl } from "../../../../providers/appConfig";

export default function ModalCustomerLedger(props) {
    const { toggleModalCustomerLedger, setToggleModalCustomerLedger } = props;

    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        if (toggleModalCustomerLedger.open && toggleModalCustomerLedger.data) {
            const { customer_id, date_range } = toggleModalCustomerLedger.data;

            const customerId = customer_id ? customer_id : null;
            const dateRange = date_range ? date_range : null;

            const url = apiUrl(
                `api/report_ledger_customer_pdf?customer_id=${customerId}&date_range=${dateRange}`,
            );

            setPdfUrl(url);
        }
    }, [toggleModalCustomerLedger]);

    return (
        <Modal
            wrapClassName="modal-wrap-customer-ledger-preview"
            title="Customer Ledger Preview"
            width={900}
            open={toggleModalCustomerLedger.open}
            onCancel={() => {
                setToggleModalCustomerLedger({
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
                        setToggleModalCustomerLedger({
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
