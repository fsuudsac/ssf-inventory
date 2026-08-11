import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Row, Col, Button, Form, Collapse, notification, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleDown,
    faAngleUp,
    faArrowLeft,
    faCamera,
    faUserShield,
} from "@fortawesome/pro-regular-svg-icons";
import { debounce } from "lodash";

import { DELETE, GET, POST } from "../../../providers/useAxiosQuery";
import { apiUrl, defaultProfile } from "../../../providers/appConfig";
import notificationErrors from "../../../providers/notificationErrors";
import ModalUploadProfilePicture from "./components/ModalUploadProfilePicture";
import UserFormCollapseItemAccountInfo from "./components/UserFormCollapseItemAccountInfo";
import UserFormCollapseItemPersonalInfo from "./components/UserFormCollapseItemPersonalInfo";
import UserFormCollapseItemPrimaryContact from "./components/UserFormCollapseItemPrimaryContact";
import UserFormCollapseItemAddressInfo from "./components/UserFormCollapseItemAddressInfo";
import isEmptyObject from "../../../providers/isEmptyObject";
import PageUserFormContext from "./components/PageUserFormContext";
import useWindowDimensions from "../../../providers/useWindowDimensions";
import CustomCollapse from "../../../providers/CustomCollapse";

export default function PageUserForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const { width } = useWindowDimensions();

    const [form] = Form.useForm();
    const [formDisabled, setFormDisabled] = useState(true);
    const [collapseActiveKey, setCollapseActiveKey] = useState([
        "0",
        "1",
        "2",
        "3",
        "4",
    ]);

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

    const [dataSelected, setDataSelected] = useState({});

    if (params && params.id) {
        GET(`api/users/${params.id}`, "users_info", (res) => {
            if (res.data) {
                let data = res.data;

                console.log("data user: ", data);

                if (data && data.attachments && data.attachments.length > 0) {
                    let profileAttachments = data.attachments.filter(
                        (f) => f.file_description === "Profile Picture",
                    );

                    if (profileAttachments.length > 0) {
                        setToggleModalUploadProfilePicture({
                            open: false,
                            file: null,
                            src: apiUrl(profileAttachments[0].file_path),
                            is_camera: null,
                            fileName: null,
                        });
                    }
                }

                let profile = data.profile;

                let newdata = {
                    ...data,
                    firstname: profile.firstname,
                    middlename: profile.middlename,
                    lastname: profile.lastname,
                    name_ext: profile.name_ext,
                    salutation: profile.salutation,
                    gender: profile.gender,
                    contact_no: profile.contact_no,
                    // address: profile.address,
                    company_id: profile.company_id,
                    customer_type: profile.customer_type,
                    taxpayer_identification: profile.taxpayer_identification,
                    // profile_addresses: profile.profile_addresses,
                    contact_number: profile.contact_no,
                };

                if (
                    ["customers", "suppliers"].includes(
                        location.pathname.split("/")[1],
                    )
                ) {
                    let profile_address_bills = profile.profile_addresses
                        .filter((x) => x.type === "Bill")
                        .map((item) => ({
                            ...item,
                            status: item.status ? true : false,
                        }));
                    let profile_address_ships = profile.profile_addresses
                        .filter((x) => x.type === "Ship")
                        .map((item) => ({
                            ...item,
                            status: item.status ? true : false,
                        }));

                    newdata["profile_address_bills"] =
                        profile_address_bills.length
                            ? profile_address_bills
                            : [{}];
                    newdata["profile_address_ships"] =
                        profile_address_ships.length
                            ? profile_address_ships
                            : [{}];
                    newdata["salutation"] = profile.salutation ?? "";
                    newdata["company_id"] = profile.company_id ?? "";
                    newdata["taxpayer_identification"] =
                        profile.taxpayer_identification ?? "";
                } else {
                    let profile_address = profile.profile_addresses.find(
                        (x) => x.type === "Bill",
                    );

                    newdata["address"] =
                        profile_address && profile_address.address
                            ? profile_address.address
                            : "";
                }

                form.setFieldsValue(newdata);

                setDataSelected(newdata);
            }
        });
    }

    const { mutate: mutateUser, isLoading: isLoadingUser } = POST(
        `api/users`,
        "create_users_info",
    );

    const onFinish = (values) => {
        // console.log("values: ", values);

        let data = new FormData();

        data.append("id", params && params.id ? params.id : "");

        data.append("email", values.email);
        data.append("firstname", values.firstname);
        data.append("middlename", values.middlename ?? "");
        data.append("lastname", values.lastname ?? "");
        data.append("name_ext", values.name_ext ?? "");
        data.append("gender", values.gender ?? "");
        data.append("contact_no", values.contact_no ?? "");

        let profile_address_bills = [];
        if (values.profile_address_bills) {
            profile_address_bills = values.profile_address_bills
                .filter((x) => !isEmptyObject(x))
                .map((item) => ({
                    ...item,
                    status: item.status ? 1 : 0,
                }));
        }
        let profile_address_ships = [];
        if (values.profile_address_ships) {
            profile_address_ships = values.profile_address_ships
                .filter((x) => !isEmptyObject(x))
                .map((item) => ({
                    ...item,
                    status: item.status ? 1 : 0,
                }));
        }

        if (location.pathname.split("/")[1] === "suppliers") {
            data.append("role", "Supplier");
            data.append("salutation", values.salutation ?? "");
            data.append("company_id", values.company_id ?? "");
            data.append(
                "taxpayer_identification",
                values.taxpayer_identification ?? "",
            );

            if (!params.id) {
                data.append("status", "Active");
            }

            data.append(
                "profile_address_bills",
                profile_address_bills
                    ? JSON.stringify(profile_address_bills)
                    : [],
            );
            data.append(
                "profile_address_ships",
                profile_address_ships
                    ? JSON.stringify(profile_address_ships)
                    : [],
            );
        } else if (location.pathname.split("/")[1] === "customers") {
            data.append("role", "Customer");
            data.append("salutation", values.salutation ?? "");
            data.append("customer_type", values.customer_type ?? "");
            data.append("company_id", values.company_id ?? "");
            data.append(
                "taxpayer_identification",
                values.taxpayer_identification ?? "",
            );

            if (!params.id) {
                data.append("status", "Active");
            }

            data.append(
                "profile_address_bills",
                profile_address_bills
                    ? JSON.stringify(profile_address_bills)
                    : [],
            );
            data.append(
                "profile_address_ships",
                profile_address_ships
                    ? JSON.stringify(profile_address_ships)
                    : [],
            );
        } else {
            data.append("role", values.role);
            data.append("username", values.username);
            data.append("address", values.address);
            data.append("status", values.status);
            data.append("password", values.password ?? "");
        }

        if (toggleModalUploadProfilePicture.file) {
            data.append(
                "profile_picture",
                toggleModalUploadProfilePicture.file,
                toggleModalUploadProfilePicture.file.name,
            );
        }

        data.append("hostname", window.location.host);

        mutateUser(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "User",
                        description: res.message,
                    });

                    if (params && !params.id) {
                        navigate(-1);
                    } else {
                        let newData = res.data;

                        if (
                            newData &&
                            newData.attachments &&
                            newData.attachments.length > 0
                        ) {
                            let profileAttachments = newData.attachments.filter(
                                (f) => f.file_description === "Profile Picture",
                            );

                            if (profileAttachments.length > 0) {
                                setToggleModalUploadProfilePicture({
                                    open: false,
                                    file: null,
                                    src: apiUrl(
                                        profileAttachments[0].file_path,
                                    ),
                                    is_camera: null,
                                    fileName: null,
                                });
                            }
                        }

                        let profile = newData.profile;

                        let newDataCopy = {
                            ...newData,
                            firstname: profile.firstname,
                            middlename: profile.middlename,
                            lastname: profile.lastname,
                            name_ext: profile.name_ext,
                            gender: profile.gender,
                            contact_no: profile.contact_no,
                        };

                        if (
                            ["customers", "suppliers"].includes(
                                location.pathname.split("/")[1],
                            )
                        ) {
                            let profile_address_bills =
                                profile.profile_addresses.filter(
                                    (x) => x.type === "Bill",
                                );
                            let profile_address_ships =
                                profile.profile_addresses.filter(
                                    (x) => x.type === "Ship",
                                );

                            newDataCopy["profile_address_bills"] =
                                profile_address_bills.length
                                    ? profile_address_bills
                                    : [{}];
                            newDataCopy["profile_address_ships"] =
                                profile_address_ships.length
                                    ? profile_address_ships
                                    : [{}];
                            newDataCopy["salutation"] =
                                profile.salutation ?? "";
                            newDataCopy["company_id"] =
                                profile.company_id ?? "";
                            newDataCopy["taxpayer_identification"] =
                                profile.taxpayer_identification ?? "";
                        } else {
                            let profile_address =
                                profile.profile_addresses.find(
                                    (x) => x.type === "Current Address",
                                );

                            newDataCopy["address"] =
                                profile_address.address ?? "";
                        }

                        form.setFieldsValue(newDataCopy);

                        setDataSelected(newDataCopy);
                    }
                } else {
                    notification.error({
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

    const { mutate: mutateDeleteAddress, isLoading: isLoadingDeleteAddress } =
        DELETE(`api/profile_address`, "users_info");

    const handleDeleteAddress = (index, remove, formListName) => {
        let dataSelectedCopy = { ...dataSelected };
        let profile_addresses = dataSelectedCopy[formListName];

        if (profile_addresses && profile_addresses.length > 0) {
            let profile_addresse = profile_addresses[index];

            if (profile_addresse && profile_addresse.id) {
                mutateDeleteAddress(profile_addresse, {
                    onSuccess: (res) => {
                        if (res.success) {
                            notification.success({
                                message: "User",
                                description: res.message,
                            });

                            remove(index);
                        } else {
                            notification.error({
                                message: "User",
                                description: res.message,
                            });
                        }
                    },
                    onError: (err) => {
                        notificationErrors(err);
                    },
                });
            } else {
                remove(index);
            }
        } else {
            remove(index);
        }
    };

    const handleTriggerDebounce = debounce((values) => {
        let { field, value, formList, index } = values;

        if (params && params.id) {
            if (
                formList &&
                (formList === "profile_address_ships" ||
                    formList === "profile_address_bills")
            ) {
                let oldData =
                    dataSelected && dataSelected[formList]
                        ? dataSelected[formList][index]
                        : "";

                if (oldData !== value) {
                    form.submit();
                }
            } else {
                let oldData =
                    dataSelected && dataSelected[field]
                        ? dataSelected[field]
                        : "";

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
            }
        }
    }, 1000);

    const handleDebounce = useCallback(
        (values) => {
            handleTriggerDebounce(values);
        },
        [handleTriggerDebounce],
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            setFormDisabled(false);
        }, 1000);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    const collapseItems = [];

    if (location.pathname.split("/")[1] === "users") {
        collapseItems.push({
            key: "0",
            label: "ACCOUNT INFORMATION",
            children: <UserFormCollapseItemAccountInfo />,
        });
    }

    collapseItems.push({
        key: "1",
        label: "PERSONAL INFORMATION",
        children: <UserFormCollapseItemPersonalInfo />,
    });

    if (
        location.pathname.split("/")[1] === "customers" ||
        location.pathname.split("/")[1] === "suppliers"
    ) {
        collapseItems.push({
            key: "2",
            label: "PRIMARY CONTACT",
            children: <UserFormCollapseItemPrimaryContact />,
        });

        collapseItems.push({
            key: "3",
            label: "BILL ADDRESS INFORMATION",
            children: (
                <UserFormCollapseItemAddressInfo
                    type="Bill"
                    formList="profile_address_bills"
                    handleDeleteAddress={handleDeleteAddress}
                />
            ),
        });

        collapseItems.push({
            key: "4",
            label: "SHIP ADDRESS INFORMATION",
            children: (
                <UserFormCollapseItemAddressInfo
                    type="Ship"
                    formList="profile_address_ships"
                    handleDeleteAddress={handleDeleteAddress}
                />
            ),
        });
    }

    return (
        <PageUserFormContext.Provider
            value={{
                form,
                formDisabled,
                params,
                handleDebounce,
                location,
                toggleModalUploadProfilePicture,
                setToggleModalUploadProfilePicture,
                isLoadingDeleteAddress,
            }}
        >
            <Row gutter={[20, 20]}>
                <Col sm={24} md={24} lg={24} xl={24} xxl={24}>
                    <Flex align="center" gap={15}>
                        <Button
                            type="default"
                            icon={<FontAwesomeIcon icon={faArrowLeft} />}
                            onClick={() => navigate(-1)}
                        >
                            Back to list
                        </Button>
                        <Button
                            type="default"
                            icon={<FontAwesomeIcon icon={faUserShield} />}
                            onClick={() =>
                                navigate("/users/permission/" + params.id)
                            }
                        >
                            Back to list
                        </Button>
                    </Flex>
                </Col>

                <Col sm={24} md={24} lg={24} xl={24} xxl={24}>
                    <Form
                        form={form}
                        onFinish={onFinish}
                        initialValues={{
                            profile_address_bills: [{}],
                            profile_address_ships: [{}],
                        }}
                    >
                        <Row gutter={[20, 20]}>
                            <Col sm={24} md={24} lg={14} xl={14} xxl={14}>
                                <CustomCollapse
                                    activeKey={collapseActiveKey}
                                    onChange={(key) =>
                                        setCollapseActiveKey(key)
                                    }
                                    items={collapseItems}
                                />
                            </Col>

                            <Col sm={24} md={24} lg={10} xl={10} xxl={10}>
                                <CustomCollapse
                                    activeKey={["0", "1"]}
                                    onChange={(key) =>
                                        setCollapseActiveKey(key)
                                    }
                                    items={[
                                        {
                                            key: "0",
                                            label: "PROFILE PICTURE",
                                            className:
                                                "collapse-profile-picture",
                                            children: (
                                                <Row gutter={[12, 0]}>
                                                    <Col
                                                        xs={24}
                                                        sm={24}
                                                        md={24}
                                                        lg={24}
                                                    >
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
                                                                        icon={
                                                                            faCamera
                                                                        }
                                                                    />
                                                                }
                                                                className="btn-upload"
                                                                onClick={() =>
                                                                    setToggleModalUploadProfilePicture(
                                                                        (
                                                                            ps,
                                                                        ) => ({
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
                                    ]}
                                />
                            </Col>

                            {params.id ? null : (
                                <Col
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={24}
                                    xl={24}
                                    xxl={24}
                                >
                                    <Button
                                        key={4}
                                        type="primary"
                                        type="primary"
                                        onClick={() => form.submit()}
                                        loading={isLoadingUser}
                                    >
                                        SUBMIT
                                    </Button>
                                </Col>
                            )}
                        </Row>
                    </Form>

                    <ModalUploadProfilePicture />
                </Col>
            </Row>
        </PageUserFormContext.Provider>
    );
}
