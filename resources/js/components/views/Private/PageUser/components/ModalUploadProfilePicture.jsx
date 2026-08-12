import { useCallback, useContext, useRef, useState } from "react";
import { Modal, Row, Col, Button, Upload, notification } from "antd";
import {
    faCamera,
    faRefresh,
    faUpload,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Webcam from "react-webcam";

import { POST } from "../../../../providers/useAxiosQuery";
import { defaultProfile } from "../../../../providers/appConfig";
import imageFileToBase64 from "../../../../providers/imageFileToBase64";
import dataURLtoBlob from "../../../../providers/dataURLtoBlob";
import notificationErrors from "../../../../providers/notificationErrors";
import PageUserFormContext from "./PageUserFormContext";

export default function ModalUploadProfilePicture() {
    const {
        toggleModalUploadProfilePicture,
        setToggleModalUploadProfilePicture,
        params,
    } = useContext(PageUserFormContext);

    const webcamRef = useRef(null);

    const [fileImage, setFileImage] = useState({
        is_camera: false,
        status: null,
        isCapture: false,
        file: null,
        src: null,
        fileName: null,
    });

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
                    message: "Upload Profile Picture",
                    description: "You can only upload JPG/PNG file!",
                });
                error = Upload.LIST_IGNORE;
            }

            if (error === false) {
                imageFileToBase64(file).then((imageUrl) => {
                    setFileImage((ps) => ({
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

    const handleOpenCamera = () => {
        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: true,
            })
            .then(function (stream) {
                console.log("stream", stream);
                console.log("stream.getVideoTracks()", stream.getVideoTracks());
                if (stream.getVideoTracks().length > 0) {
                    // code for when both devices are available

                    setFileImage((ps) => ({
                        ...ps,
                        is_camera: true,
                        status: "available",
                        message: "Camera detected...",
                    }));
                } else {
                    //code for when none of the devices are available
                    setFileImage((ps) => ({
                        ...ps,
                        is_camera: true,
                        status: "unavailable",
                        message: "Camera not detected...",
                    }));
                }
            })
            .catch(function (error) {
                // code for when there is an error
                console.log("not available", error.name, ":", error.message);
                setFileImage((ps) => ({
                    ...ps,
                    is_camera: true,
                    status: "error",
                    message: error.message,
                }));
            });
    };

    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();

        const blob = dataURLtoBlob(imageSrc);
        console.log("blob", blob);

        setFileImage((ps) => ({
            ...ps,
            src: imageSrc,
            file: blob,
            isCapture: true,
            fileName: blob.size + "-camera.png",
        }));
    }, [webcamRef]);

    const handleRenderCamera = () => {
        if (fileImage.isCapture) {
            return (
                <img
                    alt=""
                    src={fileImage.src ? fileImage.src : defaultProfile}
                    className="w-100"
                />
            );
        } else {
            if (fileImage.status === "available") {
                return (
                    <Webcam
                        ref={webcamRef}
                        style={{
                            maxWidth: "100%",
                        }}
                        disablePictureInPicture={true}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                            width: 1280,
                            height: 720,
                            facingMode: "user",
                        }}
                    />
                );
            } else {
                return (
                    <div
                        style={{
                            display: "flex",
                            width: "100%",
                            padding: "100px 0px",
                            justifyContent: "center",
                            alignItems: "center",
                            background: "#000",
                            color: "#fff",
                            flexDirection: "column",
                            gap: "12px 12px",
                        }}
                    >
                        <div>
                            {fileImage.message}
                            <br />
                            {fileImage.message === "Requested device not found"
                                ? "Please check your camera and try refresh the page."
                                : "Please allow camera access and try refresh the page."}
                        </div>
                    </div>
                );
            }
        }
    };

    const { mutate: mutateProfilePicture, isLoading: isLoadingProfilePicture } =
        POST(`api/user_profile_picture`, "users_info");

    const handleSaveProfilePicture = (data) => {
        let formData = new FormData();
        formData.append("user_id", params.id);
        formData.append("profile_picture", fileImage.file);

        mutateProfilePicture(formData, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Profile Picture",
                        description: res.message,
                    });

                    setToggleModalUploadProfilePicture({
                        open: false,
                        file: fileImage.file,
                        src: fileImage.src,
                        fileName: fileImage.fileName,
                    });

                    setFileImage({
                        is_camera: false,
                        status: null,
                        file: null,
                        src: null,
                        isCapture: false,
                    });
                } else {
                    notification.error({
                        message: "Profile Picture",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    return (
        <Modal
            title={
                fileImage.is_camera ? "Take a picture" : "Upload Profile Photo"
            }
            open={toggleModalUploadProfilePicture.open}
            onCancel={() =>
                setToggleModalUploadProfilePicture((ps) => ({
                    ...ps,
                    open: false,
                }))
            }
            footer={[
                <Button
                    key="cancel"
                    size="large"
                    onClick={() => {
                        setToggleModalUploadProfilePicture((ps) => ({
                            ...ps,
                            open: false,
                        }));
                        setFileImage({
                            is_camera: false,
                            status: null,
                            file: null,
                            src: null,
                            isCapture: false,
                            fileName: null,
                        });
                    }}
                    disabled={isLoadingProfilePicture}
                >
                    Cancel
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    size="large"
                    disabled={fileImage.file ? false : true}
                    loading={isLoadingProfilePicture}
                    onClick={() => {
                        if (params && params.id) {
                            handleSaveProfilePicture();
                        } else {
                            if (fileImage.file) {
                                setToggleModalUploadProfilePicture({
                                    open: false,
                                    file: fileImage.file,
                                    src: fileImage.src,
                                    fileName: fileImage.fileName,
                                });
                                setFileImage({
                                    is_camera: false,
                                    status: null,
                                    file: null,
                                    src: null,
                                    isCapture: false,
                                });
                            } else {
                                notification.error({
                                    message: "Upload Profile Picture",
                                    description:
                                        "Please upload your profile picture!",
                                });
                            }
                        }
                    }}
                >
                    Save
                </Button>,
            ]}
        >
            <Row gutter={[12, 12]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    {!fileImage.is_camera ? (
                        <img
                            alt=""
                            src={fileImage.src ? fileImage.src : defaultProfile}
                            className="w-100"
                        />
                    ) : (
                        handleRenderCamera()
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
                    {!fileImage.is_camera ? (
                        <Upload {...propsUpload}>
                            <Button
                                icon={<FontAwesomeIcon icon={faUpload} />}
                                size="large"
                            >
                                Upload Picture
                            </Button>
                        </Upload>
                    ) : (
                        <Button
                            icon={<FontAwesomeIcon icon={faUpload} />}
                            size="large"
                            onClick={() =>
                                setFileImage({
                                    is_camera: false,
                                    status: null,
                                    file: null,
                                    src: null,
                                    isCapture: false,
                                })
                            }
                        >
                            Click to Upload
                        </Button>
                    )}

                    {fileImage.is_camera ? (
                        fileImage.status === "available" ? (
                            fileImage.isCapture ? (
                                <Button
                                    icon={<FontAwesomeIcon icon={faCamera} />}
                                    size="large"
                                    className="ml-10"
                                    onClick={() =>
                                        setFileImage((ps) => ({
                                            ...ps,
                                            src: null,
                                            file: null,
                                            isCapture: false,
                                        }))
                                    }
                                >
                                    Reset
                                </Button>
                            ) : (
                                <Button
                                    icon={<FontAwesomeIcon icon={faCamera} />}
                                    size="large"
                                    onClick={handleCapture}
                                    className="ml-10"
                                >
                                    Capture
                                </Button>
                            )
                        ) : (
                            <Button
                                icon={<FontAwesomeIcon icon={faRefresh} />}
                                size="large"
                                onClick={() => window.location.reload()}
                            >
                                Refresh
                            </Button>
                        )
                    ) : (
                        <Button
                            icon={<FontAwesomeIcon icon={faCamera} />}
                            size="large"
                            onClick={handleOpenCamera}
                            className="ml-10"
                        >
                            Click to Open Camera
                        </Button>
                    )}
                </Col>
            </Row>
        </Modal>
    );
}
