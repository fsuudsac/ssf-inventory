import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  Space,
  Progress,
  Popconfirm,
  App,
  Tooltip,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BankOutlined,
  DollarOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

export default function PageDepartments() {
  const { message } = App.useApp();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Add Department Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit Department Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editForm] = Form.useForm();
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Fetch departments from API
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/departments");
      if (res.data?.data) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
      message.error("Failed to fetch departments list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Format currency in Philippine Peso (PHP)
  const formatPHP = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  // Filter departments by search text
  const filteredDepartments = useMemo(() => {
    if (!searchText.trim()) return departments;
    const query = searchText.toLowerCase().trim();
    return departments.filter(
      (d) =>
        (d.name && d.name.toLowerCase().includes(query)) ||
        (d.code && d.code.toLowerCase().includes(query)) ||
        (d.head && d.head.toLowerCase().includes(query))
    );
  }, [departments, searchText]);

  // Aggregate stats across all departments
  const stats = useMemo(() => {
    const totalCount = departments.length;
    const totalAllocated = departments.reduce(
      (sum, d) => sum + (Number(d.allocated_amount ?? d.budget_allocated) || 0),
      0
    );
    const totalUtilized = departments.reduce(
      (sum, d) => sum + (Number(d.utilized_amount ?? d.budget_utilized) || 0),
      0
    );
    const totalRemaining = departments.reduce(
      (sum, d) => sum + (Number(d.remaining_balance ?? d.budget_remaining) || 0),
      0
    );
    const totalEncumbered = departments.reduce(
      (sum, d) => sum + (Number(d.encumbered_funds) || 0),
      0
    );
    const overallBurnRate =
      totalAllocated > 0
        ? Math.min(100, Math.round(((totalUtilized + totalEncumbered) / totalAllocated) * 100))
        : 0;

    return {
      totalCount,
      totalAllocated,
      totalUtilized,
      totalRemaining,
      totalEncumbered,
      overallBurnRate,
    };
  }, [departments]);

  // Handle Add Department form submit
  const handleAddDepartment = async (values) => {
    setSubmittingAdd(true);
    try {
      const payload = {
        name: values.name.trim(),
        code: values.code ? values.code.trim().toUpperCase() : values.name.slice(0, 4).toUpperCase(),
        head: values.head ? values.head.trim() : "Department Head",
        allocated_amount: Number(values.allocated_budget) || 0,
      };

      const res = await axios.post("/api/departments", payload);
      message.success(
        res.data?.message || `Department '${payload.name}' created successfully!`
      );
      setIsAddModalOpen(false);
      await fetchDepartments();
    } catch (err) {
      console.error("Failed to create department:", err);
      message.error(err.response?.data?.message || "Failed to create department.");
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Open Edit modal with current values
  const openEditModal = (record) => {
    setEditingDepartment(record);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    if (isEditModalOpen && editingDepartment) {
      editForm.setFieldsValue({
        name: editingDepartment.name,
        code: editingDepartment.code,
        head: editingDepartment.head,
        allocated_amount: Number(editingDepartment.allocated_amount ?? editingDepartment.budget_allocated) || 0,
      });
    }
  }, [isEditModalOpen, editingDepartment, editForm]);

  // Handle Edit Department form submit
  const handleEditDepartment = async (values) => {
    if (!editingDepartment) return;
    setSubmittingEdit(true);
    try {
      const payload = {
        name: values.name.trim(),
        code: values.code ? values.code.trim().toUpperCase() : editingDepartment.code,
        head: values.head ? values.head.trim() : editingDepartment.head,
        allocated_amount: Number(values.allocated_amount) || 0,
        budget_allocated: Number(values.allocated_amount) || 0,
      };

      const res = await axios.put(`/api/departments/${editingDepartment.id}`, payload);
      message.success(res.data?.message || `Department '${payload.name}' updated successfully!`);
      setIsEditModalOpen(false);
      setEditingDepartment(null);
      await fetchDepartments();
    } catch (err) {
      console.error("Failed to update department:", err);
      message.error(err.response?.data?.message || "Failed to update department.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Handle Delete Department
  const handleDeleteDepartment = async (id, name) => {
    try {
      const res = await axios.delete(`/api/departments/${id}`);
      message.success(res.data?.message || `Department '${name}' deleted successfully.`);
      await fetchDepartments();
    } catch (err) {
      console.error("Failed to delete department:", err);
      message.error(err.response?.data?.message || "Failed to delete department.");
    }
  };

  // Ant Design Table Columns definition
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      render: (id) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
          #{id}
        </span>
      ),
    },
    {
      title: "Department Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
            <BankOutlined className="text-blue-600 text-sm" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-sm">{name}</span>
            {record.head && (
              <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <UserOutlined className="text-slate-400 text-[11px]" />
                {record.head}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 100,
      render: (code) => (
        <Tag color="blue" className="font-mono font-bold tracking-wider px-2 py-0.5 text-xs">
          {code || "DEPT"}
        </Tag>
      ),
    },
    {
      title: "Total Allocated Budget",
      dataIndex: "allocated_amount",
      key: "allocated_amount",
      align: "right",
      render: (val, record) => {
        const allocated = Number(val ?? record.budget_allocated) || 0;
        return (
          <div className="text-right">
            <span className="font-bold text-slate-900 font-mono block">
              {formatPHP(allocated)}
            </span>
            <span className="text-[11px] text-slate-400">Initial Allocation</span>
          </div>
        );
      },
    },
    {
      title: "Utilized Amount",
      dataIndex: "utilized_amount",
      key: "utilized_amount",
      align: "right",
      render: (val, record) => {
        const utilized = Number(val ?? record.budget_utilized) || 0;
        return (
          <div className="text-right">
            <span className="font-semibold text-slate-700 font-mono block">
              {formatPHP(utilized)}
            </span>
            {record.encumbered_funds > 0 && (
              <span className="text-[11px] text-amber-600 block">
                + {formatPHP(record.encumbered_funds)} encumbered
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Remaining Balance",
      dataIndex: "remaining_balance",
      key: "remaining_balance",
      align: "right",
      render: (val, record) => {
        const remaining = Number(val ?? record.budget_remaining) || 0;
        const allocated = Number(record.allocated_amount ?? record.budget_allocated) || 1;
        const isLow = remaining / allocated < 0.2;
        const isExhausted = remaining <= 0;

        return (
          <div className="text-right">
            <span
              className={`font-bold font-mono text-sm block ${
                isExhausted
                  ? "text-rose-600 font-extrabold"
                  : isLow
                  ? "text-amber-600"
                  : "text-emerald-700"
              }`}
            >
              {formatPHP(remaining)}
            </span>
            <span className="text-[11px]">
              {isExhausted ? (
                <Tag color="error" className="m-0 text-[10px] px-1 py-0">
                  Exhausted
                </Tag>
              ) : isLow ? (
                <Tag color="warning" className="m-0 text-[10px] px-1 py-0">
                  Low Balance
                </Tag>
              ) : (
                <Tag color="success" className="m-0 text-[10px] px-1 py-0">
                  Healthy
                </Tag>
              )}
            </span>
          </div>
        );
      },
    },
    {
      title: "Budget Burn Rate",
      key: "burn_rate",
      width: 170,
      render: (_, record) => {
        const allocated = Number(record.allocated_amount ?? record.budget_allocated) || 0;
        const remaining = Number(record.remaining_balance ?? record.budget_remaining) || 0;
        const utilized = Number(record.utilized_amount ?? record.budget_utilized) || 0;
        const totalUsed = allocated - remaining > 0 ? allocated - remaining : utilized;
        const percent =
          allocated > 0 ? Math.min(100, Math.round((totalUsed / allocated) * 100)) : 0;

        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-medium">Burn Rate:</span>
              <span
                className={`font-bold ${
                  percent >= 85
                    ? "text-rose-600"
                    : percent >= 60
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {percent}%
              </span>
            </div>
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              status={percent >= 85 ? "exception" : "normal"}
              strokeColor={
                percent >= 85 ? "#e11d48" : percent >= 60 ? "#d97706" : "#059669"
              }
            />
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Department & Budget">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              className="text-slate-600 hover:text-blue-600"
            >
              Edit
            </Button>
          </Tooltip>

          <Popconfirm
            title="Delete Department"
            description={
              <div className="max-w-xs text-xs">
                Are you sure you want to delete <strong>{record.name}</strong>?
                <br />
                <span className="text-rose-500">
                  This action cannot be undone.
                </span>
              </div>
            }
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDeleteDepartment(record.id, record.name)}
          >
            <Tooltip title="Delete Department">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="pmo-departments-module space-y-6 p-4 max-w-7xl mx-auto">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Title level={3} className="m-0 text-slate-900">
              Department Management & Dynamic Budgeting
            </Title>
            <Tag color="geekblue" className="font-semibold text-xs">
              Settings & Allocation
            </Tag>
          </div>
          <Paragraph className="text-slate-500 m-0 text-sm">
            Administratively manage university colleges and offices, set initial budget allocations,
            and monitor real-time encumbrances and burn rates across the procurement pipeline.
          </Paragraph>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchDepartments}
            loading={loading}
          >
            Refresh
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="middle"
            onClick={() => {
              setIsAddModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Add New Department
          </Button>
        </div>
      </div>

      {/* Real-time Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border border-slate-200 shadow-xs bg-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Departments
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  {stats.totalCount}
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  Active academic & administrative units
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <BankOutlined className="text-blue-600 text-xl" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border border-slate-200 shadow-xs bg-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Allocated Budget
                </span>
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {formatPHP(stats.totalAllocated)}
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  Institutional budget appropriation
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <DollarOutlined className="text-emerald-600 text-xl" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border border-slate-200 shadow-xs bg-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Utilized & Encumbered
                </span>
                <span className="text-2xl font-bold font-mono text-amber-700">
                  {formatPHP(stats.totalUtilized + stats.totalEncumbered)}
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  {stats.overallBurnRate}% of total institutional budget
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <PieChartOutlined className="text-amber-600 text-xl" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border border-slate-200 shadow-xs bg-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Available Balance
                </span>
                <span className="text-2xl font-bold font-mono text-emerald-700">
                  {formatPHP(stats.totalRemaining)}
                </span>
                <span className="text-xs text-emerald-600 font-medium block mt-1">
                  Ready for new PRs & POs
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <SafetyCertificateOutlined className="text-emerald-600 text-xl" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card className="rounded-2xl border border-slate-200 shadow-xs bg-white overflow-hidden">
        {/* Table Filter / Search Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="w-full sm:w-80">
            <Input
              prefix={<SearchOutlined className="text-slate-400 mr-1" />}
              placeholder="Search by department name, code, or dean..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>
              Showing <strong>{filteredDepartments.length}</strong> of{" "}
              <strong>{departments.length}</strong> departments
            </span>
          </div>
        </div>

        {/* Ant Design Data Table */}
        <Table
          columns={columns}
          dataSource={filteredDepartments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} departments`,
          }}
          className="border border-slate-100 rounded-xl overflow-hidden"
        />
      </Card>

      {/* Modal: Add New Department */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <BankOutlined />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base block">
                Add New Department
              </span>
              <span className="text-xs text-slate-500 font-normal">
                Register a new academic department or administrative office with initial budget.
              </span>
            </div>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => {
          if (!submittingAdd) {
            setIsAddModalOpen(false);
          }
        }}
        footer={null}
        destroyOnClose
        centered
        width={560}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddDepartment}
          initialValues={{
            allocated_budget: 250000,
          }}
          className="pt-3 space-y-3"
        >
          <Alert
            message="Dynamic Budget Chain Integration"
            description="Newly created departments are immediately selectable across the entire procurement workflow (Canvassing, PR, Finance Approval, and Purchase Orders)."
            type="info"
            showIcon
            className="mb-4"
          />

          <Form.Item
            name="name"
            label="Department Name"
            rules={[
              { required: true, message: "Please enter the department name" },
              { min: 3, message: "Name must be at least 3 characters" },
            ]}
          >
            <Input
              placeholder="e.g., College of Business Administration (CBA)"
              prefix={<BankOutlined className="text-slate-400 mr-1" />}
              className="py-1.5"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Department Code"
                rules={[
                  { required: true, message: "Please enter a short code" },
                  { max: 10, message: "Max 10 characters" },
                ]}
                tooltip="Short abbreviation used on badges and reports (e.g. CCS, CBA, PMO, FAO)"
              >
                <Input
                  placeholder="e.g., CBA"
                  className="font-mono uppercase py-1.5"
                  onChange={(e) => {
                    addForm.setFieldValue("code", e.target.value.toUpperCase());
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="head"
                label="Department Head / Dean"
                rules={[{ required: false }]}
                tooltip="Primary signatory / custodian for this department"
              >
                <Input
                  placeholder="e.g., Dr. Maria Santos"
                  prefix={<UserOutlined className="text-slate-400 mr-1" />}
                  className="py-1.5"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="allocated_budget"
            label="Initial Allocated Budget (PHP)"
            rules={[
              { required: true, message: "Please specify the allocated budget" },
              { type: "number", min: 0, message: "Budget must be a non-negative number" },
            ]}
            tooltip="The starting budget appropriation for this fiscal cycle. Remaining balance will initially match this amount."
          >
            <InputNumber
              className="w-full font-mono py-1 text-base"
              formatter={(value) => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\₱\s?|(,*)/g, "")}
              min={0}
              step={10000}
            />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
              }}
              disabled={submittingAdd}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submittingAdd}
              icon={<PlusOutlined />}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Department
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal: Edit Department */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <EditOutlined />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base block">
                Edit Department & Budget
              </span>
              <span className="text-xs text-slate-500 font-normal">
                Update department details or adjust the allocated budget amount.
              </span>
            </div>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => {
          if (!submittingEdit) {
            setIsEditModalOpen(false);
            setEditingDepartment(null);
          }
        }}
        footer={null}
        destroyOnClose
        centered
        width={560}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditDepartment}
          className="pt-3 space-y-3"
        >
          <Form.Item
            name="name"
            label="Department Name"
            rules={[{ required: true, message: "Please enter department name" }]}
          >
            <Input
              placeholder="Department Name"
              prefix={<BankOutlined className="text-slate-400 mr-1" />}
              className="py-1.5"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Department Code"
                rules={[{ required: true, message: "Please enter code" }]}
              >
                <Input
                  className="font-mono uppercase py-1.5"
                  onChange={(e) => {
                    editForm.setFieldValue("code", e.target.value.toUpperCase());
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="head" label="Department Head / Dean">
                <Input
                  placeholder="e.g. Dr. Jane Doe"
                  prefix={<UserOutlined className="text-slate-400 mr-1" />}
                  className="py-1.5"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="allocated_amount"
            label="Total Allocated Budget (PHP)"
            rules={[
              { required: true, message: "Please enter allocated budget" },
              { type: "number", min: 0, message: "Must be non-negative" },
            ]}
            tooltip="Modifying this dynamically adjusts the remaining balance."
          >
            <InputNumber
              className="w-full font-mono py-1 text-base"
              formatter={(value) => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\₱\s?|(,*)/g, "")}
              min={0}
              step={10000}
            />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingDepartment(null);
              }}
              disabled={submittingEdit}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submittingEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
