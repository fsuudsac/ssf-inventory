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
import {
    apiUrl,
    // apiUrl,
    defaultProfile,
    userData,
} from "../../../providers/appConfig";
import FloatInput from "../../../providers/FloatInput";
import FloatSelect from "../../../providers/FloatSelect";
import FloatInputMask from "../../../providers/FloatInputMask";
import validateRules from "../../../providers/validateRules";
import notificationErrors from "../../../providers/notificationErrors";
import ModalFormEmail from "./components/ModalFormEmail";
import ModalFormPassword from "./components/ModalFormPassword";
import ModalUploadProfilePicture from "./components/ModalUploadProfilePicture";
import SignaturePad from "./components/SignaturePad";
import FloatTextArea from "../../../providers/FloatTextArea";

export default function PageEditProfile() {
    const [form] = Form.useForm();

    const [selectedData, setSelectedData] = useState({});

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

            console.log("data: ", data);

            let profilePicture = data.attachments.filter(
                (f) => f.file_description === "Profile Picture",
            );
            let signature = data.attachments.filter(
                (f) => f.file_description === "Signature",
            );

            if (profilePicture.length > 0) {
                setToggleModalUploadProfilePicture({
                    open: false,
                    file: null,
                    src: apiUrl(profilePicture[0].file_path),
                    is_camera: null,
                    fileName: null,
                });
            }

            if (signature.length > 0) {
                setFileSignature({
                    file: null,
                    src: null,
                    filePath: apiUrl(signature[0].file_path),
                    fileName: null,
                });
            }

            let newData = {
                ...data,
                ...data.profile,
            };

            form.setFieldsValue(newData);
            setSelectedData(newData);
        }
    });

    const { mutate: mutateUpdateInfo } = POST(
        `api/user_profile_info_update`,
        "user_profile_info_update",
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

    const handleTriggerDebounce = debounce((values) => {
        let { field, value } = values;
        // console.log("field: ", field, " value: ", value);

        let oldData =
            selectedData && selectedData[field] ? selectedData[field] : "";

        if (field === "contact_no") {
            let contact_no = value.replace(/[^0-9]/g, "");

            if (oldData !== contact_no) {
                form.submit();
            }
        } else {
            if (oldData !== value) {
                form.submit();
            }
        }
    }, 1000);

    const handleDebounce = useCallback(
        (values) => {
            handleTriggerDebounce(values);
        },
        [handleTriggerDebounce],
    );

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
                                    <Row gutter={[12, 0]}>
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
                                    <Row gutter={[12, 12]}>
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
                                                    onChange={(e) => {
                                                        handleDebounce({
                                                            field: "firstname",
                                                            value: e.target
                                                                .value,
                                                        });
                                                    }}
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
                                                    onChange={(e) => {
                                                        handleDebounce({
                                                            field: "middlename",
                                                            value: e.target
                                                                .value,
                                                        });
                                                    }}
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
                                                    onChange={(e) => {
                                                        handleDebounce({
                                                            field: "lastname",
                                                            value: e.target
                                                                .value,
                                                        });
                                                    }}
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
                                                    onChange={(e) => {
                                                        handleDebounce({
                                                            field: "name_ext",
                                                            value: e.target
                                                                .value,
                                                        });
                                                    }}
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
                                                    onChange={(e) => {
                                                        handleDebounce({
                                                            field: "gender",
                                                            value: e,
                                                        });
                                                    }}
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
                                            <Form.Item
                                                name="contact_no"
                                                rules={[validateRules.phone]}
                                            >
                                                <FloatInputPhone
                                                    label="Contact Number"
                                                    placeholder="Contact Number"
                                                    international={true}
                                                    defaultCountry="PH"
                                                    onChange={(value) => {
                                                        handleDebounce({
                                                            field: "contact_no",
                                                            value: value || "",
                                                        });
                                                    }}
                                                />
                                                {/* <FloatInputMask
                                                    label="Contact No."
                                                    placeholder="Contact No."
                                                    maskLabel="contact_no"
                                                    maskType="999 999 9999"
                                                    onBlur={() => {
                                                        if (params.id) {
                                                            form.submit();
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        handleDebounce({
                                                            field: "contact_no",
                                                            value: e.target
                                                                .value,
                                                        });
                                                    }}
                                                /> */}
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
                                                            }),
                                                        )
                                                    }
                                                />
                                            </div>
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

            <ModalUploadProfilePicture
                toggleModalUploadProfilePicture={
                    toggleModalUploadProfilePicture
                }
                setToggleModalUploadProfilePicture={
                    setToggleModalUploadProfilePicture
                }
            />
        </Form>
    );
}
