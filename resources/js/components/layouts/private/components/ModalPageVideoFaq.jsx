import { useState } from "react";
import { faLightbulbExclamation } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FloatButton, Modal, notification } from "antd";
import ReactPlayer from "react-player";

import { POST } from "../../../providers/useAxiosQuery";
import notificationErrors from "../../../providers/notificationErrors";

export default function ModalPageVideoFaq({ module_name }) {
    const [toggleModalVideoFaq, setToggleModalVideoFaq] = useState({
        open: false,
        data: null,
    });

    const { mutate: mutateVideoFaq, isLoading: isLoadingVideoFaq } = POST(
        `api/video_faq_info`,
        "video_faq_info",
    );

    const handleVideoFaq = () => {
        let data = { module_name };
        mutateVideoFaq(data, {
            onSuccess: (res) => {
                if (res.data?.file_path) {
                    setToggleModalVideoFaq({
                        open: true,
                        data: res.data,
                    });
                } else {
                    notification.error({
                        message: "Video FAQ",
                        description: "No video found for this module.",
                    });
                }
            },
            onError: (error) => {
                notificationErrors(error);
            },
        });
    };

    return (
        <>
            <FloatButton
                className="float-button-video-faq"
                icon={<FontAwesomeIcon icon={faLightbulbExclamation} />}
                title="Video FAQ"
                onClick={() => handleVideoFaq()}
                disabled={isLoadingVideoFaq ? isLoadingVideoFaq : false}
            />

            <Modal
                wrapClassName="modal-wrap-video-faq"
                title={toggleModalVideoFaq?.data?.title}
                open={toggleModalVideoFaq.open}
                onCancel={() => {
                    setToggleModalVideoFaq({
                        open: false,
                        data: null,
                    });
                }}
                footer={null}
            >
                <ReactPlayer
                    className="react-player-video"
                    url={toggleModalVideoFaq?.data?.file_path}
                    controls
                />
            </Modal>
        </>
    );
}
