import { useContext } from "react";
import {
    Button,
    Checkbox,
    Col,
    Flex,
    Form,
    notification,
    Popconfirm,
    Row,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/pro-regular-svg-icons";

import FloatTextArea from "../../../../providers/FloatTextArea";
import PageUserFormContext from "./PageUserFormContext";

export default function UserFormCollapseItemAddressInfo(props) {
    const { formList, handleDeleteAddress } = props;

    const {
        handleDebounce,
        formDisabled,
        params,
        form,
        isLoadingDeleteAddress,
    } = useContext(PageUserFormContext);

    return (
        <Row gutter={[20, 0]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Form.List name={formList}>
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => {
                                return (
                                    <Row key={key} gutter={[12, 0]}>
                                        <Col xs={24} className="mb-3!">
                                            <Flex
                                                justify="space-between"
                                                align="center"
                                                gap={10}
                                            >
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "status"]}
                                                    noStyle
                                                    valuePropName="checked"
                                                >
                                                    <Checkbox
                                                        disabled={formDisabled}
                                                        onChange={(e) => {
                                                            // Uncheck other checkboxes
                                                            const newValues =
                                                                form
                                                                    .getFieldValue(
                                                                        formList,
                                                                    )
                                                                    .map(
                                                                        (
                                                                            item,
                                                                            idx,
                                                                        ) =>
                                                                            idx ===
                                                                            name
                                                                                ? {
                                                                                      ...item,
                                                                                      status: e
                                                                                          .target
                                                                                          .checked,
                                                                                  }
                                                                                : {
                                                                                      ...item,
                                                                                      status: false,
                                                                                  },
                                                                    );
                                                            form.setFieldsValue(
                                                                {
                                                                    [formList]:
                                                                        newValues,
                                                                },
                                                            );

                                                            handleDebounce({
                                                                field: "status",
                                                                value: e.target
                                                                    .checked,
                                                                formList,
                                                                index: name,
                                                            });
                                                        }}
                                                    >
                                                        Primary Address
                                                    </Checkbox>
                                                </Form.Item>

                                                <Popconfirm
                                                    title="Are you sure you want to delete this address?"
                                                    onConfirm={() =>
                                                        handleDeleteAddress(
                                                            name,
                                                            remove,
                                                            formList,
                                                        )
                                                    }
                                                    onCancel={() => {
                                                        notification.error({
                                                            message: "User",
                                                            description:
                                                                "Data not deleted",
                                                        });
                                                    }}
                                                    okText="Yes"
                                                    cancelText="No"
                                                    disabled={
                                                        formDisabled ||
                                                        isLoadingDeleteAddress
                                                    }
                                                >
                                                    <Button
                                                        className="btn-delete"
                                                        type="link"
                                                        icon={
                                                            <FontAwesomeIcon
                                                                icon={faTrash}
                                                            />
                                                        }
                                                        disabled={
                                                            formDisabled ||
                                                            isLoadingDeleteAddress
                                                        }
                                                    />
                                                </Popconfirm>
                                            </Flex>
                                        </Col>

                                        <Col xs={24}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "address"]}
                                            >
                                                <FloatTextArea
                                                    label="Address"
                                                    placeholder="Address"
                                                    onChange={(e) =>
                                                        handleDebounce({
                                                            field: "address",
                                                            value: e,
                                                            formList,
                                                            index: name,
                                                        })
                                                    }
                                                    disabled={formDisabled}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                );
                            })}

                            <Button
                                className="btn-main-primary p-0 w-auto h-auto"
                                onClick={() => add()}
                                type="link"
                                icon={<FontAwesomeIcon icon={faPlus} />}
                                disabled={formDisabled}
                            >
                                Add New Address
                            </Button>
                        </>
                    )}
                </Form.List>
            </Col>
        </Row>
    );
}
