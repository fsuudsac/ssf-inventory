import { useCallback, useState } from "react";
import { debounce } from "lodash";
import { Row, Col, Button, Form, Collapse, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleDown,
    faAngleUp,
    faCamera,
} from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../providers/useAxiosQuery";
import { apiUrl, defaultProfile, userData } from "../../../providers/appConfig";
import FloatInput from "../../../providers/FloatInput";
import FloatSelect from "../../../providers/FloatSelect";
import validateRules from "../../../providers/validateRules";
import notificationErrors from "../../../providers/notificationErrors";
import ModalFormEmail from "./components/ModalFormEmail";
import ModalFormPassword from "./components/ModalFormPassword";
import ModalUploadProfilePicture from "./components/ModalUploadProfilePicture";
import SignaturePad from "./components/SignaturePad";

export default function PageEditProfile() {
    const [form] = Form.useForm();

    const [toggleModalFormEmail, setToggleModalFormEmail] = useState({
        open: false,
        data: null,
    });

    const [toggleModalFormPassword, setToggleModalFormPassword] = useState({
        open: false,
        data: null,
    });

    const [
        toggleModalUploadProfilePicture,
        setToggleModalUploadProfilePicture,
    ] = useState({
        open: false,
        file: null,
        src: null,
        is_camera: null,
        fileName: null,
    });

    const [fileSignature, setFileSignature] = useState({
        file: null,
        src: null,
        filePath: null,
        fileName: null,
    });

    GET(`api/users/${userData().id}`, "users_info", (res) => {
        if (res.data) {
            let data = res.data;

            let username = data.username;
            let email = data.email;
            let firstname = data.profile.firstname;
            let middlename = data.profile.middlename;
            let lastname = data.profile.lastname;
            let name_ext = data.profile.name_ext;
            let gender = data.profile.gender;

            let profilePicture = data.profile?.attachments.filter(
                (f) => f.file_description === "Profile Picture"
            );
            let signature = data.profile?.attachments.filter(
                (f) => f.file_description === "Signature"
            );

            if (profilePicture.length > 0) {
                setToggleModalUploadProfilePicture({
                    open: false,
                    file: null,
                    src: apiUrl(
                        profilePicture[profilePicture.length - 1].file_path
                    ),
                    is_camera: null,
                    fileName: null,
                });
            }

            if (signature.length > 0) {
                setFileSignature({
                    file: null,
                    src: null,
                    filePath: apiUrl(signature[signature.length - 1].file_path),
                    fileName: null,
                });
            }

            form.setFieldsValue({
                username,
                email,
                firstname,
                middlename,
                lastname,
                name_ext,
                gender,
            });
        }
    });

    const { mutate: mutateUpdateInfo } = POST(
        `api/user_profile_info_update`,
        "user_profile_info_update"
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            gender: values.gender ? values.gender : "",
        };

        mutateUpdateInfo(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "User",
                        description: res.message,
                    });
                } else {
                    notification.success({
                        message: "User",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const handleTriggerDebounce = debounce(() => {
        form.submit();
    }, 1000);

    const handleDebounce = useCallback(() => {
        handleTriggerDebounce();
    }, [handleTriggerDebounce]);

    return (
        <Form form={form} onFinish={onFinish}>
            <Row gutter={[12, 12]}>
                <Col
                    sm={24}
                    md={24}
                    lg={16}
                    xl={16}
                    xxl={16}
                    className="collapse-wrapper-info"
                >
                    <Collapse
                        className="collapse-main-primary"
                        defaultActiveKey={["0", "1"]}
                        size="large"
                        expandIcon={({ isActive }) => (
                            <FontAwesomeIcon
                                icon={isActive ? faAngleUp : faAngleDown}
                            />
                        )}
                        items={[
                            {
                                key: "0",
                                label: "ACCOUNT INFORMATION",
                                children: (
                                    <Row gutter={[20, 0]}>
                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item name="username">
                                                <FloatInput
                                                    label="Username"
                                                    placeholder="Username"
                                                    disabled
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item name="email">
                                                <FloatInput
                                                    label="Email"
                                                    placeholder="Email"
                                                    disabled
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={24}
                                            lg={24}
                                            xl={24}
                                        >
                                            <Button
                                                type="link"
                                                className="p-0"
                                                onClick={() =>
                                                    setToggleModalFormEmail({
                                                        open: true,
                                                        data: {
                                                            id: userData().id,
                                                        },
                                                    })
                                                }
                                            >
                                                Change Email
                                            </Button>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={24}
                                            lg={24}
                                            xl={24}
                                        >
                                            <Button
                                                type="link"
                                                className="p-0"
                                                onClick={() =>
                                                    setToggleModalFormPassword({
                                                        open: true,
                                                        data: {
                                                            id: userData().id,
                                                        },
                                                    })
                                                }
                                            >
                                                Change Password
                                            </Button>
                                        </Col>
                                    </Row>
                                ),
                            },
                            {
                                key: "1",
                                label: "PERSONAL INFORMATION",
                                children: (
                                    <Row gutter={[20, 0]}>
                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item
                                                name="firstname"
                                                rules={[
                                                    validateRules.required(),
                                                ]}
                                            >
                                                <FloatInput
                                                    label="First Name"
                                                    placeholder="First Name"
                                                    required
                                                    onChange={handleDebounce}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item name="middlename">
                                                <FloatInput
                                                    label="Middle Name"
                                                    placeholder="Middle Name"
                                                    onChange={handleDebounce}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item
                                                name="lastname"
                                                rules={[
                                                    validateRules.required(),
                                                ]}
                                            >
                                                <FloatInput
                                                    label="Last Name"
                                                    placeholder="Last Name"
                                                    required
                                                    onChange={handleDebounce}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item name="name_ext">
                                                <FloatInput
                                                    label="Name Extension"
                                                    placeholder="Name Extension"
                                                    onChange={handleDebounce}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={24}
                                            lg={12}
                                            xl={12}
                                            xxl={12}
                                        >
                                            <Form.Item name="gender">
                                                <FloatSelect
                                                    label="Gender"
                                                    placeholder="Gender"
                                                    options={[
                                                        {
                                                            label: "Male",
                                                            value: "Male",
                                                        },
                                                        {
                                                            label: "Female",
                                                            value: "Female",
                                                        },
                                                    ]}
                                                    allowClear
                                                    onChange={handleDebounce}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                ),
                            },
                        ]}
                    />
                </Col>

                <Col
                    xs={24}
                    sm={24}
                    md={24}
                    lg={8}
                    xl={8}
                    xxl={8}
                    className="collapse-wrapper-photo"
                >
                    <Collapse
                        className="collapse-main-primary"
                        defaultActiveKey={["0", "1"]}
                        size="large"
                        expandIcon={({ isActive }) => (
                            <FontAwesomeIcon
                                icon={isActive ? faAngleUp : faAngleDown}
                            />
                        )}
                        items={[
                            {
                                key: "0",
                                label: "Profile Photo",
                                children: (
                                    <Row gutter={[12, 0]}>
                                        <Col xs={24} sm={24} md={24} lg={24}>
                                            <div className="profile-picture-wrapper">
                                                <img
                                                    alt=""
                                                    src={
                                                        toggleModalUploadProfilePicture.src
                                                            ? toggleModalUploadProfilePicture.src
                                                            : defaultProfile
                                                    }
                                                />

                                                <Button
                                                    type="link"
                                                    icon={
                                                        <FontAwesomeIcon
                                                            icon={faCamera}
                                                        />
                                                    }
                                                    className="btn-upload"
                                                    onClick={() =>
                                                        setToggleModalUploadProfilePicture(
                                                            (ps) => ({
                                                                ...ps,
                                                                open: true,
                                                            })
                                                        )
                                                    }
                                                />
                                            </div>

                                            <ModalUploadProfilePicture
                                                toggleModalUploadProfilePicture={
                                                    toggleModalUploadProfilePicture
                                                }
                                                setToggleModalUploadProfilePicture={
                                                    setToggleModalUploadProfilePicture
                                                }
                                            />
                                        </Col>
                                    </Row>
                                ),
                            },
                            {
                                key: "1",
                                label: "Signature",
                                className: "collapse-signature",
                                children: (
                                    <Row gutter={[12, 0]}>
                                        <Col xs={24} sm={24} md={24} lg={24}>
                                            <SignaturePad
                                                fileSignature={fileSignature}
                                                setFileSignature={
                                                    setFileSignature
                                                }
                                            />
                                        </Col>
                                    </Row>
                                ),
                            },
                        ]}
                    />
                </Col>
            </Row>

            <ModalFormEmail
                toggleModalFormEmail={toggleModalFormEmail}
                setToggleModalFormEmail={setToggleModalFormEmail}
            />

            <ModalFormPassword
                toggleModalFormPassword={toggleModalFormPassword}
                setToggleModalFormPassword={setToggleModalFormPassword}
            />
        </Form>
    );
}
