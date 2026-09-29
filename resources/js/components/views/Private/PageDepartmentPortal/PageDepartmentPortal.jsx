import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Card,
  Button,
  Tag,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Table,
  Badge,
  Descriptions,
  Divider,
  App,
  Row,
  Col,
  Statistic,
  Alert,
  Tooltip,
  Steps,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BankOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  SendOutlined,
  SyncOutlined,
  InboxOutlined,
  ShopOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  SearchOutlined,
  HistoryOutlined,
  FileExcelOutlined,
  SafetyCertificateOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { AttachmentBadge } from "../../../common/KanbanBoard";
import RequestTrailTimeline from "../../../common/RequestTrailTimeline";
import { useProcurementRealtime } from "../../../providers/ProcurementRealtimeProvider";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function PageDepartmentPortal() {
  const { message, notification } = App.useApp();
  const { unifiedRecords, refreshAll } = useProcurementRealtime();
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(2); // Default to CCS
  const [departmentData, setDepartmentData] = useState(null);
  const [canvassRequests, setCanvassRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Department Portal Tabs & Reporting State
  const [activeDeptTab, setActiveDeptTab] = useState("actionable_pipeline"); // "actionable_pipeline" | "transaction_reporting"
  const [reportSearchText, setReportSearchText] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("all");
  const [auditTrailModalRecord, setAuditTrailModalRecord] = useState(null);
  const [isAuditTrailModalOpen, setIsAuditTrailModalOpen] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  // Create Form
  const [createForm] = Form.useForm();
  const [formItems, setFormItems] = useState([
    {
      id: 1,
      item_name: "",
      description: "",
      quantity: 1,
      unit: "pcs",
      estimated_unit_cost: 0,
      estimated_total: 0,
    },
  ]);

  // Fetch departments list
  const fetchDepartments = async () => {
    try {
      const res = await axios.get("/api/departments");
      const list = res.data?.data || [];
      setDepartments(list);

      const found = list.find((d) => d.id === selectedDeptId) || list[0];
      if (found) {
        setDepartmentData(found);
        if (!selectedDeptId) setSelectedDeptId(found.id);
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  };

  // Fetch canvasses/requests for this department
  const fetchDepartmentRequests = async (deptId) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/canvasses");
      const allCanvasses = res.data?.data || [];
      const targetDeptId = deptId || selectedDeptId;
      const deptFiltered = allCanvasses.filter(
        (c) => c.department_id === Number(targetDeptId)
      );
      setCanvassRequests(deptFiltered);
    } catch (err) {
      console.error("Failed to load canvass requests:", err);
      message.error("Unable to load department requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDeptId) {
      const found = departments.find((d) => d.id === selectedDeptId);
      if (found) setDepartmentData(found);
      fetchDepartmentRequests(selectedDeptId);
    }
  }, [selectedDeptId, departments]);

  // Handle department selector change
  const handleDepartmentChange = (deptId) => {
    setSelectedDeptId(deptId);
    const found = departments.find((d) => d.id === deptId);
    if (found) setDepartmentData(found);
  };

  // Dynamic Item changes in Create Modal
  const handleItemFieldChange = (index, field, value) => {
    const updated = [...formItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    const qty = Number(field === "quantity" ? value : updated[index].quantity) || 0;
    const cost = Number(field === "estimated_unit_cost" ? value : updated[index].estimated_unit_cost) || 0;
    updated[index].estimated_total = qty * cost;

    setFormItems(updated);
  };

  const addItemRow = () => {
    setFormItems([
      ...formItems,
      {
        id: Date.now(),
        item_name: "",
        description: "",
        quantity: 1,
        unit: "pcs",
        estimated_unit_cost: 0,
        estimated_total: 0,
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (formItems.length === 1) {
      message.warning("At least one line item is required for the canvass request.");
      return;
    }
    setFormItems(formItems.filter((_, idx) => idx !== index));
  };

  // Form total estimated budget calculation
  const totalEstimatedCost = useMemo(() => {
    return formItems.reduce((acc, item) => acc + (Number(item.estimated_total) || 0), 0);
  }, [formItems]);

  const allocated = Number(departmentData?.allocated_amount ?? departmentData?.budget_allocated ?? 0);
  const utilized = Number(departmentData?.utilized_amount ?? departmentData?.budget_utilized ?? 0);
  const encumbered = Number(departmentData?.encumbered_amount ?? departmentData?.budget_encumbered ?? 0);
  const remaining = Number(departmentData?.remaining_balance ?? departmentData?.budget_remaining ?? Math.max(0, allocated - utilized - encumbered));
  const projectedBalance = remaining - totalEstimatedCost;
  const isExceedingBudget = totalEstimatedCost > remaining;

  // Submit Create Canvass Request
  const handleSubmitRequest = async (values) => {
    if (formItems.some((i) => !i.item_name.trim())) {
      message.error("Please provide a description or item name for all line items.");
      return;
    }

    if (totalEstimatedCost <= 0) {
      message.error("Total estimated request amount must be greater than ₱0.");
      return;
    }

    try {
      const payload = {
        title: values.title,
        department_id: selectedDeptId,
        department_name: departmentData?.name || departmentData?.department_name || `Department #${selectedDeptId}`,
        category: values.category || "General Supplies",
        priority: values.priority || "Medium",
        deadline: values.deadline ? values.deadline.format("YYYY-MM-DD") : dayjs().add(7, "day").format("YYYY-MM-DD"),
        justification: values.justification || "",
        status: "Pending Canvass", // Explicitly set to Pending Canvass per requirement
        total_estimated_budget: totalEstimatedCost,
        items: formItems.map((it) => ({
          item_name: it.item_name,
          description: it.description || "",
          quantity: Number(it.quantity) || 1,
          unit: it.unit || "pcs",
          estimated_unit_cost: Number(it.estimated_unit_cost) || 0,
          total_estimated_cost: Number(it.estimated_total) || 0,
        })),
      };

      const res = await axios.post("/api/canvasses", payload);
      const newCanvass = res.data?.data;

      // Ant Design Alert / Notification indicating VPASA has been notified
      notification.success({
        message: "Canvass Request Submitted!",
        description: (
          <div className="space-y-1">
            <p>
              Request <strong>{newCanvass?.canvass_no || "RFQ"}</strong> was successfully
              queued with status <strong>"Pending Canvass"</strong>.
            </p>
            <p className="text-xs text-blue-700 bg-blue-50 p-1.5 rounded border border-blue-200">
              🔔 <strong>VPASA (Canvasser) has been alerted</strong> to review your request
              specifications and begin sourcing bids from accredited suppliers.
            </p>
          </div>
        ),
        duration: 8,
        icon: <SendOutlined style={{ color: "#722ed1" }} />,
      });

      setIsCreateModalOpen(false);
      setFormItems([
        {
          id: 1,
          item_name: "",
          description: "",
          quantity: 1,
          unit: "pcs",
          estimated_unit_cost: 0,
          estimated_total: 0,
        },
      ]);

      fetchDepartmentRequests(selectedDeptId);
      fetchDepartments();
    } catch (err) {
      console.error("Failed to submit canvass request:", err);
      message.error(err.response?.data?.message || "Failed to submit canvass request.");
    }
  };

  // Table columns for Department Requests
  const requestColumns = [
    {
      title: "RFQ / Request No.",
      dataIndex: "canvass_no",
      key: "canvass_no",
      render: (text) => <span className="font-mono font-semibold text-slate-800">{text}</span>,
    },
    {
      title: "Title & Purpose",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div className="font-semibold text-slate-900">{text}</div>
          {record.justification && (
            <div className="text-xs text-slate-500 italic line-clamp-1">
              Justification: {record.justification}
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-0.5">
            Category: <Tag className="text-[10px] m-0">{record.category}</Tag> | Deadline:{" "}
            {record.deadline}
          </div>
        </div>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (p) => (
        <Tag color={p === "Urgent" ? "red" : p === "High" ? "orange" : "blue"}>
          {p}
        </Tag>
      ),
    },
    {
      title: "Line Items",
      dataIndex: "items",
      key: "items",
      render: (items) => (
        <span className="text-xs font-medium text-slate-700">
          {items?.length || 0} items ({items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0} units)
        </span>
      ),
    },
    {
      title: "Est. Total",
      dataIndex: "total_estimated_budget",
      key: "total_estimated_budget",
      render: (amount) => (
        <span className="font-semibold text-slate-900">
          ₱{Number(amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        if (status === "Pending Canvass") {
          return (
            <Tooltip title="VPASA Canvasser notified. Sourcing quotations has not yet begun.">
              <Tag color="purple" icon={<ClockCircleOutlined />}>
                Pending Canvass
              </Tag>
            </Tooltip>
          );
        }
        if (status === "Seeking Bids") {
          return (
            <Tooltip title="VPASA is actively collecting price quotations from suppliers.">
              <Tag color="blue" icon={<ShopOutlined />}>
                Seeking Bids ({record.supplier_bids?.length || 0} received)
              </Tag>
            </Tooltip>
          );
        }
        if (status === "Under Review") {
          return (
            <Tooltip title="Supplier proposals are being evaluated in the comparative matrix.">
              <Tag color="orange" icon={<ClockCircleOutlined />}>
                Under Review
              </Tag>
            </Tooltip>
          );
        }
        if (status === "Winning Bid Selected") {
          return (
            <Tooltip title="Winning quotation selected. Submitted to Finance Office for budget clearance.">
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Winning Bid Selected
              </Tag>
            </Tooltip>
          );
        }
        return <Tag color="default">{status}</Tag>;
      },
    },
    {
      title: "PO Status",
      key: "po_status",
      render: (_, record) => {
        if (record.po_no) {
          return (
            <Tag color="cyan" className="font-mono text-xs">
              PO: {record.po_no}
            </Tag>
          );
        }
        if (record.finance_status === "Finance Approved") {
          return <Tag color="success">Approved</Tag>;
        }
        if (record.finance_status === "Over Budget (Needs Revision)") {
          return <Tag color="error">Over Budget</Tag>;
        }
        return <span className="text-xs text-slate-400">Awaiting clearance</span>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setActiveRequest(record);
            setIsDetailModalOpen(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Department Transaction History & Reporting Memo
  const departmentReportRecords = useMemo(() => {
    let source = (unifiedRecords && unifiedRecords.length > 0) ? unifiedRecords : canvassRequests;

    let records = source.filter((r) => {
      return (
        r.department_id === Number(selectedDeptId) ||
        (departmentData?.name && r.department_name === departmentData.name) ||
        (departmentData?.code && r.department_code === departmentData.code)
      );
    });

    if (reportStatusFilter !== "all") {
      records = records.filter((r) => r.status === reportStatusFilter);
    }

    if (reportSearchText.trim()) {
      const q = reportSearchText.toLowerCase();
      records = records.filter(
        (r) =>
          (r.pr_no && r.pr_no.toLowerCase().includes(q)) ||
          (r.canvass_no && r.canvass_no.toLowerCase().includes(q)) ||
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.purpose && r.purpose.toLowerCase().includes(q)) ||
          (r.winning_supplier && r.winning_supplier.toLowerCase().includes(q)) ||
          (r.awarded_supplier && r.awarded_supplier.toLowerCase().includes(q)) ||
          (r.items &&
            Array.isArray(r.items) &&
            r.items.some((it) => it.item_name?.toLowerCase().includes(q)))
      );
    }

    return records;
  }, [unifiedRecords, canvassRequests, selectedDeptId, departmentData, reportStatusFilter, reportSearchText]);

  // Summary Metrics for Department Reporting
  const deptTotalValue = useMemo(() => {
    return departmentReportRecords.reduce(
      (sum, r) =>
        sum +
        Number(r.winning_bid_amount || r.total_estimated_budget || r.total_amount || 0),
      0
    );
  }, [departmentReportRecords]);

  const deptCompletedCount = useMemo(() => {
    const completedStages = [
      "PO Issued",
      "Purchase Order Issued",
      "Sent to Supplier",
      "In Transit",
      "Partially Received",
      "Fully Received",
    ];
    return departmentReportRecords.filter((r) => completedStages.includes(r.status)).length;
  }, [departmentReportRecords]);

  // CSV Export for Department Report
  const handleExportDeptCSV = () => {
    try {
      const headers = [
        "Transaction ID (RFQ/PR)",
        "Date Initiated",
        "Item Summary",
        "Awarded Vendor",
        "Total Amount (PHP)",
        "Status",
      ];
      const rows = departmentReportRecords.map((r) => {
        const itemSummary =
          r.items && Array.isArray(r.items) && r.items.length > 0
            ? `${r.items.length} items (${r.items.map((i) => i.item_name || i.title).slice(0, 2).join(", ")})`
            : r.title || r.purpose || "Requisition Items";
        const vendor =
          r.winning_supplier ||
          r.awarded_supplier ||
          (r.quotations?.find((q) => q.is_selected)?.supplier_name) ||
          "Pending Award";
        const amt = Number(
          r.winning_bid_amount || r.total_estimated_budget || r.total_amount || 0
        ).toFixed(2);
        const date = r.created_at
          ? r.created_at.slice(0, 10)
          : r.date_requested || "N/A";
        return [
          `"${r.pr_no || r.canvass_no || `RFQ-${r.id}`}"`,
          `"${date}"`,
          `"${itemSummary.replace(/"/g, '""')}"`,
          `"${vendor}"`,
          `"${amt}"`,
          `"${r.status || ""}"`,
        ];
      });
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `Department_Transactions_${departmentData?.code || "DEPT"}_${dayjs().format("YYYYMMDD_HHmmss")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success("Department transaction history exported to CSV successfully.");
    } catch (err) {
      console.error("Export error:", err);
      message.error("Failed to export transaction history.");
    }
  };

  // Department Transaction History & Reporting Columns
  const departmentReportColumns = [
    {
      title: "Transaction ID (RFQ / PR)",
      key: "transaction_id",
      width: 170,
      render: (_, r) => (
        <div>
          <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 block w-fit">
            {r.pr_no || r.canvass_no || `RFQ-${r.id}`}
          </span>
          {r.canvass_no && r.pr_no && r.canvass_no !== r.pr_no && (
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              RFQ: {r.canvass_no}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Date Initiated",
      key: "date_initiated",
      width: 130,
      render: (_, r) => {
        const d = r.created_at ? r.created_at.slice(0, 10) : (r.date_requested || "N/A");
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ClockCircleOutlined className="text-slate-400" />
            <span>{d}</span>
          </div>
        );
      },
    },
    {
      title: "Item Summary",
      key: "item_summary",
      render: (_, r) => {
        const count = r.items?.length || 0;
        return (
          <div>
            <div className="font-semibold text-slate-900 text-xs">
              {r.title || r.purpose || "Canvass Requisition"}
            </div>
            {count > 0 ? (
              <div className="text-[11px] text-slate-500 mt-0.5">
                <span className="font-medium text-purple-700">{count} item{count > 1 ? "s" : ""}:</span>{" "}
                {r.items.map((i) => i.item_name || i.title).slice(0, 3).join(", ")}
                {count > 3 ? "..." : ""}
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic">No line item breakdown</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Awarded Vendor",
      key: "awarded_vendor",
      width: 200,
      render: (_, r) => {
        const vendor =
          r.winning_supplier ||
          r.awarded_supplier ||
          (r.quotations?.find((q) => q.is_selected)?.supplier_name);
        if (vendor) {
          return (
            <div className="flex items-center gap-1.5">
              <ShopOutlined className="text-emerald-600" />
              <span className="font-semibold text-xs text-slate-800">{vendor}</span>
            </div>
          );
        }
        return (
          <span className="text-xs text-slate-400 italic">
            Pending Sourcing Award
          </span>
        );
      },
    },
    {
      title: "Total Amount",
      key: "total_amount",
      width: 150,
      render: (_, r) => {
        const val = Number(
          r.winning_bid_amount || r.total_estimated_budget || r.total_amount || 0
        );
        return (
          <strong className="text-sm text-slate-900">
            ₱{val.toLocaleString()}
          </strong>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 170,
      render: (status) => {
        const map = {
          "Pending Canvass": { color: "purple", text: "Pending Canvass" },
          "Canvassing in Progress": { color: "processing", text: "Canvassing" },
          "Bid Awarded - Pending PR": { color: "cyan", text: "Bid Awarded - Pending PR" },
          "Contested": { color: "red", text: "Contested" },
          "Pending Finance Approval": { color: "orange", text: "Pending Finance Clearance" },
          "Pending Finance Review": { color: "orange", text: "Pending Finance Review" },
          "Needs Revision": { color: "magenta", text: "Needs Revision" },
          "Finance Approved - Pending VPASA": { color: "lime", text: "Finance Approved - Pending VPASA" },
          "Finance Approved": { color: "green", text: "Finance Approved" },
          "Approved PR": { color: "green", text: "Approved PR" },
          "Ready for PO": { color: "geekblue", text: "Ready for PO" },
          "PO Issued": { color: "green", text: "PO Issued" },
          "Purchase Order Issued": { color: "green", text: "PO Issued" },
          "Sent to Supplier": { color: "blue", text: "Sent to Supplier" },
          "In Transit": { color: "blue", text: "In Transit" },
          "Partially Received": { color: "purple", text: "Partially Received" },
          "Fully Received": { color: "success", text: "Fully Received" },
        };
        const conf = map[status] || { color: "default", text: status || "Initiated" };
        return (
          <Tag color={conf.color} className="font-semibold text-xs">
            {conf.text}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => {
              setAuditTrailModalRecord(record);
              setIsAuditTrailModalOpen(true);
            }}
          >
            Audit Trail
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setActiveRequest(record);
              setIsDetailModalOpen(true);
            }}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* Top Banner / Department Selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
              <BankOutlined className="text-2xl" />
            </div>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Department Request Portal
              </Title>
              <Text type="secondary" className="text-sm">
                Submit canvass specifications and track your department's procurement lifecycle.
              </Text>
            </div>
          </div>
        </div>

        {/* Department Switcher */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Department:
          </span>
          <Select
            value={selectedDeptId}
            onChange={handleDepartmentChange}
            style={{ width: 280 }}
            className="font-medium"
          >
            {departments.map((d) => (
              <Option key={d.id} value={d.id}>
                {d.name || d.department_name} ({d.code || d.abbr || "DEPT"})
              </Option>
            ))}
          </Select>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-purple-600 hover:bg-purple-700 font-semibold shadow-sm"
            onClick={() => {
              setFormItems([
                {
                  id: 1,
                  item_name: "",
                  description: "",
                  quantity: 1,
                  unit: "pcs",
                  estimated_unit_cost: 0,
                  estimated_total: 0,
                },
              ]);
              setIsCreateModalOpen(true);
            }}
          >
            Create Canvass Request
          </Button>
        </div>
      </div>

      {/* Real-time Budget Status of Department */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border border-slate-200 shadow-sm">
            <Statistic
              title={<span className="text-xs font-semibold text-slate-500">Allocated Budget</span>}
              value={allocated}
              precision={2}
              prefix="₱"
              valueStyle={{ color: "#1e293b", fontWeight: 700, fontSize: "1.25rem" }}
            />
            <div className="text-[11px] text-slate-400 mt-1">Official FY Annual Allocation</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border border-slate-200 shadow-sm">
            <Statistic
              title={<span className="text-xs font-semibold text-slate-500">Encumbered Funds</span>}
              value={encumbered}
              precision={2}
              prefix="₱"
              valueStyle={{ color: "#fa8c16", fontWeight: 700, fontSize: "1.25rem" }}
            />
            <div className="text-[11px] text-slate-400 mt-1">Locked in Approved PRs / POs</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border border-slate-200 shadow-sm">
            <Statistic
              title={<span className="text-xs font-semibold text-slate-500">Utilized to Date</span>}
              value={utilized}
              precision={2}
              prefix="₱"
              valueStyle={{ color: "#3b82f6", fontWeight: 700, fontSize: "1.25rem" }}
            />
            <div className="text-[11px] text-slate-400 mt-1">Disbursed & Delivered</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
            <Statistic
              title={<span className="text-xs font-semibold text-emerald-800">Available Balance</span>}
              value={remaining}
              precision={2}
              prefix="₱"
              valueStyle={{ color: "#059669", fontWeight: 700, fontSize: "1.25rem" }}
            />
            <div className="text-[11px] text-emerald-600 mt-1 font-medium">Ready for New Requisitions</div>
          </Card>
        </Col>
      </Row>

      {/* Department Tabs: Actionable Pipeline vs Transaction History & Reporting */}
      <Tabs
        activeKey={activeDeptTab}
        onChange={setActiveDeptTab}
        type="card"
        className="department-tabs"
        items={[
          {
            key: "actionable_pipeline",
            label: (
              <span className="font-semibold px-2 flex items-center gap-2">
                <FileTextOutlined className="text-purple-600" />
                <span>Actionable Pipeline</span>
                <Badge
                  count={canvassRequests.length}
                  style={{ backgroundColor: "#722ed1" }}
                  overflowCount={999}
                />
              </span>
            ),
            children: (
              <div className="space-y-6">
                {/* Info Notice about VPASA Notification & Pipeline */}
                <Alert
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined className="text-purple-600" />}
                  className="rounded-xl border border-purple-200 bg-purple-50/60"
                  message={
                    <span className="font-semibold text-purple-900">
                      6-Stage Procurement Pipeline Sequence
                    </span>
                  }
                  description={
                    <div className="text-xs text-purple-950 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                      <div className="bg-white/80 p-2 rounded border border-purple-100">
                        <strong>1. RFQ Initiation (Dept):</strong> Submit requisition with specifications &rarr; status <Tag color="purple" className="m-0 text-[10px]">Pending Canvass</Tag>.
                      </div>
                      <div className="bg-white/80 p-2 rounded border border-purple-100">
                        <strong>2. Canvassing & Bids (PMO):</strong> Sourcing gathers quotes and awards winning supplier &rarr; status <Tag color="cyan" className="m-0 text-[10px]">Bid Awarded - Pending PR</Tag>.
                      </div>
                      <div className="bg-white/80 p-2 rounded border border-purple-100">
                        <strong>3. Formal PR Drafting (Dept):</strong> Review awarded bid, draft formal PR (or contest) &rarr; status <Tag color="orange" className="m-0 text-[10px]">Pending Finance Approval</Tag>.
                      </div>
                      <div className="bg-white/80 p-2 rounded border border-purple-100">
                        <strong>4. Finance Clearance:</strong> Finance verifies budget and encumbers funds &rarr; status <Tag color="blue" className="m-0 text-[10px]">Finance Approved - Pending VPASA</Tag>.
                      </div>
                      <div className="bg-white/80 p-2 rounded border border-purple-100">
                        <strong>5. Executive Sign-off (VPASA):</strong> Final authorization &rarr; status <Tag color="geekblue" className="m-0 text-[10px]">Ready for PO</Tag>.
                      </div>
                      <div className="bg-white/80 p-2 rounded border border-purple-100">
                        <strong>6. Purchase Order:</strong> Official PO generated and dispatched &rarr; status <Tag color="green" className="m-0 text-[10px]">PO Issued</Tag>.
                      </div>
                    </div>
                  }
                />

                {/* Table of Department Canvasses */}
                <Card
                  className="rounded-xl border border-slate-200 shadow-sm"
                  title={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          Requisitions & Canvass Requests for{" "}
                          <span className="text-purple-700">
                            {departmentData?.name || departmentData?.department_name || "Department"}
                          </span>
                        </span>
                        <Badge
                          count={canvassRequests.length}
                          style={{ backgroundColor: "#722ed1" }}
                        />
                      </div>
                      <Button
                        size="small"
                        icon={<SyncOutlined />}
                        onClick={() => fetchDepartmentRequests(selectedDeptId)}
                        loading={loading}
                      >
                        Refresh
                      </Button>
                    </div>
                  }
                >
                  <Table
                    dataSource={canvassRequests}
                    columns={requestColumns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    locale={{ emptyText: "No canvass requests found for this department yet. Click 'Create Canvass Request' above to begin!" }}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: "transaction_reporting",
            label: (
              <span className="font-semibold px-2 flex items-center gap-2">
                <FileTextOutlined className="text-purple-600" />
                <span>Transaction History & Reporting</span>
                <Badge
                  count={departmentReportRecords.length}
                  style={{ backgroundColor: "#722ed1" }}
                  overflowCount={999}
                />
              </span>
            ),
            children: (
              <div className="space-y-4">
                {/* Summary Metrics Bar */}
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={8}>
                    <Card className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-xs">
                      <Statistic
                        title={
                          <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
                            <FileTextOutlined className="text-purple-600" />
                            Total Department Transactions
                          </span>
                        }
                        value={departmentReportRecords.length}
                        suffix={<span className="text-xs text-purple-600 font-normal">Requisitions</span>}
                        valueStyle={{ color: "#6b21a8", fontWeight: 700 }}
                      />
                      <div className="text-xs text-purple-700/80 mt-1">
                        Across all active and historical pipeline stages
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={8}>
                    <Card className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-xs">
                      <Statistic
                        title={
                          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                            <SafetyCertificateOutlined className="text-emerald-600" />
                            POs Issued & Delivered
                          </span>
                        }
                        value={deptCompletedCount}
                        suffix={<span className="text-xs text-emerald-600 font-normal">Orders</span>}
                        valueStyle={{ color: "#047857", fontWeight: 700 }}
                      />
                      <div className="text-xs text-emerald-700/80 mt-1">
                        Successfully authorized by VPASA and dispatched
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={8}>
                    <Card className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-xs">
                      <Statistic
                        title={
                          <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <DollarOutlined className="text-slate-600" />
                            Total Department Requisitions Value
                          </span>
                        }
                        value={deptTotalValue}
                        precision={2}
                        prefix={<span className="text-slate-600 mr-0.5">₱</span>}
                        valueStyle={{ color: "#1e293b", fontWeight: 700 }}
                      />
                      <div className="text-xs text-slate-500 mt-1">
                        Total value of quotations & approved PRs
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* Filter and Control Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Input
                      placeholder="Search RFQ, PR, Item, or Vendor..."
                      prefix={<SearchOutlined className="text-slate-400" />}
                      value={reportSearchText}
                      onChange={(e) => setReportSearchText(e.target.value)}
                      style={{ width: 280 }}
                      allowClear
                    />

                    <Select
                      value={reportStatusFilter}
                      onChange={setReportStatusFilter}
                      style={{ width: 240 }}
                      placeholder="Filter by Stage"
                    >
                      <Option value="all">All Pipeline Stages</Option>
                      <Option value="Pending Canvass">Pending Canvass</Option>
                      <Option value="Bid Awarded - Pending PR">Bid Awarded - Pending PR</Option>
                      <Option value="Contested">Contested</Option>
                      <Option value="Pending Finance Approval">Pending Finance Clearance</Option>
                      <Option value="Finance Approved - Pending VPASA">
                        Finance Approved - Pending VPASA
                      </Option>
                      <Option value="Ready for PO">Ready for PO</Option>
                      <Option value="PO Issued">PO Issued</Option>
                      <Option value="Sent to Supplier">Sent to Supplier</Option>
                      <Option value="In Transit">In Transit</Option>
                      <Option value="Fully Received">Fully Received</Option>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      icon={<FileExcelOutlined />}
                      className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-medium"
                      onClick={handleExportDeptCSV}
                    >
                      Export to CSV
                    </Button>
                  </div>
                </div>

                {/* Comprehensive Data Table */}
                <Card className="rounded-xl border border-slate-200 shadow-xs bg-white">
                  <Table
                    dataSource={departmentReportRecords}
                    columns={departmentReportColumns}
                    rowKey={(r) => r.id || r.pr_no || r.canvass_no || Math.random()}
                    pagination={{ pageSize: 8, showSizeChanger: true }}
                    locale={{
                      emptyText:
                        "No transactions found for this department matching the criteria.",
                    }}
                  />
                </Card>
              </div>
            ),
          },
        ]}
      />

      {/* ==================== CREATE CANVASS REQUEST MODAL ==================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <div className="p-1.5 bg-purple-100 text-purple-700 rounded">
              <PlusOutlined />
            </div>
            <span>Create Canvass Request</span>
          </div>
        }
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={850}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleSubmitRequest}
          initialValues={{
            priority: "Medium",
            category: "IT & Computers",
            deadline: dayjs().add(7, "day"),
          }}
          className="mt-4"
        >
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Requesting Department:</span>
              <strong className="text-sm text-slate-800">
                {departmentData?.name || departmentData?.department_name} ({departmentData?.code || "DEPT"})
              </strong>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium block">Available Department Budget:</span>
              <strong className="text-sm text-emerald-700">
                ₱{remaining.toLocaleString()}
              </strong>
            </div>
          </div>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                label="Request Title / Purpose"
                name="title"
                rules={[{ required: true, message: "Please specify the purpose or title of this request" }]}
              >
                <Input placeholder="e.g. Laboratory Equipment Upgrade for Embedded Systems Lab" />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item label="Category" name="category" rules={[{ required: true }]}>
                <Select>
                  <Option value="IT & Computers">IT & Computers</Option>
                  <Option value="Office Supplies">Office Supplies</Option>
                  <Option value="Laboratory Equipment">Laboratory Equipment</Option>
                  <Option value="Engineering Tools">Engineering Tools</Option>
                  <Option value="Furniture & Fixtures">Furniture & Fixtures</Option>
                  <Option value="Facilities & Repairs">Facilities & Repairs</Option>
                  <Option value="Services">Services</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item label="Priority" name="priority" rules={[{ required: true }]}>
                <Select>
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                  <Option value="Urgent">Urgent</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Target Deadline"
                name="deadline"
                rules={[{ required: true, message: "Please specify required delivery/completion date" }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>

            <Col span={16}>
              <Form.Item
                label="Justification / Rationale"
                name="justification"
                rules={[{ required: true, message: "Please provide a brief justification for this purchase" }]}
              >
                <TextArea
                  rows={2}
                  placeholder="Explain why this purchase is needed (e.g. Required for CHED curriculum compliance in AY 2026-2027)..."
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "12px 0" }}>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Requested Items & Estimated Costs
            </span>
          </Divider>

          {/* Line items table / input list */}
          <div className="space-y-3 mb-4">
            {formItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Line Item #{idx + 1}</span>
                  {formItems.length > 1 && (
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeItemRow(idx)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <Row gutter={12}>
                  <Col span={10}>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">
                      Item Name / Specifications *
                    </label>
                    <Input
                      placeholder="e.g. Arduino Mega 2560 Pro Kit"
                      value={item.item_name}
                      onChange={(e) => handleItemFieldChange(idx, "item_name", e.target.value)}
                    />
                  </Col>

                  <Col span={4}>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">
                      Quantity *
                    </label>
                    <InputNumber
                      min={1}
                      className="w-full"
                      value={item.quantity}
                      onChange={(v) => handleItemFieldChange(idx, "quantity", v)}
                    />
                  </Col>

                  <Col span={4}>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">
                      Unit
                    </label>
                    <Select
                      className="w-full"
                      value={item.unit}
                      onChange={(v) => handleItemFieldChange(idx, "unit", v)}
                    >
                      <Option value="pcs">pcs</Option>
                      <Option value="units">units</Option>
                      <Option value="sets">sets</Option>
                      <Option value="boxes">boxes</Option>
                      <Option value="packs">packs</Option>
                      <Option value="rolls">rolls</Option>
                      <Option value="lots">lots</Option>
                    </Select>
                  </Col>

                  <Col span={6}>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">
                      Est. Unit Cost (₱)
                    </label>
                    <InputNumber
                      min={0}
                      className="w-full"
                      value={item.estimated_unit_cost}
                      onChange={(v) => handleItemFieldChange(idx, "estimated_unit_cost", v)}
                    />
                  </Col>
                </Row>

                <div className="flex justify-between items-center text-xs pt-1 text-slate-500">
                  <Input
                    size="small"
                    placeholder="Optional item details / brand notes..."
                    value={item.description}
                    onChange={(e) => handleItemFieldChange(idx, "description", e.target.value)}
                    className="max-w-md"
                  />
                  <div>
                    Subtotal:{" "}
                    <strong className="text-slate-800">
                      ₱{(item.estimated_total || 0).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="dashed"
              onClick={addItemRow}
              block
              icon={<PlusOutlined />}
              className="text-xs"
            >
              Add Another Line Item
            </Button>
          </div>

          {/* Budget Feasibility Summary */}
          <div className="bg-slate-100 p-3.5 rounded-lg border border-slate-200 mb-4 space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-700">Total Estimated Request Cost:</span>
              <span className="text-lg text-slate-900">
                ₱{totalEstimatedCost.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-600 pt-1 border-t border-slate-200">
              <span>Department Available Balance:</span>
              <span>₱{remaining.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-semibold pt-1 border-t border-slate-200">
              <span>Projected Balance After Request:</span>
              <span className={projectedBalance < 0 ? "text-rose-600" : "text-emerald-700"}>
                ₱{projectedBalance.toLocaleString()}
              </span>
            </div>

            {isExceedingBudget && (
              <Alert
                type="warning"
                showIcon
                message="Estimated Cost Exceeds Current Available Balance"
                description="Your estimated request exceeds the department's remaining allocation. The Finance Office will require budget re-allocation or item adjustments prior to final PO approval."
                className="text-xs mt-2"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              className="bg-purple-600 hover:bg-purple-700 font-semibold"
            >
              Submit Canvass Request (Notify VPASA)
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ==================== REQUEST DETAILS MODAL ==================== */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              Request Details: {activeRequest?.canvass_no}
            </span>
            <Tag color="purple">{activeRequest?.status}</Tag>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={750}
      >
        {activeRequest && (
          <div className="space-y-4 py-2">
            {/* Process Steps */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Procurement Pipeline Progress
              </div>
              <Steps
                size="small"
                current={
                  activeRequest.po_no
                    ? 4
                    : activeRequest.status === "Winning Bid Selected"
                    ? 3
                    : activeRequest.status === "Under Review"
                    ? 2
                    : activeRequest.status === "Seeking Bids"
                    ? 1
                    : 0
                }
                items={[
                  { title: "Submitted", description: "Pending Canvass" },
                  { title: "Canvassing", description: "VPASA Sourcing Quotes" },
                  { title: "Review", description: "Evaluating Bids" },
                  { title: "Finance", description: "Budget Clearance" },
                  { title: "PO Issued", description: activeRequest.po_no || "Purchase Order" },
                ]}
              />
            </div>

            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Request Title" span={2}>
                <span className="font-semibold text-slate-900">{activeRequest.title}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {activeRequest.department_name}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag>{activeRequest.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                <Tag color={activeRequest.priority === "Urgent" ? "red" : "blue"}>
                  {activeRequest.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Target Deadline">
                {activeRequest.deadline}
              </Descriptions.Item>
              <Descriptions.Item label="Justification" span={2}>
                <span className="text-slate-700 italic">
                  {activeRequest.justification || "No specific justification text recorded."}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Estimated Total" span={2}>
                <strong className="text-base text-slate-900">
                  ₱{Number(activeRequest.total_estimated_budget || 0).toLocaleString()}
                </strong>
              </Descriptions.Item>
            </Descriptions>

            {/* Requested Items Table */}
            <div>
              <div className="font-semibold text-xs text-slate-700 mb-2">
                Requested Line Items ({activeRequest.items?.length || 0})
              </div>
              <Table
                dataSource={activeRequest.items || []}
                size="small"
                pagination={false}
                rowKey={(r, i) => i}
                columns={[
                  {
                    title: "Item Name",
                    dataIndex: "item_name",
                    render: (text, r) => (
                      <div>
                        <div className="font-medium text-slate-800">{text}</div>
                        {r.description && (
                          <div className="text-[11px] text-slate-400">{r.description}</div>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: "Qty",
                    dataIndex: "quantity",
                    width: 70,
                    render: (q, r) => `${q} ${r.unit || "pcs"}`,
                  },
                  {
                    title: "Est. Unit Price",
                    dataIndex: "estimated_unit_cost",
                    render: (c) => `₱${Number(c || 0).toLocaleString()}`,
                  },
                  {
                    title: "Est. Total",
                    dataIndex: "total_estimated_cost",
                    render: (t) => (
                      <strong>₱{Number(t || 0).toLocaleString()}</strong>
                    ),
                  },
                ]}
              />
            </div>

            {/* Quotations Received so far */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span>Supplier Quotations Sourced by VPASA:</span>
                <span className="text-blue-600">
                  {activeRequest.supplier_bids?.length || 0} Quotations Received
                </span>
              </div>
              {activeRequest.supplier_bids?.length > 0 ? (
                <div className="space-y-1 mt-2">
                  {activeRequest.supplier_bids.map((b) => (
                    <div
                      key={b.id}
                      className="flex justify-between items-center text-xs bg-white p-2 rounded border border-slate-200"
                    >
                      <span className="font-medium text-slate-800">
                        {b.supplier_name}{" "}
                        {b.id === activeRequest.winning_bid_id && (
                          <Tag color="green" className="ml-1 text-[10px]">
                            Winning Proposal
                          </Tag>
                        )}
                      </span>
                      <strong className="text-slate-900">
                        ₱{Number(b.bid_amount || 0).toLocaleString()}
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic py-1">
                  VPASA has not yet recorded vendor quotations for this canvass.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Audit Trail Modal for Department */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined className="text-purple-600" />
            <span className="font-bold text-slate-800">
              Audit Trail — {auditTrailModalRecord?.pr_no || auditTrailModalRecord?.canvass_no || "Requisition"}
            </span>
          </div>
        }
        open={isAuditTrailModalOpen}
        onCancel={() => {
          setIsAuditTrailModalOpen(false);
          setAuditTrailModalRecord(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsAuditTrailModalOpen(false);
              setAuditTrailModalRecord(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={650}
      >
        <div className="py-2">
          <RequestTrailTimeline
            trail={auditTrailModalRecord?.trail || []}
            title={`Lifecycle Audit Trail: ${auditTrailModalRecord?.pr_no || auditTrailModalRecord?.title || "Transaction"}`}
          />
        </div>
      </Modal>
    </div>
  );
}
