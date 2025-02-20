import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleDown,
    faAngleUp,
    faEdit,
    faPlus,
} from "@fortawesome/pro-regular-svg-icons";
import {
    Button,
    Col,
    Collapse,
    Descriptions,
    Empty,
    Row,
    Typography,
} from "antd";

import { GET } from "../../../../../providers/useAxiosQuery";

export default function TabEmailTemplateFacultyMonitoring(props) {
    const { setToggleModalFormEmailTemplate } = props;

    const system_id = 2;

    const [items, setItems] = useState([]);

    const [tableFilter, setTableFilter] = useState({
        sort_field: "created_at",
        sort_order: "desc",
        system_id,
    });

    useEffect(() => {
        setTableFilter({
            sort_field: "created_at",
            sort_order: "desc",
            system_id,
        });

        return () => {};
    }, [location]);

    const { refetch: refetchEmailTemplate } = GET(
        `api/email_template?${new URLSearchParams(tableFilter)}`,
        ["email_template_list", "check_user_permission"],
        (res) => {
            if (res.data && res.data.length) {
                let data = res.data.map((item, index) => ({
                    key: index.toString(),
                    label: item.title,
                    children: (
                        <Descriptions
                            title={null}
                            bordered
                            size="small"
                            column={{
                                xs: 1,
                                sm: 1,
                                md: 1,
                                lg: 1,
                                xl: 1,
                                xxl: 1,
                            }}
                            items={[
                                {
                                    key: "1",
                                    label: "SUBJECT",
                                    labelStyle: {
                                        width: 100,
                                        textAlign: "right",
                                    },
                                    span: {
                                        xs: 1,
                                        sm: 1,
                                        md: 1,
                                        lg: 1,
                                        xl: 1,
                                        xxl: 1,
                                    },
                                    children: item.subject,
                                },
                                {
                                    key: "2",
                                    label: "BODY",
                                    labelStyle: {
                                        width: 100,
                                        textAlign: "right",
                                    },
                                    span: {
                                        xs: 1,
                                        sm: 1,
                                        md: 1,
                                        lg: 1,
                                        xl: 1,
                                        xxl: 1,
                                    },
                                    children: (
                                        <div
                                            className="quill-output"
                                            dangerouslySetInnerHTML={{
                                                __html: item.body,
                                            }}
                                        />
                                    ),
                                },
                            ]}
                        />
                    ),
                    extra: (
                        <FontAwesomeIcon
                            icon={faEdit}
                            onClick={(event) => {
                                event.stopPropagation();
                                setToggleModalFormEmailTemplate({
                                    open: true,
                                    data: item,
                                    system_id,
                                });
                            }}
                        />
                    ),
                }));
                setItems(data);
            }
        }
    );

    useEffect(() => {
        refetchEmailTemplate();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    return (
        <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Button
                    className="btn-main-primary"
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    onClick={() =>
                        setToggleModalFormEmailTemplate({
                            open: true,
                            data: null,
                            system_id,
                        })
                    }
                >
                    Add Email Template
                </Button>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                {items.length > 0 ? (
                    <Collapse
                        accordion
                        items={items}
                        expandIcon={({ isActive }) => (
                            <FontAwesomeIcon
                                icon={isActive ? faAngleUp : faAngleDown}
                            />
                        )}
                        defaultActiveKey={["0"]}
                        expandIconPosition="end"
                    />
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No Data"
                    />
                )}
            </Col>
        </Row>
    );
}
