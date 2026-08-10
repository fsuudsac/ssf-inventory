import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Button, Table, Space, Switch, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faCheck,
    faXmark,
} from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../providers/useAxiosQuery";

export default function PageUserPermission() {
    const params = useParams();
    const navigate = useNavigate();

    const [formDisabled, setFormDisabled] = useState(true);

    const { data: dataPermissions } = GET(
        `api/user_permission/${params.id}`,
        "user_permission"
    );

    const { mutate: mutateChangeStatus, isLoading: loadingChangeStatus } = POST(
        `api/user_permission_status`,
        "user_permission"
    );

    const handleChangeStatus = (e, item) => {
        let data = {
            user_permission_id: item.user_permission_id,
            status: e ? "1" : "0",
            user_id: params.id,
            mod_button_id: item.mod_button_id,
        };

        mutateChangeStatus(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "User Permission",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "User Permission",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notification.error({
                    message: "User Permission",
                    description: "Something went wrong",
                });
            },
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setFormDisabled(false);
        }, 1000);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    return (
        <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Button
                    key={1}
                    className=" btn-main-primary btn-main-invert-outline b-r-none"
                    icon={<FontAwesomeIcon icon={faArrowLeft} />}
                    onClick={() => navigate(-1)}
                    size="large"
                >
                    Back
                </Button>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Table
                    className="ant-table-default"
                    dataSource={dataPermissions && dataPermissions.data}
                    rowKey={(record) => record.id}
                    bordered={false}
                >
                    <Table.Column
                        title="Module Name"
                        key="module_name"
                        dataIndex="module_name"
                        sorter
                    />

                    <Table.Column
                        title="Buttons"
                        key="buttons"
                        render={(_, record) => {
                            return (
                                <Space direction="vertical">
                                    {record.module_buttons.map(
                                        (item, index) => {
                                            // console.log("item", item);
                                            return (
                                                <div
                                                    key={index}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <Switch
                                                        checkedChildren={
                                                            <FontAwesomeIcon
                                                                icon={faCheck}
                                                            />
                                                        }
                                                        unCheckedChildren={
                                                            <FontAwesomeIcon
                                                                icon={faXmark}
                                                            />
                                                        }
                                                        checked={
                                                            item.status
                                                                ? true
                                                                : false
                                                        }
                                                        onChange={(e) =>
                                                            handleChangeStatus(
                                                                e,
                                                                item
                                                            )
                                                        }
                                                        loading={
                                                            loadingChangeStatus
                                                        }
                                                        disabled={formDisabled}
                                                    />{" "}
                                                    <span>
                                                        {item.mod_button_name}
                                                    </span>
                                                </div>
                                            );
                                        }
                                    )}
                                </Space>
                            );
                        }}
                    />
                </Table>
            </Col>
        </Row>
    );
}
