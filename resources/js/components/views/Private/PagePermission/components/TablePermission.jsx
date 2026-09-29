import { useEffect, useState, useMemo } from "react";
import {
    Badge,
    Button,
    Card,
    Col,
    Flex,
    Input,
    App,
    Popconfirm,
    Row,
    Space,
    Switch,
    Table,
    Tag,
    Tooltip,
    Typography,
} from "antd";
import {
    SaveOutlined,
    CheckOutlined,
    CloseOutlined,
    SearchOutlined,
    UndoOutlined,
    SafetyCertificateOutlined,
    EyeOutlined,
    PlusCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    LockOutlined,
    UnlockOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { system_id } from "../../../../providers/appConfig";
import FloatSelect from "../../../../providers/FloatSelect";
import { GET } from "../../../../providers/useAxiosQuery";

const { Text, Title } = Typography;

export default function TablePermission(props) {
    const { tabParentActive, userRole, userRoleName } = props;
    const { notification } = App.useApp();

    const [matrixData, setMatrixData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Fetch users if in "Users" tab
    const { data: dataUsers } = GET(
        "api/users?sort_field=fullname&sort_order=asc",
        "users_select_list",
        () => {},
        false,
    );

    // Load permissions for current userRole or selected user
    const loadPermissions = async (roleToFetch) => {
        if (!roleToFetch && tabParentActive !== "Users") return;
        setIsLoading(true);
        try {
            const endpoint = `/api/permissions/${encodeURIComponent(roleToFetch || "1")}`;
            const res = await axios.get(endpoint);
            if (res.data && res.data.data) {
                const list = Array.isArray(res.data.data)
                    ? res.data.data
                    : res.data.data.permissions || [];
                setMatrixData(list);
                setOriginalData(JSON.parse(JSON.stringify(list)));
                setHasChanges(false);
            }
        } catch (error) {
            console.error("Failed to load permissions:", error);
            notification.error({
                message: "Error Loading Permissions",
                description:
                    error.response?.data?.message ||
                    "Could not load permissions matrix for this role.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (tabParentActive === "UserRole" && userRole) {
            loadPermissions(userRole);
        } else if (tabParentActive === "Users") {
            // Default to user 1 if not selected
            const userId = selectedUserId || 1;
            loadPermissions(userId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabParentActive, userRole, selectedUserId]);

    // Handle single permission toggle
    const handleToggle = (moduleKey, field, value) => {
        setMatrixData((prev) => {
            const updated = prev.map((item) => {
                if (item.module_key === moduleKey || item.module_code === moduleKey || item.id === moduleKey) {
                    const nextItem = { ...item, [field]: value };
                    // If creating/editing/deleting, auto-enable viewing if it was disabled
                    if (value && field !== "can_view" && !nextItem.can_view) {
                        nextItem.can_view = true;
                    }
                    // If disabling viewing, optionally disable mutation
                    if (!value && field === "can_view") {
                        nextItem.can_create = false;
                        nextItem.can_edit = false;
                        nextItem.can_delete = false;
                    }
                    return nextItem;
                }
                return item;
            });
            setHasChanges(true);
            return updated;
        });
    };

    // Row-level All Toggle
    const handleToggleRowAll = (moduleKey, value) => {
        setMatrixData((prev) => {
            const updated = prev.map((item) => {
                if (item.module_key === moduleKey || item.module_code === moduleKey || item.id === moduleKey) {
                    return {
                        ...item,
                        can_view: value,
                        can_create: value,
                        can_edit: value,
                        can_delete: value,
                    };
                }
                return item;
            });
            setHasChanges(true);
            return updated;
        });
    };

    // Bulk column toggles
    const handleToggleColumnAll = (field, value) => {
        setMatrixData((prev) => {
            const updated = prev.map((item) => {
                const nextItem = { ...item, [field]: value };
                if (value && field !== "can_view" && !nextItem.can_view) {
                    nextItem.can_view = true;
                }
                if (!value && field === "can_view") {
                    nextItem.can_create = false;
                    nextItem.can_edit = false;
                    nextItem.can_delete = false;
                }
                return nextItem;
            });
            setHasChanges(true);
            return updated;
        });
    };

    // Bulk presets
    const handleGrantAll = () => {
        setMatrixData((prev) =>
            prev.map((item) => ({
                ...item,
                can_view: true,
                can_create: true,
                can_edit: true,
                can_delete: true,
            }))
        );
        setHasChanges(true);
    };

    const handleReadOnly = () => {
        setMatrixData((prev) =>
            prev.map((item) => ({
                ...item,
                can_view: true,
                can_create: false,
                can_edit: false,
                can_delete: false,
            }))
        );
        setHasChanges(true);
    };

    const handleRevokeAll = () => {
        setMatrixData((prev) =>
            prev.map((item) => ({
                ...item,
                can_view: false,
                can_create: false,
                can_edit: false,
                can_delete: false,
            }))
        );
        setHasChanges(true);
    };

    const handleResetChanges = () => {
        setMatrixData(JSON.parse(JSON.stringify(originalData)));
        setHasChanges(false);
    };

    // Save Changes API call
    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const roleTarget = tabParentActive === "Users" ? (selectedUserId || "1") : (userRole || "1");
            const res = await axios.put(`/api/permissions/${encodeURIComponent(roleTarget)}`, {
                permissions: matrixData,
            });

            if (res.data && res.data.success) {
                notification.success({
                    message: "Permissions Saved Successfully",
                    description:
                        res.data.message ||
                        `Permissions for ${userRoleName || "Role"} have been saved and applied system-wide.`,
                    icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
                });
                setOriginalData(JSON.parse(JSON.stringify(matrixData)));
                setHasChanges(false);

                // Dispatch event so layout and route guards react immediately
                window.dispatchEvent(
                    new CustomEvent("permissions_updated", { detail: matrixData })
                );
            } else {
                notification.error({
                    message: "Failed to Save Permissions",
                    description: res.data?.message || "An error occurred while saving.",
                });
            }
        } catch (error) {
            console.error("Save permissions error:", error);
            notification.error({
                message: "Save Error",
                description:
                    error.response?.data?.message ||
                    "Network error occurred while pushing permissions.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Filtered data for table search
    const filteredData = useMemo(() => {
        if (!searchText.trim()) return matrixData;
        const q = searchText.toLowerCase().trim();
        return matrixData.filter(
            (item) =>
                item.module_name?.toLowerCase().includes(q) ||
                item.module_code?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q)
        );
    }, [matrixData, searchText]);

    // Summary calculation
    const accessibleModulesCount = useMemo(() => {
        return matrixData.filter((m) => m.can_view).length;
    }, [matrixData]);

    const isAllColumnChecked = (field) => {
        if (filteredData.length === 0) return false;
        return filteredData.every((item) => item[field]);
    };

    // Table Column Definitions
    const columns = [
        {
            title: "Module Name",
            dataIndex: "module_name",
            key: "module_name",
            width: 240,
            render: (text, record) => {
                const isAllActive = record.can_view && record.can_create && record.can_edit && record.can_delete;
                const isNoneActive = !record.can_view && !record.can_create && !record.can_edit && !record.can_delete;

                return (
                    <Space direction="vertical" size={2}>
                        <Flex align="center" gap={8}>
                            <Text strong style={{ fontSize: 14 }}>
                                {text || record.module_code}
                            </Text>
                            {isAllActive && (
                                <Tag color="success" bordered={false} style={{ fontSize: 11 }}>
                                    Full Access
                                </Tag>
                            )}
                            {isNoneActive && (
                                <Tag color="default" bordered={false} style={{ fontSize: 11 }}>
                                    Restricted
                                </Tag>
                            )}
                            {!isAllActive && record.can_view && (
                                <Tag color="processing" bordered={false} style={{ fontSize: 11 }}>
                                    Partial
                                </Tag>
                            )}
                        </Flex>
                        <Text type="secondary" style={{ fontSize: 12, fontFamily: "monospace" }}>
                            {record.module_code}
                        </Text>
                    </Space>
                );
            },
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: (text) => (
                <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.4 }}>
                    {text || "Controls access to this system feature."}
                </Text>
            ),
        },
        {
            title: () => (
                <Flex align="center" justify="space-between" style={{ minWidth: 420 }}>
                    <Text strong style={{ fontSize: 13 }}>
                        Permissions Matrix (View / Create / Edit / Delete)
                    </Text>
                    <Space size={14}>
                        <Tooltip title="Toggle All View">
                            <span style={{ fontSize: 11, cursor: "pointer", color: isAllColumnChecked("can_view") ? "#1677ff" : "#8c8c8c" }} onClick={() => handleToggleColumnAll("can_view", !isAllColumnChecked("can_view"))}>
                                <EyeOutlined /> View All
                            </span>
                        </Tooltip>
                        <Tooltip title="Toggle All Create">
                            <span style={{ fontSize: 11, cursor: "pointer", color: isAllColumnChecked("can_create") ? "#52c41a" : "#8c8c8c" }} onClick={() => handleToggleColumnAll("can_create", !isAllColumnChecked("can_create"))}>
                                <PlusCircleOutlined /> Create All
                            </span>
                        </Tooltip>
                        <Tooltip title="Toggle All Edit">
                            <span style={{ fontSize: 11, cursor: "pointer", color: isAllColumnChecked("can_edit") ? "#fa8c16" : "#8c8c8c" }} onClick={() => handleToggleColumnAll("can_edit", !isAllColumnChecked("can_edit"))}>
                                <EditOutlined /> Edit All
                            </span>
                        </Tooltip>
                        <Tooltip title="Toggle All Delete">
                            <span style={{ fontSize: 11, cursor: "pointer", color: isAllColumnChecked("can_delete") ? "#ff4d4f" : "#8c8c8c" }} onClick={() => handleToggleColumnAll("can_delete", !isAllColumnChecked("can_delete"))}>
                                <DeleteOutlined /> Del All
                            </span>
                        </Tooltip>
                    </Space>
                </Flex>
            ),
            key: "permissions_matrix",
            width: 460,
            render: (_, record) => {
                const isAllRowOn = record.can_view && record.can_create && record.can_edit && record.can_delete;

                return (
                    <Flex align="center" gap={16} wrap="nowrap">
                        {/* Quick Row Toggle */}
                        <Tooltip title={isAllRowOn ? "Revoke all for this module" : "Grant all for this module"}>
                            <Button
                                size="small"
                                type={isAllRowOn ? "primary" : "default"}
                                shape="round"
                                icon={isAllRowOn ? <UnlockOutlined /> : <LockOutlined />}
                                onClick={() => handleToggleRowAll(record.module_key || record.id, !isAllRowOn)}
                                style={{ fontSize: 11 }}
                            >
                                ALL
                            </Button>
                        </Tooltip>

                        {/* 1. View Switch */}
                        <Flex align="center" gap={6}>
                            <Switch
                                size="small"
                                checked={!!record.can_view}
                                onChange={(val) => handleToggle(record.module_key || record.id, "can_view", val)}
                                checkedChildren={<CheckOutlined style={{ fontSize: 9 }} />}
                                unCheckedChildren={<CloseOutlined style={{ fontSize: 9 }} />}
                            />
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontWeight: record.can_view ? 600 : 400,
                                    color: record.can_view ? "#1677ff" : "#8c8c8c",
                                }}
                            >
                                View
                            </Text>
                        </Flex>

                        {/* 2. Create Switch */}
                        <Flex align="center" gap={6}>
                            <Switch
                                size="small"
                                checked={!!record.can_create}
                                onChange={(val) => handleToggle(record.module_key || record.id, "can_create", val)}
                                checkedChildren={<CheckOutlined style={{ fontSize: 9 }} />}
                                unCheckedChildren={<CloseOutlined style={{ fontSize: 9 }} />}
                            />
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontWeight: record.can_create ? 600 : 400,
                                    color: record.can_create ? "#52c41a" : "#8c8c8c",
                                }}
                            >
                                Create
                            </Text>
                        </Flex>

                        {/* 3. Edit Switch */}
                        <Flex align="center" gap={6}>
                            <Switch
                                size="small"
                                checked={!!record.can_edit}
                                onChange={(val) => handleToggle(record.module_key || record.id, "can_edit", val)}
                                checkedChildren={<CheckOutlined style={{ fontSize: 9 }} />}
                                unCheckedChildren={<CloseOutlined style={{ fontSize: 9 }} />}
                            />
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontWeight: record.can_edit ? 600 : 400,
                                    color: record.can_edit ? "#fa8c16" : "#8c8c8c",
                                }}
                            >
                                Edit
                            </Text>
                        </Flex>

                        {/* 4. Delete Switch */}
                        <Flex align="center" gap={6}>
                            <Switch
                                size="small"
                                checked={!!record.can_delete}
                                onChange={(val) => handleToggle(record.module_key || record.id, "can_delete", val)}
                                checkedChildren={<CheckOutlined style={{ fontSize: 9 }} />}
                                unCheckedChildren={<CloseOutlined style={{ fontSize: 9 }} />}
                            />
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontWeight: record.can_delete ? 600 : 400,
                                    color: record.can_delete ? "#ff4d4f" : "#8c8c8c",
                                }}
                            >
                                Delete
                            </Text>
                        </Flex>
                    </Flex>
                );
            },
        },
    ];

    return (
        <Card
            variant="borderless"
            className="shadow-sm rounded-lg"
            styles={{ body: { padding: "20px 24px" } }}
        >
            {/* Control Bar & Actions Header */}
            <Row gutter={[16, 16]} align="middle" justify="space-between" className="mb-4">
                <Col xs={24} md={12}>
                    <Space orientation="horizontal" size={12} wrap>
                        {tabParentActive === "Users" ? (
                            <div style={{ width: 260 }}>
                                <FloatSelect
                                    label="Select User to Audit"
                                    placeholder="Choose User"
                                    value={selectedUserId}
                                    options={
                                        dataUsers && dataUsers.data
                                            ? dataUsers.data.map((u) => ({
                                                  value: u.id,
                                                  label: `${u.fullname || u.username} (${u.role || "User"})`,
                                              }))
                                            : []
                                    }
                                    onChange={(val) => setSelectedUserId(val)}
                                />
                            </div>
                        ) : (
                            <Space size={8} align="center">
                                <SafetyCertificateOutlined style={{ fontSize: 20, color: "#1677ff" }} />
                                <div>
                                    <Text strong style={{ fontSize: 16 }}>
                                        {userRoleName || `Role #${userRole}`} Matrix
                                    </Text>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Accessible Modules:{" "}
                                            <Badge
                                                count={`${accessibleModulesCount}/${matrixData.length}`}
                                                style={{ backgroundColor: accessibleModulesCount > 0 ? "#52c41a" : "#d9d9d9" }}
                                            />
                                        </Text>
                                    </div>
                                </div>
                            </Space>
                        )}

                        <Input
                            placeholder="Search modules..."
                            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            style={{ width: 200 }}
                        />
                    </Space>
                </Col>

                <Col xs={24} md={12}>
                    <Flex justify="end" align="center" gap={8} wrap="wrap">
                        {/* Quick Presets */}
                        <Button size="small" onClick={handleGrantAll}>
                            Grant All
                        </Button>
                        <Button size="small" onClick={handleReadOnly}>
                            Read-Only
                        </Button>
                        <Button size="small" onClick={handleRevokeAll} danger>
                            Revoke All
                        </Button>

                        {hasChanges && (
                            <Popconfirm
                                title="Discard Changes?"
                                description="Are you sure you want to revert to the saved permissions?"
                                onConfirm={handleResetChanges}
                                okText="Revert"
                                cancelText="Cancel"
                            >
                                <Button size="small" icon={<UndoOutlined />}>
                                    Revert
                                </Button>
                            </Popconfirm>
                        )}

                        {/* Save Changes Button */}
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={isSaving}
                            disabled={!hasChanges}
                            onClick={handleSaveChanges}
                            className={hasChanges ? "animate-pulse" : ""}
                            style={{
                                backgroundColor: hasChanges ? "#1677ff" : undefined,
                                fontWeight: 600,
                            }}
                        >
                            {hasChanges ? "Save Changes *" : "Saved"}
                        </Button>
                    </Flex>
                </Col>
            </Row>

            {/* Unsaved changes alert chip */}
            {hasChanges && (
                <div
                    style={{
                        background: "#fffbe6",
                        border: "1px solid #ffe58f",
                        borderRadius: 6,
                        padding: "6px 14px",
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Text style={{ fontSize: 13, color: "#d48806" }}>
                        ⚠️ You have unsaved permission changes. Click <strong>"Save Changes"</strong> to persist them to the backend.
                    </Text>
                    <Button
                        size="small"
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={isSaving}
                        onClick={handleSaveChanges}
                    >
                        Save Now
                    </Button>
                </div>
            )}

            {/* Permissions Matrix Ant Design Table */}
            <Table
                rowKey={(r) => r.module_key || r.module_code || r.id}
                columns={columns}
                dataSource={filteredData}
                loading={isLoading}
                pagination={false}
                bordered
                size="middle"
                scroll={{ x: 980 }}
            />

            {/* Bottom Save Bar for Quick Access */}
            <Row justify="space-between" align="middle" className="mt-4 pt-2">
                <Col>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Total Modules: {matrixData.length} &bull; Filtered: {filteredData.length}
                    </Text>
                </Col>
                <Col>
                    <Space size={10}>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={isSaving}
                            disabled={!hasChanges}
                            onClick={handleSaveChanges}
                        >
                            Save Changes
                        </Button>
                    </Space>
                </Col>
            </Row>
        </Card>
    );
}
