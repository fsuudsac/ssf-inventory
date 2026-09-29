import { useContext } from "react";
import {
    Card,
    Image as AntImage,
    notification,
    Popconfirm,
    Tooltip,
    Upload,
    Row,
    Col,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faInbox, faTrashAlt } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import PageProductFormContext from "./PageProductFormContext";
import fileResizer from "../../../../providers/fileResizer";
import imageFileToBase64 from "../../../../providers/imageFileToBase64";

export default function ProductPhotoUpload() {
    const { attachments, setAttachments, location, handleUploadDebounce } =
        useContext(PageProductFormContext);

    return (
        <Card title="Product Photo's" className="card-product-photo">
            <Upload.Dragger
                action={false}
                multiple={true}
                showUploadList={false}
                className="multiple-attachment-upload"
                listType="picture-card"
                accept="image/jpg,image/jpeg,image/png"
                // fileList={attachments}
                onChange={({ fileList: newFileList }) => {
                    const newFileListPromises = newFileList.map((item) => {
                        return new Promise((resolve, reject) => {
                            const compressedImage = item.originFileObj;

                            if (item.type.includes("image")) {
                                const url =
                                    URL.createObjectURL(compressedImage);
                                const img = new Image();
                                img.src = url;

                                img.onload = async () => {
                                    const size = compressedImage.size;
                                    const isLt5M = size / 1024 / 1024 <= 5;

                                    if (!isLt5M) {
                                        try {
                                            const compressedImageNew =
                                                await fileResizer({
                                                    file: compressedImage,
                                                    quality: 70,
                                                });

                                            resolve({
                                                originFileObj:
                                                    compressedImageNew,
                                                lastModified:
                                                    compressedImageNew.lastModified,
                                                lastModifiedDate:
                                                    compressedImageNew.lastModifiedDate,
                                                size: compressedImageNew.size,
                                                type: compressedImageNew.type,
                                                uid: item.uid,
                                                status: "success",
                                                name: item.originFileObj.name,
                                            });
                                        } catch (error) {
                                            reject(error);
                                        }
                                    } else {
                                        resolve({
                                            ...item,
                                            status: "success",
                                        });
                                    }
                                };

                                img.onerror = (err) => {
                                    notification.error({
                                        message: compressedImage.name,
                                        description: `${compressedImage.name} is not a valid image file. Please upload a valid image file.`,
                                    });
                                    reject(err);
                                };
                            } else {
                                resolve({
                                    ...item,
                                    status: "success",
                                });
                            }
                        });
                    });

                    Promise.all(newFileListPromises)
                        .then((files) => {
                            return Promise.all(
                                files.map(async (file) => {
                                    const result = await imageFileToBase64(
                                        file.originFileObj,
                                    );
                                    return {
                                        ...file,
                                        src: result,
                                        created_at: dayjs().format(
                                            "YYYY-MM-DD HH:mm:ss",
                                        ),
                                    };
                                }),
                            );
                        })
                        .then((files) => {
                            const successfulFiles = files.filter(
                                (file) => file.status === "success",
                            );
                            if (
                                ["/product/add", "/inventory/add"].includes(
                                    location.pathname,
                                )
                            ) {
                                setAttachments(successfulFiles);
                            } else {
                                handleUploadDebounce([
                                    ...attachments,
                                    ...successfulFiles,
                                ]);
                            }
                        })
                        .catch((error) => {
                            console.error("Error processing files:", error);
                        });
                }}
                beforeUpload={(file) => {
                    return false;
                }}
            >
                <div className="ant-upload-drag-icon">
                    <FontAwesomeIcon icon={faInbox} />
                    <div className="title">Click or drag Photos here</div>
                    <div className="description">
                        Maximum File Size: 30MB
                        <br />
                        File formats: png, jpg, jpeg wav
                    </div>
                </div>
            </Upload.Dragger>

            <div className="attachment-preview">
                <AntImage.PreviewGroup>
                    <Row gutter={[20, 20]}>
                        {attachments.map((item, index) => (
                            <Col
                                xs={24}
                                sm={12}
                                md={8}
                                lg={8}
                                xl={8}
                                xxl={8}
                                key={index}
                            >
                                <Card
                                    className="card-file-uploaded"
                                    cover={
                                        <AntImage
                                            id={`image-${index}`}
                                            src={item.src}
                                            preview={{
                                                visible: false,
                                                src: item.src,
                                            }}
                                            // onClick={() => {
                                            //     setVisibleImage(
                                            //         0
                                            //     );
                                            // }}
                                        />
                                    }
                                    actions={[
                                        <FontAwesomeIcon
                                            key="view"
                                            icon={faEye}
                                            onClick={() => {
                                                let doc =
                                                    document.getElementById(
                                                        `image-${index}`,
                                                    );
                                                if (doc) {
                                                    doc.click();
                                                }
                                            }}
                                        />,
                                        <Popconfirm
                                            title="Delete Photo"
                                            description="Are you sure to delete this photo?"
                                            okText="Yes"
                                            cancelText="No"
                                            onConfirm={() => {
                                                handleUploadDebounce(
                                                    attachments.filter(
                                                        (f) =>
                                                            f.uid !== item.uid,
                                                    ),
                                                );
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                key="delete"
                                                className="text-danger"
                                                icon={faTrashAlt}
                                            />
                                        </Popconfirm>,
                                    ]}
                                >
                                    <Card.Meta
                                        title={dayjs(item.created_at).format(
                                            "MMMM DD, YYYY",
                                        )}
                                        description={
                                            <Tooltip
                                                placement="top"
                                                title={item.name}
                                            >
                                                {item.name}
                                            </Tooltip>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </AntImage.PreviewGroup>
            </div>
        </Card>
    );
}
