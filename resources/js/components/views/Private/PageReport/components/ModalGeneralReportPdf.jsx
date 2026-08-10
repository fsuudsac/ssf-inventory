import { useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { apiUrl } from "../../../../providers/appConfig";

export default function ModalGeneralReportPdf(props) {
    const { toggleModalGeneralReportPdf, setToggleModalGeneralReportPdf } =
        props;

    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        if (
            toggleModalGeneralReportPdf.open &&
            toggleModalGeneralReportPdf.data
        ) {
            const { start_date, end_date } = toggleModalGeneralReportPdf.data;

            const startDate = start_date ? start_date : null;
            const endDate = end_date ? end_date : null;

            const url = apiUrl(
                `api/report_general_pdf?start_date=${startDate}&end_date=${endDate}`,
            );

            setPdfUrl(url);
        }
    }, [toggleModalGeneralReportPdf]);

    return (
        <Modal
            wrapClassName="modal-wrap-general-preview"
            title="Statement of Profit or Loss Preview"
            width={900}
            open={toggleModalGeneralReportPdf.open}
            onCancel={() => {
                setToggleModalGeneralReportPdf({
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
                        setToggleModalGeneralReportPdf({
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
