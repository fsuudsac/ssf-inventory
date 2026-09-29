import {
    Button,
    Col,
    Empty,
    Modal,
    Popconfirm,
    Row,
    Upload,
    notification,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/pro-regular-svg-icons";

import imageFileToBase64 from "../../../../providers/imageFileToBase64";

export default function ModalUploadSignature(props) {
    const {
        toggleModalUploadSignature,
        setToggleModalUploadSignature,
        handleSave,
        fileSignature,
        setFileSignature,
        isLoadingUploadSignature,
    } = props;

    const propsUpload = {
        action: false,
        accept: ".jpg,.png",
        maxCount: 1,
        beforeUpload: (file) => {
            let error = false;

            const isJPG =
                file.type === "image/jpeg" || file.type === "image/png";

            if (!isJPG) {
                notification.error({
                    message: "Upload Signature",
                    description: "You can only upload JPG/PNG file!",
                });
                error = Upload.LIST_IGNORE;
            }

            if (error === false) {
                imageFileToBase64(file).then((imageUrl) => {
                    setFileSignature((ps) => ({
                        ...ps,
                        src: imageUrl,
                        file: file,
                        fileName: file.name,
                    }));
                });
            }

            return error;
        },
        showUploadList: false,
    };

    return (
        <Modal
            title="Upload Signature"
            open={toggleModalUploadSignature}
            onCancel={() => setToggleModalUploadSignature(false)}
            footer={[
                <Button
                    key="cancel"
                    type="default"
                    onClick={() => {
                        setToggleModalUploadSignature(false);
                    }}
                >
                    Cancel
                </Button>,
                <Popconfirm
                    key="save"
                    title="Are you sure you want to save this signature?"
                    onConfirm={() => {
                        if (fileSignature.file) {
                            handleSave();
                        } else {
                            notification.error({
                                message: "Upload Signature",
                                description: "Please upload your signature!",
                            });
                        }
                    }}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{
                        className: "btn-main-invert",
                    }}
                    disabled={isLoadingUploadSignature}
                >
                    <Button type="primary" loading={isLoadingUploadSignature}>
                        Save
                    </Button>
                </Popconfirm>,
            ]}
        >
            <Row gutter={[12, 12]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    {fileSignature.src ? (
                        <img alt="" src={fileSignature.src} className="w-100" />
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No Signature"
                        />
                    )}
                </Col>
                <Col
                    xs={24}
                    sm={24}
                    md={24}
                    lg={24}
                    xl={24}
                    className="text-center"
                >
                    <Upload {...propsUpload}>
                        <Button
                            icon={<FontAwesomeIcon icon={faUpload} />}
                            size="large"
                        >
                            Upload Signature
                        </Button>
                    </Upload>
                </Col>
            </Row>
        </Modal>
    );
}
