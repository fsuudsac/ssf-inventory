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
  Table,
  Badge,
  Descriptions,
  Divider,
  App,
  Radio,
  Tooltip,
  Alert,
  Row,
  Col,
  Statistic,
  Progress,
  Popconfirm,
  Tabs,
} from "antd";
import {
  DollarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  EyeOutlined,
  FileDoneOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  SwapOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  FileTextOutlined,
  SearchOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import KanbanBoard, { StageTimerBadge } from "../../../common/KanbanBoard";
import EvidenceAttachmentTab from "../../../common/EvidenceAttachmentTab";
import KanbanTransitionModal from "../../../common/KanbanTransitionModal";
import RequestTrailTimeline from "../../../common/RequestTrailTimeline";
import { useProcurementRealtime } from "../../../providers/ProcurementRealtimeProvider";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export const FINANCE_COLUMNS = [
  {
    id: "Pending Finance Review",
    title: "Pending Finance Review",
    color: "#fa8c16",
    icon: <ClockCircleOutlinedWrapper />,
  },
  {
    id: "Over Budget (Needs Revision)",
    title: "Over Budget (Needs Revision)",
    color: "#ff4d4f",
    icon: <WarningOutlined />,
  },
  {
    id: "Finance Approved",
    title: "Finance Approved",
    color: "#52c41a",
    icon: <CheckCircleOutlined />,
  },
];

function ClockCircleOutlinedWrapper() {
  return <DollarOutlined style={{ color: "#fa8c16" }} />;
}

export default function PageFinanceApproval() {
  const { message, notification, modal } = App.useApp();
  const {
    unifiedRecords,
    financePendingRecords,
    approveFinance,
    requestRevisionFinance,
    departments: contextDepartments,
    refreshAll,
  } = useProcurementRealtime();

  const [reviews, setReviews] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [activeFinanceTab, setActiveFinanceTab] = useState("approval_view"); // "approval_view" | "canvasses" | "prs" | "finance_report"
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "table"
  const [filterDepartment, setFilterDepartment] = useState("all");

  // Financial Tracking & Encumbrance Report state
  const [reportSearchText, setReportSearchText] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("all");
  const [reportDepartmentFilter, setReportDepartmentFilter] = useState("all");
  const [auditTrailModalRecord, setAuditTrailModalRecord] = useState(null);
  const [isAuditTrailModalOpen, setIsAuditTrailModalOpen] = useState(false);

  // Approval View Revision Modal state
  const [revisionTarget, setRevisionTarget] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modals state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditItemsModalOpen, setIsEditItemsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  // Kanban Drag-and-Drop Confirmation Interception
  const [pendingTransition, setPendingTransition] = useState(null); // { item, sourceColId, targetColId, isApproval }
  const [transitionLoading, setTransitionLoading] = useState(false);

  // Edit items modal form & local state
  const [editingItems, setEditingItems] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(1);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [revRes, deptRes, whRes, prRes] = await Promise.all([
        axios.get("/api/finance/reviews"),
        axios.get("/api/departments"),
        axios.get("/api/warehouses"),
        axios.get("/api/purchase-requests"),
      ]);

      if (revRes.data?.data) {
        setReviews(revRes.data.data);
      }
      if (deptRes.data?.data) {
        setDepartments(deptRes.data.data);
      }
      if (whRes.data?.data) {
        setWarehouses(whRes.data.data);
      }
      if (prRes.data?.data) {
        setPurchaseRequests(prRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load finance reviews:", err);
      message.error("Failed to fetch finance review records.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePurchaseRequest = async (pr) => {
    const dept = departments.find((d) => d.id === pr.department_id);
    const remaining = dept ? (dept.remaining_balance ?? dept.budget_remaining ?? 0) : 0;
    if (pr.total_amount > remaining) {
      modal.error({
        title: "Budget Exceeded",
        content: `Cannot approve PR ${pr.pr_no}. Total amount ₱${pr.total_amount.toLocaleString()} exceeds department balance of ₱${remaining.toLocaleString()}. Deficit: ₱${(pr.total_amount - remaining).toLocaleString()}.`,
      });
      return;
    }

    try {
      const res = await axios.post(`/api/purchase-requests/${pr.id}/approve`, {
        approver_notes: "Approved by Finance Office. Budget encumbered.",
      });

      notification.success({
        message: "PR Approved & Budget Encumbered!",
        description: (
          <div className="space-y-1">
            <p>
              Purchase Request <strong>{pr.pr_no}</strong> has been cleared by Finance.
            </p>
            <p className="text-xs text-slate-600">
              Department funds of <strong>₱{pr.total_amount.toLocaleString()}</strong> moved to Encumbered.
              {res.data?.data?.purchaseOrder?.po_no && (
                <span className="block mt-1 font-semibold text-emerald-700">
                  Linked PO: {res.data.data.purchaseOrder.po_no} generated!
                </span>
              )}
            </p>
          </div>
        ),
        duration: 7,
      });

      fetchFinanceData();
    } catch (err) {
      console.error("PR approval error:", err);
      message.error(err.response?.data?.message || "Failed to approve Purchase Request.");
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  // Strictly filtered pending finance approval records from the Single Source of Truth
  const pendingPRList = useMemo(() => {
    let list = financePendingRecords;
    if (filterDepartment !== "all") {
      list = list.filter((r) => r.department_id === Number(filterDepartment));
    }
    return list;
  }, [financePendingRecords, filterDepartment]);

  const handleApprovePendingPR = (record) => {
    const dept = (contextDepartments?.length ? contextDepartments : departments).find(
      (d) => d.id === record.department_id
    );
    const remaining = dept ? (dept.remaining_balance ?? dept.budget_remaining ?? 0) : 0;
    const reqAmount = record.total_amount || record.total_estimated_budget || 0;

    modal.confirm({
      title: "Approve Budget & Advance to VPASA Authorization?",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      content: (
        <div className="space-y-2 py-1">
          <p>
            You are verifying the budget for <strong>{record.pr_no || record.title}</strong> based on the awarded quotation of{" "}
            <strong className="text-emerald-700">₱{reqAmount.toLocaleString()}</strong>.
          </p>
          <p className="text-xs text-slate-500">
            <strong>Stage 4 &rarr; Stage 5 Pipeline:</strong> Budget clearance sets status to <strong>'Finance Approved - Pending VPASA'</strong>. The requisition will advance to the VPASA view for final executive authorization before Purchase Order generation.
          </p>
          {dept && (
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
              <div>Department: <strong>{dept.name}</strong></div>
              <div>Remaining Budget: <strong>₱{remaining.toLocaleString()}</strong></div>
            </div>
          )}
        </div>
      ),
      okText: "Approve & Send to VPASA",
      okButtonProps: { className: "bg-emerald-600 hover:bg-emerald-700 text-white" },
      onOk: async () => {
        try {
          setActionLoadingId(record.id);
          await approveFinance(record.id, "Budget verified against awarded bid by Finance Officer");
          notification.success({
            message: "Finance Approval Granted!",
            description: `Purchase Request ${record.pr_no || record.title} is now 'Finance Approved - Pending VPASA' and awaiting executive authorization.`,
            duration: 5,
          });
        } catch (err) {
          message.error("Failed to approve request.");
        } finally {
          setActionLoadingId(null);
        }
      },
    });
  };

  const handleOpenRevisionModal = (record) => {
    setRevisionTarget(record);
    setRevisionNotes("");
  };

  const handleConfirmRevisionModal = async () => {
    if (!revisionTarget) return;
    if (!revisionNotes.trim()) {
      message.warning("Please provide revision remarks for the requesting department.");
      return;
    }
    try {
      setActionLoadingId(revisionTarget.id);
      await requestRevisionFinance(revisionTarget.id, revisionNotes);
      notification.warning({
        message: "Revision Requested",
        description: `Request ${revisionTarget.pr_no || revisionTarget.title} marked as 'Needs Revision' and returned to department.`,
        duration: 5,
      });
      setRevisionTarget(null);
      setRevisionNotes("");
    } catch (err) {
      message.error("Failed to request revision.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (filterDepartment === "all") return reviews;
    return reviews.filter((r) => r.department_id === Number(filterDepartment));
  }, [reviews, filterDepartment]);

  // Handle Drag and Drop status transitions - INTERCEPT WITH CONFIRMATION MODAL
  const handleCardDrop = (itemId, sourceColId, targetColId) => {
    if (sourceColId === targetColId) return;

    const canvassId = Number(itemId);
    const targetCanvass = reviews.find((r) => r.id === canvassId);
    if (!targetCanvass) return;

    if (targetColId === "Finance Approved") {
      // Validate budget before approving
      if (targetCanvass.is_over_budget) {
        modal.warning({
          title: "Cannot Approve: Proposal Over Budget",
          icon: <WarningOutlined style={{ color: "#ff4d4f" }} />,
          content: (
            <div className="space-y-2 py-2">
              <p>
                Canvass <strong>{targetCanvass.canvass_no}</strong> total (₱
                {targetCanvass.winning_bid_total?.toLocaleString()}) exceeds the
                department's remaining balance (₱
                {targetCanvass.department_remaining_balance?.toLocaleString()}) by{" "}
                <span className="font-semibold text-rose-600">
                  ₱{Math.abs(targetCanvass.variance || 0).toLocaleString()}
                </span>
                .
              </p>
              <Alert
                type="error"
                showIcon
                message="Adjustment Required"
                description="Please use the 'Edit Items' action to reduce item quantities or remove non-essential line items before final approval."
              />
            </div>
          ),
          okText: "I Understand",
        });
        return;
      }

      // Intercept drop event and display confirmation modal for approval
      setPendingTransition({
        item: targetCanvass,
        sourceColId,
        targetColId,
        isApproval: true,
      });
      return;
    }

    // Intercept drop event and display confirmation modal for status transition
    setPendingTransition({
      item: targetCanvass,
      sourceColId,
      targetColId,
      isApproval: false,
    });
  };

  // Called when user clicks "Accept" on confirmation modal
  const handleConfirmTransition = async (remarks = "") => {
    if (!pendingTransition) return;
    const { item, targetColId, isApproval } = pendingTransition;
    setTransitionLoading(true);

    if (isApproval) {
      try {
        const res = await axios.post(`/api/finance/reviews/${item.id}/approve`, {
          warehouse_id: selectedWarehouseId,
          remarks: remarks || undefined,
          performed_by: "Finance Director / Controller",
          role: "Finance Officer",
        });

        notification.success({
          message: "Budget Approved & PO Generated!",
          description: (
            <div className="space-y-1">
              <p>
                Proposal budget cleared! Purchase Order{" "}
                <strong>{res.data?.data?.purchaseOrder?.po_no}</strong> has been
                automatically generated and queued for fulfillment.
              </p>
              <p className="text-xs text-slate-500">
                Department balance successfully encumbered with all specifications
                carried forward.
              </p>
            </div>
          ),
          duration: 7,
        });

        setPendingTransition(null);
        fetchFinanceData();
      } catch (err) {
        console.error("Approval error:", err);
        modal.error({
          title: "Budget Approval Rejected",
          content: err.response?.data?.message || "Failed to approve budget.",
        });
        setPendingTransition(null);
        fetchFinanceData();
      } finally {
        setTransitionLoading(false);
      }
      return;
    }

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, finance_status: targetColId } : r))
    );

    try {
      await axios.patch(`/api/finance/reviews/${item.id}/status`, {
        status: targetColId,
        remarks: remarks || undefined,
        performed_by: "Finance Controller / Auditor",
        role: "Finance Officer",
      });
      message.success(`Status updated to "${targetColId}"`);
      setPendingTransition(null);
      fetchFinanceData();
    } catch (err) {
      console.error("Status update error:", err);
      message.error(err.response?.data?.message || "Failed to update status");
      setPendingTransition(null);
      fetchFinanceData();
    } finally {
      setTransitionLoading(false);
    }
  };

  // Called when user clicks "Cancel" on confirmation modal
  const handleCancelTransition = () => {
    // Closes modal without updating state or database; card snaps back to original column
    setPendingTransition(null);
  };

  // Quick Approve execution
  const executeApproval = async (canvassId, warehouseId) => {
    try {
      const res = await axios.post(`/api/finance/reviews/${canvassId}/approve`, {
        warehouse_id: warehouseId,
      });

      notification.success({
        message: "Budget Approved & PO Generated!",
        description: (
          <div className="space-y-1">
            <p>
              Proposal budget cleared! Purchase Order{" "}
              <strong>{res.data?.data?.purchaseOrder?.po_no}</strong> has been
              automatically generated and queued for fulfillment.
            </p>
            <p className="text-xs text-slate-500">
              Department balance successfully encumbered with all specifications
              carried forward.
            </p>
          </div>
        ),
        duration: 7,
      });

      setIsApproveModalOpen(false);
      setIsDetailModalOpen(false);
      fetchFinanceData();
    } catch (err) {
      console.error("Approval error:", err);
      modal.error({
        title: "Budget Approval Rejected",
        content: err.response?.data?.message || "Failed to approve budget.",
      });
    }
  };

  // Open "Edit Items" modal
  const openEditItemsModal = (canvass) => {
    setActiveItem(canvass);
    // Clone items
    const cloned = (canvass.items || []).map((it) => ({
      ...it,
      original_quantity: it.quantity,
      original_cost: it.estimated_unit_cost,
    }));
    setEditingItems(cloned);
    setIsEditItemsModalOpen(true);
  };

  // Handle local quantity/price change in Edit Items modal
  const handleItemFieldChange = (index, field, value) => {
    const updated = [...editingItems];
    updated[index] = {
      ...updated[index],
      [field]: Number(value) || 0,
      total_estimated_cost:
        field === "quantity"
          ? (Number(value) || 0) * (updated[index].estimated_unit_cost || 0)
          : (updated[index].quantity || 0) * (Number(value) || 0),
    };
    setEditingItems(updated);
  };

  // Remove line item from modal
  const handleRemoveLineItem = (index) => {
    const updated = editingItems.filter((_, idx) => idx !== index);
    setEditingItems(updated);
  };

  // Calculate new total in modal
  const calculatedNewTotal = useMemo(() => {
    return editingItems.reduce(
      (sum, it) => sum + (Number(it.total_estimated_cost) || 0),
      0
    );
  }, [editingItems]);

  const activeDept = useMemo(() => {
    if (!activeItem) return null;
    return departments.find((d) => d.id === activeItem.department_id);
  }, [activeItem, departments]);

  const remainingBalance = activeDept?.remaining_balance || 0;
  const newVariance = remainingBalance - calculatedNewTotal;
  const isNowWithinBudget = calculatedNewTotal <= remainingBalance;

  // Save item edits to backend
  const saveEditedItems = async () => {
    if (!activeItem) return;
    try {
      const res = await axios.put(`/api/canvasses/${activeItem.id}/items`, {
        items: editingItems,
      });

      message.success(res.data?.message || "Items updated successfully!");
      setIsEditItemsModalOpen(false);
      fetchFinanceData();

      // If active modal is also open, update activeItem
      if (res.data?.data) {
        setActiveItem((prev) => ({
          ...prev,
          ...res.data.data,
          winning_bid_total: res.data.data.total_estimated_budget,
          is_over_budget: res.data.data.total_estimated_budget > remainingBalance,
          variance: remainingBalance - res.data.data.total_estimated_budget,
        }));
      }
    } catch (err) {
      console.error("Failed to save edited items:", err);
      message.error(err.response?.data?.message || "Failed to update items");
    }
  };

  // KPI Statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    const overBudgetCount = reviews.filter(
      (r) => r.finance_status === "Over Budget (Needs Revision)" || r.is_over_budget
    ).length;
    const pendingTotalAmount = reviews
      .filter((r) => r.finance_status === "Pending Finance Review")
      .reduce((sum, r) => sum + (r.winning_bid_total || 0), 0);
    const approvedTotalAmount = reviews
      .filter((r) => r.finance_status === "Finance Approved")
      .reduce((sum, r) => sum + (r.winning_bid_total || 0), 0);

    return {
      total,
      overBudgetCount,
      pendingTotalAmount,
      approvedTotalAmount,
    };
  }, [reviews]);

  // Financial Tracking & Encumbrance Report Memo
  const financeReportRecords = useMemo(() => {
    const validFinanceStages = [
      "Pending Finance Approval",
      "Finance Approved - Pending VPASA",
      "Finance Approved",
      "Ready for PO",
      "PO Issued",
      "Purchase Order Issued",
      "Sent to Supplier",
      "In Transit",
      "Partially Received",
      "Fully Received",
      "Approved PR",
    ];

    let source = (unifiedRecords && unifiedRecords.length > 0) ? unifiedRecords : purchaseRequests;

    let records = source.filter((r) => {
      return (
        validFinanceStages.includes(r.status) ||
        r.finance_status === "Finance Approved" ||
        Boolean(r.finance_approved_at)
      );
    });

    if (reportStatusFilter !== "all") {
      records = records.filter((r) => r.status === reportStatusFilter);
    }

    if (reportDepartmentFilter !== "all") {
      records = records.filter(
        (r) =>
          r.department_id === Number(reportDepartmentFilter) ||
          r.department_name === reportDepartmentFilter
      );
    }

    if (reportSearchText.trim()) {
      const q = reportSearchText.toLowerCase();
      records = records.filter(
        (r) =>
          (r.pr_no && r.pr_no.toLowerCase().includes(q)) ||
          (r.canvass_no && r.canvass_no.toLowerCase().includes(q)) ||
          (r.department_name && r.department_name.toLowerCase().includes(q)) ||
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.purpose && r.purpose.toLowerCase().includes(q)) ||
          (r.fund_source && r.fund_source.toLowerCase().includes(q)) ||
          (r.winning_supplier && r.winning_supplier.toLowerCase().includes(q))
      );
    }

    return records;
  }, [unifiedRecords, purchaseRequests, reportStatusFilter, reportDepartmentFilter, reportSearchText]);

  // Statistics for Financial Tracking & Encumbrance Report
  const totalEncumberedYTD = useMemo(() => {
    return financeReportRecords
      .filter((r) => r.status !== "Pending Finance Approval" && r.status !== "Needs Revision")
      .reduce(
        (sum, r) =>
          sum +
          Number(r.winning_bid_amount || r.total_amount || r.total_estimated_budget || 0),
        0
      );
  }, [financeReportRecords]);

  const pendingClearanceCount = useMemo(() => {
    return financeReportRecords.filter((r) => r.status === "Pending Finance Approval").length;
  }, [financeReportRecords]);

  const pendingClearanceValue = useMemo(() => {
    return financeReportRecords
      .filter((r) => r.status === "Pending Finance Approval")
      .reduce(
        (sum, r) =>
          sum +
          Number(r.winning_bid_amount || r.total_amount || r.total_estimated_budget || 0),
        0
      );
  }, [financeReportRecords]);

  // CSV Export for Finance Report
  const handleExportFinanceCSV = () => {
    try {
      const headers = [
        "PR Number",
        "Department",
        "Account / Fund",
        "Requested Amount (PHP)",
        "Encumbered Amount (PHP)",
        "Date Approved",
        "Status",
      ];
      const rows = financeReportRecords.map((r) => [
        `"${r.pr_no || r.canvass_no || `PR-${r.id}`}"`,
        `"${r.department_name || ""}"`,
        `"${r.fund_source || `${r.department_name || "General"} FY-2026 Allocation`}"`,
        `"${Number(r.total_estimated_budget || r.total_amount || 0).toFixed(2)}"`,
        `"${Number(r.winning_bid_amount || r.total_amount || r.total_estimated_budget || 0).toFixed(2)}"`,
        `"${r.finance_approved_at ? r.finance_approved_at.slice(0, 10) : (r.status !== "Pending Finance Approval" ? "Approved" : "Pending")}"`,
        `"${r.status || ""}"`,
      ]);
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `Finance_Encumbrance_Report_${dayjs().format("YYYYMMDD_HHmmss")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success("Financial tracking & encumbrance report exported to CSV successfully.");
    } catch (err) {
      console.error("Export error:", err);
      message.error("Failed to generate financial export.");
    }
  };

  // Columns for the Financial Tracking & Encumbrance Report
  const financeReportColumns = [
    {
      title: "PR Number",
      key: "pr_no",
      width: 140,
      render: (_, r) => (
        <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          {r.pr_no || r.canvass_no || `PR-${r.id}`}
        </span>
      ),
    },
    {
      title: "Department",
      dataIndex: "department_name",
      key: "department_name",
      render: (dept) => (
        <div className="flex items-center gap-1.5 font-medium text-slate-800">
          <BankOutlined className="text-amber-600" />
          <span>{dept || "General Services"}</span>
        </div>
      ),
    },
    {
      title: "Account / Fund",
      key: "fund_source",
      render: (_, r) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">
            {r.fund_source || `${r.department_name || "General"} Operating Budget`}
          </div>
          <div className="text-[11px] text-slate-400">
            Fund Code: FY-2026-OP-{r.department_id || 101}
          </div>
        </div>
      ),
    },
    {
      title: "Requested Amount",
      key: "requested_amount",
      width: 150,
      render: (_, r) => {
        const val = Number(r.total_estimated_budget || r.total_amount || 0);
        return (
          <span className="text-slate-700 font-medium text-xs">
            ₱{val.toLocaleString()}
          </span>
        );
      },
    },
    {
      title: "Encumbered Amount",
      key: "encumbered_amount",
      width: 160,
      render: (_, r) => {
        const val = Number(
          r.winning_bid_amount || r.total_amount || r.total_estimated_budget || 0
        );
        const isEncumbered = r.status !== "Pending Finance Approval";
        return (
          <span
            className={`font-bold text-sm ${
              isEncumbered ? "text-emerald-700" : "text-amber-600"
            }`}
          >
            ₱{val.toLocaleString()}
          </span>
        );
      },
    },
    {
      title: "Date Approved",
      key: "date_approved",
      width: 150,
      render: (_, r) => {
        if (r.finance_approved_at) {
          return (
            <span className="text-xs text-slate-700 font-medium">
              {r.finance_approved_at.slice(0, 10)}
            </span>
          );
        }
        if (r.status !== "Pending Finance Approval") {
          return (
            <span className="text-xs text-slate-700 font-medium">
              {r.updated_at ? r.updated_at.slice(0, 10) : "Approved"}
            </span>
          );
        }
        return <span className="text-xs text-slate-400 italic">Pending Clearance</span>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 170,
      render: (status) => {
        let color = "default";
        if (status === "Pending Finance Approval" || status === "Pending Finance Review") {
          color = "orange";
        } else if (status === "Finance Approved - Pending VPASA") {
          color = "lime";
        } else if (status === "Finance Approved" || status === "Approved PR") {
          color = "green";
        } else if (status === "Ready for PO") {
          color = "cyan";
        } else if (status === "PO Issued" || status === "Purchase Order Issued") {
          color = "geekblue";
        } else if (status === "Sent to Supplier" || status === "In Transit") {
          color = "blue";
        } else if (status === "Fully Received") {
          color = "success";
        }
        return (
          <Tag color={color} className="font-semibold text-xs">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 170,
      render: (_, r) => (
        <Space size="small">
          <Button
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => {
              setAuditTrailModalRecord(r);
              setIsAuditTrailModalOpen(true);
            }}
          >
            Audit Trail
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setActiveItem(r);
              setIsDetailModalOpen(true);
            }}
          >
            Review
          </Button>
        </Space>
      ),
    },
  ];

  // Custom renderer for Kanban cards
  const renderCardContent = (item) => {
    const isOverBudget =
      item.finance_status === "Over Budget (Needs Revision)" || item.is_over_budget;
    const isApproved = item.finance_status === "Finance Approved";

    const budgetPercent = Math.min(
      100,
      Math.round(
        ((item.department_utilized_amount || 0) /
          (item.department_allocated_amount || 1)) *
          100
      )
    );

    return (
      <div className="space-y-3">
        {/* Proposal Header */}
        <div className="flex justify-between items-start gap-1">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {item.canvass_no}
              </span>
              <StageTimerBadge
                entryTimestamp={item.stage_entered_at || item.updated_at || item.created_at}
                currentStage={item.finance_status}
                thresholdDays={3}
                history={{
                  canvass_started_at: item.canvass_started_at,
                  pr_submitted_at: item.pr_submitted_at,
                  finance_approved_at: item.finance_approved_at,
                  po_dispatched_at: item.po_dispatched_at,
                  items_received_at: item.items_received_at,
                }}
              />
            </div>
            <h4 className="font-semibold text-sm text-slate-900 mt-1 line-clamp-1">
              {item.title}
            </h4>
          </div>
          <Tag
            color={
              item.priority === "Urgent"
                ? "error"
                : item.priority === "High"
                ? "warning"
                : "blue"
            }
          >
            {item.priority}
          </Tag>
        </div>

        {/* Department Info */}
        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between font-medium text-slate-700">
            <span>
              <BankOutlined className="mr-1 text-slate-400" />
              {item.department_name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[11px] pt-1 border-t border-slate-200">
            <div>
              <span className="text-slate-400 block">Remaining:</span>
              <strong className="text-slate-700">
                ₱{item.department_remaining_balance?.toLocaleString()}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Requested:</span>
              <strong
                className={isOverBudget ? "text-rose-600 font-bold" : "text-emerald-700"}
              >
                ₱{item.winning_bid_total?.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Over Budget Banner / Status Badge */}
        {isOverBudget && (
          <div className="bg-rose-50 border border-rose-200 rounded p-2 text-xs flex items-center justify-between text-rose-700">
            <div className="flex items-center space-x-1.5">
              <WarningOutlined className="text-rose-500 text-sm" />
              <span>
                <strong>Deficit:</strong> ₱
                {Math.abs(item.variance || 0).toLocaleString()}
              </span>
            </div>
            <Tag color="red" className="mr-0 font-medium">
              Needs Revision
            </Tag>
          </div>
        )}

        {isApproved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-xs flex items-center justify-between text-emerald-800">
            <div className="flex items-center space-x-1.5">
              <CheckCircleOutlined className="text-emerald-600 text-sm" />
              <span>
                <strong>PO Generated:</strong> {item.po_no || "PO Assigned"}
              </span>
            </div>
            <Tag color="green" className="mr-0">
              Encumbered
            </Tag>
          </div>
        )}

        {/* Card Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setActiveItem(item);
              setIsDetailModalOpen(true);
            }}
          >
            Review
          </Button>

          <Space orientation="horizontal" size="small">
            {isOverBudget && (
              <Button
                size="small"
                danger
                type="primary"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  openEditItemsModal(item);
                }}
              >
                Edit Items
              </Button>
            )}

            {!isApproved && !isOverBudget && (
              <Button
                size="small"
                type="primary"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                icon={<SafetyCertificateOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveItem(item);
                  setIsApproveModalOpen(true);
                }}
              >
                Approve
              </Button>
            )}
          </Space>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-200">
              <DollarOutlined className="text-2xl" />
            </div>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Finance Budget Approval
              </Title>
              <Text type="secondary" className="text-sm">
                Strict Sequential Pipeline: Validates winning vendor quotations
                against Department Budget allocations before PO issuance.
              </Text>
            </div>
          </div>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex items-center space-x-3">
          <Select
            value={filterDepartment}
            onChange={setFilterDepartment}
            style={{ width: 220 }}
            placeholder="Filter by Department"
          >
            <Option value="all">All Departments</Option>
            {departments.map((d) => (
              <Option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </Option>
            ))}
          </Select>

          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="kanban">
              <AppstoreOutlined className="mr-1" />
              Kanban
            </Radio.Button>
            <Radio.Button value="table">
              <UnorderedListOutlined className="mr-1" />
              Table
            </Radio.Button>
          </Radio.Group>
        </div>
      </div>

      {/* KPI Metrics Ribbon */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-slate-200 shadow-sm rounded-lg">
            <Statistic
              title={<span className="text-xs text-slate-500 font-medium">TOTAL PROPOSALS</span>}
              value={stats.total}
              prefix={<DollarOutlined className="text-blue-500 mr-2" />}
            />
            <div className="text-xs text-slate-400 mt-2">
              Across all academic and support units
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-slate-200 shadow-sm rounded-lg bg-rose-50/50">
            <Statistic
              title={<span className="text-xs text-rose-600 font-semibold">OVER BUDGET (NEEDS REVISION)</span>}
              value={stats.overBudgetCount}
              valueStyle={{ color: "#cf1322" }}
              prefix={<WarningOutlined className="text-rose-600 mr-2" />}
            />
            <div className="text-xs text-rose-600/80 mt-2">
              Must adjust line items or quantities
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-slate-200 shadow-sm rounded-lg">
            <Statistic
              title={<span className="text-xs text-slate-500 font-medium">PENDING APPROVAL TOTAL</span>}
              value={stats.pendingTotalAmount}
              precision={2}
              prefix={<span className="text-amber-500 mr-1 font-semibold">₱</span>}
            />
            <div className="text-xs text-slate-400 mt-2">
              Awaiting final finance clearance
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-slate-200 shadow-sm rounded-lg bg-emerald-50/40">
            <Statistic
              title={<span className="text-xs text-emerald-700 font-medium">APPROVED & ENCUMBERED</span>}
              value={stats.approvedTotalAmount}
              precision={2}
              valueStyle={{ color: "#389e0d" }}
              prefix={<span className="text-emerald-600 mr-1 font-semibold">₱</span>}
            />
            <div className="text-xs text-emerald-700/80 mt-2">
              Converted to official Purchase Orders
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabs: Approval View (Pending Finance Approval) vs Canvasses (PO Gatekeeper) vs Purchase Requests */}
      <Tabs
        activeKey={activeFinanceTab}
        onChange={setActiveFinanceTab}
        type="card"
        className="bg-transparent"
        items={[
          {
            key: "approval_view",
            label: (
              <span className="font-semibold px-2 flex items-center gap-2">
                <SafetyCertificateOutlined className="text-amber-500" />
                <span>Approval View (Pending Finance Approval)</span>
                <Badge
                  count={pendingPRList.length}
                  style={{ backgroundColor: "#f59e0b" }}
                  overflowCount={99}
                />
              </span>
            ),
            children: (
              <div className="space-y-4">
                <Alert
                  type="info"
                  showIcon
                  className="rounded-lg border-amber-200 bg-amber-50/80 text-amber-900"
                  message={
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span>
                        <strong>Strict Pipeline Filter:</strong> ONLY shows records where status ==={" "}
                        <Tag color="orange" className="font-semibold">Pending Finance Approval</Tag>. Approving instantly sets status to{" "}
                        <Tag color="blue" className="font-semibold">Ready for Canvass</Tag> (which automatically removes it from the Finance view and routes it to Canvassing).
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {pendingPRList.length} request(s) awaiting approval
                      </span>
                    </div>
                  }
                />

                {pendingPRList.length === 0 ? (
                  <Card className="rounded-xl border border-slate-200 p-12 text-center shadow-sm bg-white">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
                      <CheckCircleOutlined style={{ fontSize: 32 }} />
                    </div>
                    <Title level={4} className="text-slate-800">
                      All Caught Up!
                    </Title>
                    <Paragraph className="text-slate-500 max-w-md mx-auto">
                      There are currently no purchase requests waiting for finance review. All submitted requisitions have been approved or revised. New requests submitted by departments will appear here in real-time.
                    </Paragraph>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingPRList.map((pr) => {
                      const dept = (contextDepartments?.length ? contextDepartments : departments).find(
                        (d) => d.id === pr.department_id
                      );
                      const remaining = dept ? (dept.remaining_balance ?? dept.budget_remaining ?? 0) : 0;
                      const reqAmount = pr.total_amount || pr.total_estimated_budget || 0;
                      const isOverDeptBudget = remaining > 0 && reqAmount > remaining;

                      return (
                        <Card
                          key={pr.id}
                          className="rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between"
                          styles={{ body: { padding: "16px", display: "flex", flexDirection: "column", height: "100%" } }}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {pr.pr_no || `PR-${pr.id}`}
                              </span>
                              <Tag color={pr.priority === "Urgent" ? "red" : pr.priority === "High" ? "orange" : "blue"}>
                                {pr.priority || "Normal"}
                              </Tag>
                            </div>

                            <h4 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2">
                              {pr.title || pr.purpose || "Purchase Request"}
                            </h4>

                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1.5 mb-3">
                              <div className="flex items-center justify-between text-slate-600">
                                <span className="font-medium">{pr.department_name}</span>
                                <span className="text-slate-400">By: {pr.requested_by}</span>
                              </div>
                              <div className="pt-1.5 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                                <div>
                                  <span className="text-slate-400 block">Remaining Balance:</span>
                                  <strong className={isOverDeptBudget ? "text-red-600" : "text-slate-700"}>
                                    ₱{remaining.toLocaleString()}
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">Requested Amount:</span>
                                  <strong className="text-emerald-700 font-bold">
                                    ₱{reqAmount.toLocaleString()}
                                  </strong>
                                </div>
                              </div>
                            </div>

                            {pr.items && pr.items.length > 0 && (
                              <div className="text-xs text-slate-500 mb-3">
                                <span className="font-semibold text-slate-700 block mb-1">Items ({pr.items.length}):</span>
                                <div className="space-y-0.5 max-h-24 overflow-y-auto">
                                  {pr.items.slice(0, 3).map((it, idx) => (
                                    <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                                      <span className="truncate max-w-[160px]">• {it.item_name}</span>
                                      <span>{it.quantity} {it.unit || "pcs"}</span>
                                    </div>
                                  ))}
                                  {pr.items.length > 3 && (
                                    <div className="text-[10px] text-slate-400 italic">
                                      + {pr.items.length - 3} more line item(s)
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {isOverDeptBudget && (
                              <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700 flex items-center gap-1.5 mb-3">
                                <WarningOutlined className="text-red-500 flex-shrink-0" />
                                <span>Requested budget exceeds available remaining department balance!</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-auto">
                            <Button
                              size="small"
                              danger
                              icon={<WarningOutlined />}
                              loading={actionLoadingId === pr.id}
                              onClick={() => handleOpenRevisionModal(pr)}
                            >
                              Needs Revision
                            </Button>
                            <Button
                              size="small"
                              type="primary"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              icon={<CheckCircleOutlined />}
                              loading={actionLoadingId === pr.id}
                              onClick={() => handleApprovePendingPR(pr)}
                            >
                              Approve
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "canvasses",
            label: (
              <span className="font-semibold px-2">
                <DollarOutlined className="mr-1 text-amber-600" />
                Winning Bid Canvasses (PO Gatekeeper)
              </span>
            ),
            children: (
              viewMode === "kanban" ? (
                <Card className="border-slate-200 shadow-sm rounded-xl">
                  <div className="mb-4 flex items-center justify-between text-xs text-slate-500 bg-amber-50/60 p-3 rounded-lg border border-amber-200/60">
                    <div className="flex items-center space-x-2">
                      <BankOutlined className="text-amber-600" />
                      <span>
                        <strong>Finance Budget Gatekeeper:</strong> Proposals in{" "}
                        <Tag color="red">Over Budget (Needs Revision)</Tag> cannot be approved
                        until item quantities or specifications are revised within department balance.
                      </span>
                    </div>
                    <span className="font-medium text-slate-600">
                      Drag cards between columns or use quick actions
                    </span>
                  </div>

                  <KanbanBoard
                    columns={FINANCE_COLUMNS}
                    items={filteredReviews.map((r) => ({
                      ...r,
                      status: r.finance_status || "Pending Finance Review",
                    }))}
                    onCardDrop={handleCardDrop}
                    renderCard={renderCardContent}
                  />
                </Card>
              ) : (
                <Card className="border-slate-200 shadow-sm rounded-xl">
                  <Table
                    dataSource={filteredReviews}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    columns={[
                      {
                        title: "RFQ / Proposal",
                        key: "canvass_no",
                        render: (_, r) => (
                          <div>
                            <span className="font-mono font-semibold text-blue-700">
                              {r.canvass_no}
                            </span>
                            <div className="font-medium text-slate-800 text-sm">
                              {r.title}
                            </div>
                          </div>
                        ),
                      },
                      {
                        title: "Department",
                        dataIndex: "department_name",
                        key: "department_name",
                      },
                      {
                        title: "Dept. Balance",
                        key: "balance",
                        render: (_, r) => (
                          <div>
                            <div className="text-xs text-slate-500">
                              Allocated: ₱{r.department_allocated_amount?.toLocaleString()}
                            </div>
                            <div className="font-semibold text-slate-700">
                              Remaining: ₱{r.department_remaining_balance?.toLocaleString()}
                            </div>
                          </div>
                        ),
                      },
                      {
                        title: "Winning Bid Total",
                        key: "total",
                        render: (_, r) => (
                          <span
                            className={`font-semibold text-base ${
                              r.is_over_budget ? "text-rose-600 font-bold" : "text-emerald-700"
                            }`}
                          >
                            ₱{r.winning_bid_total?.toLocaleString()}
                          </span>
                        ),
                      },
                      {
                        title: "Finance Status",
                        dataIndex: "finance_status",
                        key: "finance_status",
                        render: (status, r) => {
                          if (status === "Over Budget (Needs Revision)" || r.is_over_budget) {
                            return (
                              <Tag color="red" icon={<WarningOutlined />}>
                                Over Budget
                              </Tag>
                            );
                          }
                          if (status === "Finance Approved") {
                            return (
                              <Tag color="green" icon={<CheckCircleOutlined />}>
                                Finance Approved
                              </Tag>
                            );
                          }
                          return (
                            <Tag color="orange" icon={<DollarOutlined />}>
                              Pending Review
                            </Tag>
                          );
                        },
                      },
                      {
                        title: "Actions",
                        key: "actions",
                        render: (_, r) => (
                          <Space orientation="horizontal">
                            <Button
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => {
                                setActiveItem(r);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              Review
                            </Button>
                            {(r.is_over_budget ||
                              r.finance_status === "Over Budget (Needs Revision)") && (
                              <Button
                                size="small"
                                danger
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => openEditItemsModal(r)}
                              >
                                Edit Items
                              </Button>
                            )}
                            {r.finance_status !== "Finance Approved" && !r.is_over_budget && (
                              <Button
                                size="small"
                                type="primary"
                                className="bg-emerald-600 text-white"
                                icon={<SafetyCertificateOutlined />}
                                onClick={() => {
                                  setActiveItem(r);
                                  setIsApproveModalOpen(true);
                                }}
                              >
                                Approve
                              </Button>
                            )}
                          </Space>
                        ),
                      },
                    ]}
                  />
                </Card>
              )
            ),
          },
          {
            key: "prs",
            label: (
              <span className="font-semibold px-2">
                <SafetyCertificateOutlined className="mr-1 text-blue-600" />
                Purchase Requests ({purchaseRequests.filter((p) => p.status !== "Approved PR").length} Pending)
              </span>
            ),
            children: (
              <Card className="border-slate-200 shadow-sm rounded-xl">
                <div className="mb-4 flex items-center justify-between text-xs text-slate-500 bg-blue-50/60 p-3 rounded-lg border border-blue-200/60">
                  <div className="flex items-center space-x-2">
                    <SafetyCertificateOutlined className="text-blue-600" />
                    <span>
                      <strong>Purchase Request Clearance:</strong> Approving a Purchase Request moves the funds from{" "}
                      <strong>Allocated</strong> to <strong>Encumbered</strong> in the department budget and automatically generates a Purchase Order.
                    </span>
                  </div>
                </div>

                <Table
                  dataSource={
                    filterDepartment === "all"
                      ? purchaseRequests
                      : purchaseRequests.filter((p) => p.department_id === Number(filterDepartment))
                  }
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 8 }}
                  columns={[
                    {
                      title: "PR Number",
                      dataIndex: "pr_no",
                      key: "pr_no",
                      render: (text) => <span className="font-mono font-semibold text-slate-800">{text}</span>,
                    },
                    {
                      title: "Title & Purpose",
                      dataIndex: "purpose",
                      key: "purpose",
                      render: (text, r) => (
                        <div>
                          <div className="font-semibold text-slate-900">{r.title || text}</div>
                          {r.justification && (
                            <div className="text-xs text-slate-500 italic line-clamp-1">{r.justification}</div>
                          )}
                          <div className="text-[11px] text-slate-400">Date: {r.request_date}</div>
                        </div>
                      ),
                    },
                    {
                      title: "Department",
                      dataIndex: "department_name",
                      key: "department_name",
                    },
                    {
                      title: "Items",
                      dataIndex: "items",
                      key: "items",
                      render: (items) => (
                        <span className="text-xs text-slate-600 font-medium">
                          {items?.length || 0} items
                        </span>
                      ),
                    },
                    {
                      title: "Total Amount",
                      dataIndex: "total_amount",
                      key: "total_amount",
                      render: (val) => (
                        <strong className="text-slate-900">₱{Number(val || 0).toLocaleString()}</strong>
                      ),
                    },
                    {
                      title: "Department Budget",
                      key: "dept_budget",
                      render: (_, r) => {
                        const dept = departments.find((d) => d.id === r.department_id);
                        const rem = dept ? (dept.remaining_balance ?? dept.budget_remaining ?? 0) : 0;
                        const isOver = (r.total_amount || 0) > rem;
                        return (
                          <div className="text-xs">
                            <span className="text-slate-500 block">Available: ₱{rem.toLocaleString()}</span>
                            {isOver ? (
                              <Tag color="red" className="mt-1">
                                Deficit: ₱{((r.total_amount || 0) - rem).toLocaleString()}
                              </Tag>
                            ) : (
                              <Tag color="green" className="mt-1">
                                Within Budget
                              </Tag>
                            )}
                          </div>
                        );
                      },
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      key: "status",
                      render: (status, r) => {
                        if (status === "Approved PR" || r.po_no) {
                          return (
                            <Space direction="vertical" size={2}>
                              <Tag color="green">Approved PR</Tag>
                              {r.po_no && <Tag color="cyan" className="font-mono text-[10px]">PO: {r.po_no}</Tag>}
                            </Space>
                          );
                        }
                        if (status === "Rejected") {
                          return <Tag color="red">Rejected</Tag>;
                        }
                        return <Tag color="orange">{status}</Tag>;
                      },
                    },
                    {
                      title: "Action",
                      key: "action",
                      render: (_, r) => {
                        const isApproved = r.status === "Approved PR" || !!r.po_no;
                        return (
                          <Space>
                            {!isApproved ? (
                              <Button
                                size="small"
                                type="primary"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                icon={<SafetyCertificateOutlined />}
                                onClick={() => handleApprovePurchaseRequest(r)}
                              >
                                Approve PR & Encumber
                              </Button>
                            ) : (
                              <Tag color="default" className="text-xs">
                                Cleared
                              </Tag>
                            )}
                          </Space>
                        );
                      },
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "finance_report",
            label: (
              <span className="font-semibold px-2 flex items-center gap-2">
                <FileTextOutlined className="text-emerald-600" />
                <span>Financial Tracking & Encumbrance Report</span>
                <Badge
                  count={financeReportRecords.length}
                  style={{ backgroundColor: "#059669" }}
                  overflowCount={999}
                />
              </span>
            ),
            children: (
              <div className="space-y-4">
                {/* Summary Statistics Cards */}
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={8}>
                    <Card className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-xs">
                      <Statistic
                        title={
                          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                            <DollarOutlined className="text-emerald-600" />
                            Total Encumbered (YTD)
                          </span>
                        }
                        value={totalEncumberedYTD}
                        precision={2}
                        valueStyle={{ color: "#047857", fontWeight: 700 }}
                        prefix={<span className="text-emerald-600 mr-0.5">₱</span>}
                      />
                      <div className="text-xs text-emerald-700/80 mt-1">
                        Total funds encumbered and committed across approved requisitions
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={8}>
                    <Card className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-xs">
                      <Statistic
                        title={
                          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                            <ClockCircleOutlined className="text-amber-600" />
                            Pending Clearance
                          </span>
                        }
                        value={pendingClearanceCount}
                        suffix={<span className="text-xs text-amber-600 font-normal">Requisitions</span>}
                        valueStyle={{ color: "#b45309", fontWeight: 700 }}
                      />
                      <div className="text-xs text-amber-700/80 mt-1">
                        Value: <strong>₱{pendingClearanceValue.toLocaleString()}</strong> awaiting budget review
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={8}>
                    <Card className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-xs">
                      <Statistic
                        title={
                          <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                            <SafetyCertificateOutlined className="text-blue-600" />
                            Financial Clearance Rate
                          </span>
                        }
                        value={
                          financeReportRecords.length > 0
                            ? Math.round(
                                ((financeReportRecords.length - pendingClearanceCount) /
                                  financeReportRecords.length) *
                                  100
                              )
                            : 100
                        }
                        suffix="%"
                        valueStyle={{ color: "#1d4ed8", fontWeight: 700 }}
                      />
                      <div className="text-xs text-blue-700/80 mt-1">
                        {financeReportRecords.length - pendingClearanceCount} of {financeReportRecords.length} records processed
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* Filter and Control Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Input
                      placeholder="Search PR No, Dept, Fund, or Vendor..."
                      prefix={<SearchOutlined className="text-slate-400" />}
                      value={reportSearchText}
                      onChange={(e) => setReportSearchText(e.target.value)}
                      style={{ width: 280 }}
                      allowClear
                    />

                    <Select
                      value={reportDepartmentFilter}
                      onChange={setReportDepartmentFilter}
                      style={{ width: 200 }}
                      placeholder="Department"
                    >
                      <Option value="all">All Departments</Option>
                      {(contextDepartments?.length ? contextDepartments : departments).map((d) => (
                        <Option key={d.id} value={d.id}>
                          {d.name}
                        </Option>
                      ))}
                    </Select>

                    <Select
                      value={reportStatusFilter}
                      onChange={setReportStatusFilter}
                      style={{ width: 230 }}
                      placeholder="Pipeline Stage"
                    >
                      <Option value="all">All Financial Stages</Option>
                      <Option value="Pending Finance Approval">Pending Finance Approval</Option>
                      <Option value="Finance Approved - Pending VPASA">
                        Finance Approved - Pending VPASA
                      </Option>
                      <Option value="Finance Approved">Finance Approved</Option>
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
                      onClick={handleExportFinanceCSV}
                    >
                      Export to CSV
                    </Button>
                  </div>
                </div>

                {/* Data Table */}
                <Card className="rounded-xl border border-slate-200 shadow-xs bg-white">
                  <Table
                    dataSource={financeReportRecords}
                    columns={financeReportColumns}
                    rowKey={(r) => r.id || r.pr_no || Math.random()}
                    pagination={{ pageSize: 8, showSizeChanger: true }}
                    locale={{ emptyText: "No financial records matching the selected criteria." }}
                  />
                </Card>
              </div>
            ),
          },
        ]}
      />

      {/* Review Proposal Detail Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <DollarOutlined className="text-amber-600" />
            <span>Finance Budget Clearance Review: {activeItem?.canvass_no}</span>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>,
          (activeItem?.is_over_budget ||
            activeItem?.finance_status === "Over Budget (Needs Revision)") && (
            <Button
              key="edit"
              danger
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setIsDetailModalOpen(false);
                openEditItemsModal(activeItem);
              }}
            >
              Adjust / Edit Items
            </Button>
          ),
          activeItem?.finance_status !== "Finance Approved" &&
            !activeItem?.is_over_budget && (
              <Button
                key="approve"
                type="primary"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                icon={<SafetyCertificateOutlined />}
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsApproveModalOpen(true);
                }}
              >
                Approve Budget & Generate PO
              </Button>
            ),
        ]}
      >
        {activeItem && (
          <div className="space-y-5">
            {/* Over Budget Notice */}
            {activeItem.is_over_budget && (
              <Alert
                type="error"
                showIcon
                message="Budget Limit Exceeded"
                description={
                  <div>
                    This proposal total of{" "}
                    <strong>₱{activeItem.winning_bid_total?.toLocaleString()}</strong>{" "}
                    exceeds {activeItem.department_name}'s remaining balance of{" "}
                    <strong>
                      ₱{activeItem.department_remaining_balance?.toLocaleString()}
                    </strong>{" "}
                    by{" "}
                    <span className="font-bold text-rose-700">
                      ₱{Math.abs(activeItem.variance || 0).toLocaleString()}
                    </span>
                    . Click <strong>"Adjust / Edit Items"</strong> below to trim
                    quantities before budget clearance can be granted.
                  </div>
                }
              />
            )}

            {/* Department Budget Health Cards */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Department Budget Real-Time Status
              </h4>
              <Row gutter={16}>
                <Col span={6}>
                  <div className="text-xs text-slate-500">Allocated Budget</div>
                  <div className="text-base font-bold text-slate-800">
                    ₱{activeItem.department_allocated_amount?.toLocaleString()}
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-xs text-slate-500">Utilized to Date</div>
                  <div className="text-base font-bold text-amber-700">
                    ₱{activeItem.department_utilized_amount?.toLocaleString()}
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-xs text-slate-500">Remaining Balance</div>
                  <div className="text-base font-bold text-emerald-700">
                    ₱{activeItem.department_remaining_balance?.toLocaleString()}
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-xs text-slate-500">Proposal Impact</div>
                  <div
                    className={`text-base font-bold ${
                      activeItem.is_over_budget ? "text-rose-600" : "text-blue-700"
                    }`}
                  >
                    {activeItem.is_over_budget
                      ? `-₱${Math.abs(activeItem.variance).toLocaleString()} Deficit`
                      : `+₱${activeItem.variance?.toLocaleString()} Surplus`}
                  </div>
                </Col>
              </Row>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="font-semibold text-sm text-slate-800 mb-2">
                Proposal Line Items
              </h4>
              <Table
                dataSource={activeItem.items || []}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  { title: "Item Name", dataIndex: "item_name", key: "item_name" },
                  { title: "Specification", dataIndex: "description", key: "description" },
                  { title: "Qty", dataIndex: "quantity", key: "quantity", width: 80 },
                  { title: "Unit", dataIndex: "unit", key: "unit", width: 90 },
                  {
                    title: "Est. Unit Price",
                    dataIndex: "estimated_unit_cost",
                    key: "estimated_unit_cost",
                    render: (val) => `₱${Number(val).toLocaleString()}`,
                  },
                  {
                    title: "Subtotal",
                    dataIndex: "total_estimated_cost",
                    key: "total_estimated_cost",
                    render: (val) => `₱${Number(val).toLocaleString()}`,
                  },
                ]}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5}>
                      <strong className="text-right block">Total Proposal Amount:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong className="text-base text-slate-900">
                        ₱{activeItem.winning_bid_total?.toLocaleString()}
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </div>

            {/* Attached Evidence Tab */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <h4 className="font-semibold text-sm text-slate-800 mb-2">
                Attached Evidence Documents (Carried Over)
              </h4>
              <EvidenceAttachmentTab
                attachments={activeItem.attachments || []}
                entityType="canvass"
                entityId={activeItem.id}
                onAttachmentAdded={fetchFinanceData}
              />
            </div>

            {/* Audit Trail */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <h4 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
                <HistoryOutlined className="text-blue-500" />
                <span>Audit Trail & Approval History</span>
              </h4>
              <RequestTrailTimeline
                trail={activeItem.trail || []}
                title={`Canvass ${activeItem.canvass_no} Trail`}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Interactive "Edit Items" Modal for Trimming Line Items / Quantities */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <EditOutlined className="text-rose-600" />
            <span>
              Adjust Proposal Line Items: {activeItem?.canvass_no} ({activeItem?.department_name})
            </span>
          </div>
        }
        open={isEditItemsModalOpen}
        onCancel={() => setIsEditItemsModalOpen(false)}
        width={950}
        okText="Save Adjustments & Recalculate"
        okButtonProps={{
          className: "bg-blue-600 hover:bg-blue-700 text-white",
        }}
        onOk={saveEditedItems}
      >
        <div className="space-y-4 py-2">
          {/* Dynamic Budget Delta Banner */}
          <div
            className={`p-4 rounded-xl border ${
              isNowWithinBudget
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-rose-50 border-rose-300 text-rose-800"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold">
                  Department Remaining Budget:
                </span>
                <div className="text-lg font-bold">
                  ₱{remainingBalance.toLocaleString()}
                </div>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-semibold">
                  Adjusted Proposal Total:
                </span>
                <div className="text-lg font-bold">
                  ₱{calculatedNewTotal.toLocaleString()}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase tracking-wider font-semibold">
                  Budget Difference:
                </span>
                <div
                  className={`text-xl font-extrabold ${
                    isNowWithinBudget ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {isNowWithinBudget
                    ? `+₱${newVariance.toLocaleString()} (SURPLUS - CLEAR)`
                    : `-₱${Math.abs(newVariance).toLocaleString()} (OVER BUDGET)`}
                </div>
              </div>
            </div>

            {isNowWithinBudget ? (
              <div className="mt-2 text-xs text-emerald-700 flex items-center space-x-1 font-medium">
                <CheckCircleOutlined />
                <span>
                  Adjustments brought this request within budget! Once saved,
                  Finance Approval can proceed.
                </span>
              </div>
            ) : (
              <div className="mt-2 text-xs text-rose-700 flex items-center space-x-1 font-medium">
                <WarningOutlined />
                <span>
                  Still over budget by ₱{Math.abs(newVariance).toLocaleString()}.
                  Please reduce quantities or delete non-essential items below.
                </span>
              </div>
            )}
          </div>

          {/* Line items editable table */}
          <Table
            dataSource={editingItems}
            rowKey="id"
            pagination={false}
            size="small"
            columns={[
              {
                title: "Item Name",
                dataIndex: "item_name",
                key: "item_name",
                render: (text, _, idx) => (
                  <Input
                    value={text}
                    size="small"
                    onChange={(e) =>
                      handleItemFieldChange(idx, "item_name", e.target.value)
                    }
                  />
                ),
              },
              {
                title: "Specification",
                dataIndex: "description",
                key: "description",
                render: (text, _, idx) => (
                  <Input
                    value={text}
                    size="small"
                    placeholder="Brand / Model"
                    onChange={(e) =>
                      handleItemFieldChange(idx, "description", e.target.value)
                    }
                  />
                ),
              },
              {
                title: "Quantity",
                dataIndex: "quantity",
                key: "quantity",
                width: 120,
                render: (val, _, idx) => (
                  <InputNumber
                    min={1}
                    size="small"
                    value={val}
                    onChange={(newVal) =>
                      handleItemFieldChange(idx, "quantity", newVal)
                    }
                    className="w-full"
                  />
                ),
              },
              {
                title: "Unit",
                dataIndex: "unit",
                key: "unit",
                width: 100,
                render: (text, _, idx) => (
                  <Select
                    size="small"
                    value={text}
                    onChange={(v) => handleItemFieldChange(idx, "unit", v)}
                    className="w-full"
                  >
                    <Option value="Units">Units</Option>
                    <Option value="Sets">Sets</Option>
                    <Option value="Pieces">Pieces</Option>
                    <Option value="Boxes">Boxes</Option>
                    <Option value="Cartridges">Cartridges</Option>
                    <Option value="Reams">Reams</Option>
                  </Select>
                ),
              },
              {
                title: "Unit Cost (₱)",
                dataIndex: "estimated_unit_cost",
                key: "estimated_unit_cost",
                width: 130,
                render: (val, _, idx) => (
                  <InputNumber
                    min={0}
                    size="small"
                    value={val}
                    formatter={(v) =>
                      `₱ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(v) => v.replace(/\₱\s?|(,*)/g, "")}
                    onChange={(newVal) =>
                      handleItemFieldChange(idx, "estimated_unit_cost", newVal)
                    }
                    className="w-full"
                  />
                ),
              },
              {
                title: "Subtotal",
                dataIndex: "total_estimated_cost",
                key: "total_estimated_cost",
                width: 120,
                render: (val) => (
                  <strong className="text-slate-800">
                    ₱{Number(val || 0).toLocaleString()}
                  </strong>
                ),
              },
              {
                title: "Action",
                key: "action",
                width: 60,
                render: (_, __, idx) => (
                  <Popconfirm
                    title="Remove item from proposal?"
                    onConfirm={() => handleRemoveLineItem(idx)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                ),
              },
            ]}
          />
        </div>
      </Modal>

      {/* Approve Budget & Issue PO Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <SafetyCertificateOutlined className="text-emerald-600" />
            <span>Confirm Budget Approval & Generate Purchase Order</span>
          </div>
        }
        open={isApproveModalOpen}
        onCancel={() => setIsApproveModalOpen(false)}
        okText="Approve Budget & Generate PO"
        okButtonProps={{
          className: "bg-emerald-600 hover:bg-emerald-700 text-white",
        }}
        onOk={() => executeApproval(activeItem?.id, selectedWarehouseId)}
      >
        {activeItem && (
          <div className="space-y-4 py-2">
            <Alert
              type="success"
              showIcon
              message="Budget Verified"
              description={`The proposal total of ₱${activeItem.winning_bid_total?.toLocaleString()} is within ${activeItem.department_name}'s balance of ₱${activeItem.department_remaining_balance?.toLocaleString()}.`}
            />

            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Proposal Number">
                {activeItem.canvass_no}
              </Descriptions.Item>
              <Descriptions.Item label="Requesting Department">
                {activeItem.department_name}
              </Descriptions.Item>
              <Descriptions.Item label="Encumbered Amount">
                <span className="text-base font-bold text-emerald-700">
                  ₱{activeItem.winning_bid_total?.toLocaleString()}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designated Receiving Warehouse / Depot:
              </label>
              <Select
                value={selectedWarehouseId}
                onChange={setSelectedWarehouseId}
                className="w-full"
              >
                {warehouses.map((w) => (
                  <Option key={w.id} value={w.id}>
                    {w.warehouse_name}
                  </Option>
                ))}
              </Select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Warehouse staff will receive goods when PO transitions to In Transit / Received.
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* ==================== KANBAN STAGE TRANSITION CONFIRMATION MODAL ==================== */}
      <KanbanTransitionModal
        open={!!pendingTransition}
        item={pendingTransition?.item}
        sourceStatus={pendingTransition?.sourceColId}
        targetStatus={pendingTransition?.targetColId}
        moduleName="Finance Budget Review"
        loading={transitionLoading}
        extraAlert={
          pendingTransition?.isApproval ? (
            <div className="space-y-3">
              <Alert
                type="success"
                showIcon
                message="Budget Verified for Purchase Order Generation"
                description={`Proposal total of ₱${pendingTransition.item?.winning_bid_total?.toLocaleString()} is within ${pendingTransition.item?.department_name}'s balance of ₱${pendingTransition.item?.department_remaining_balance?.toLocaleString()}. Approving will automatically generate an official Purchase Order.`}
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designated Receiving Warehouse:
                </label>
                <Select
                  value={selectedWarehouseId}
                  onChange={setSelectedWarehouseId}
                  className="w-full"
                >
                  {warehouses.map((w) => (
                    <Option key={w.id} value={w.id}>
                      {w.warehouse_name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          ) : null
        }
        onAccept={handleConfirmTransition}
        onCancel={handleCancelTransition}
      />

      {/* Revision Modal for Approval View */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-amber-600">
            <WarningOutlined />
            <span>Request Revision for {revisionTarget?.pr_no || revisionTarget?.title}</span>
          </div>
        }
        open={Boolean(revisionTarget)}
        onCancel={() => setRevisionTarget(null)}
        onOk={handleConfirmRevisionModal}
        okText="Submit Revision Request"
        okButtonProps={{ danger: true, loading: actionLoadingId === revisionTarget?.id }}
        destroyOnClose
      >
        <div className="py-2 space-y-3">
          <p className="text-xs text-slate-600">
            Please specify the revision instructions or reasons (e.g., exceeds department allocation, line item quantities need reduction, or missing specifications).
          </p>
          <Input.TextArea
            rows={4}
            placeholder="Enter finance notes / revision requirements for the requesting department..."
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
          />
        </div>
      </Modal>

      {/* Audit Trail Modal for Finance */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined className="text-blue-500" />
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
