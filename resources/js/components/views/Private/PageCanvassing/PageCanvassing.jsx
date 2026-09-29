import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  Radio,
  Tooltip,
  Alert,
  Row,
  Col,
  Statistic,
  Tabs,
  Upload,
  message,
  notification,
} from "antd";
import {
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  SwapOutlined,
  ExclamationCircleOutlined,
  ShoppingOutlined,
  EyeOutlined,
  PaperClipOutlined,
  BankOutlined,
  WarningOutlined,
  ArrowRightOutlined,
  TrophyOutlined,
  InboxOutlined,
  HistoryOutlined,
  FileExcelOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import KanbanBoard, { AttachmentBadge, StageTimerBadge } from "../../../common/KanbanBoard";
import EvidenceAttachmentTab from "../../../common/EvidenceAttachmentTab";
import KanbanTransitionModal from "../../../common/KanbanTransitionModal";
import RequestTrailTimeline from "../../../common/RequestTrailTimeline";
import { useProcurementRealtime } from "../../../providers/ProcurementRealtimeProvider";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export const CANVASS_PROCUREMENT_COLUMNS = [
  {
    id: "Ready for Canvass",
    title: "Ready for Canvass",
    color: "#0284c7",
    icon: <FileTextOutlined />,
    description: "Finance approved — gathering quotations",
  },
  {
    id: "Bidding",
    title: "Bidding",
    color: "#d97706",
    icon: <ClockCircleOutlined />,
    description: "Quotations received & competitive evaluation",
  },
];

export const CANVASS_COLUMNS = [
  {
    id: "New Purchase Request",
    title: "New Purchase Request",
    color: "#64748b",
    icon: <FileTextOutlined />,
    description: "Initial requisition draft & submission",
  },
  {
    id: "Pending Finance Approval",
    title: "Pending Finance Approval",
    color: "#fa8c16",
    icon: <DollarOutlined />,
    description: "Budget clearance & finance verification",
  },
  {
    id: "Canvassing / Bidding",
    title: "Canvassing / Bidding",
    color: "#1890ff",
    icon: <ClockCircleOutlined />,
    description: "Supplier quotation gathering & bid evaluation",
  },
  {
    id: "Purchase Order Issued",
    title: "Purchase Order Issued",
    color: "#52c41a",
    icon: <CheckCircleOutlined />,
    description: "PO officially dispatched & fulfillment ready",
  },
];

export const normalizeCanvassStatus = (status) => {
  if (!status) return "New Purchase Request";
  const s = String(status).trim();
  if (
    s === "New Purchase Request" ||
    s === "Draft" ||
    s === "Pending Canvass" ||
    s === "Draft PR" ||
    s === "Submitted PR" ||
    s === "Pending Department Approval"
  ) {
    return "New Purchase Request";
  }
  if (
    s === "Pending Finance Approval" ||
    s === "Pending Finance Review" ||
    s === "Budget Review" ||
    s === "Pending Finance" ||
    s === "Over Budget (Needs Revision)"
  ) {
    return "Pending Finance Approval";
  }
  if (
    s === "Canvassing / Bidding" ||
    s === "Bidding" ||
    s === "Seeking Bids" ||
    s === "In Progress" ||
    s === "Under Review" ||
    s === "Canvassing"
  ) {
    return "Canvassing / Bidding";
  }
  if (
    s === "Purchase Order Issued" ||
    s === "Approved" ||
    s === "Winning Bid Selected" ||
    s === "Approved PR" ||
    s === "PO Ready"
  ) {
    return "Purchase Order Issued";
  }
  return s;
};

export const hasPassedFinanceApproval = (item) => {
  if (!item) return false;
  // 1. Explicit finance approval timestamp
  if (item.finance_approved_at || item.finance_approved_at_time) return true;
  // 2. Explicit finance status
  if (item.finance_status === "Finance Approved") return true;
  if (item.finance_approved_by) return true;
  // 3. Digital signature approval checklist
  if (item.approvals && Array.isArray(item.approvals)) {
    const fin = item.approvals.find(
      (a) => a.role === "Finance" || a.role_title?.toLowerCase().includes("finance")
    );
    if (fin && fin.status === "approved") return true;
  }
  // 4. Downstream stages imply previous approval
  const s = String(item.status || "");
  if (
    s === "Finance Approved" ||
    s === "Canvassing / Bidding" ||
    s === "Purchase Order Issued" ||
    s === "Approved PR" ||
    s === "Approved" ||
    s === "Winning Bid Selected"
  ) {
    return true;
  }
  return false;
};

export default function PageCanvassing() {
  const { message, notification, modal } = App.useApp();
  const {
    unifiedRecords,
    canvassingRecords,
    awardBid,
    startBidding,
    refreshAll,
  } = useProcurementRealtime();

  const [activeTabKey, setActiveTabKey] = useState("sourcing_queue"); // "sourcing_queue" | "all_rfqs"
  const [awardModalVisible, setAwardModalVisible] = useState(false);
  const [recordToAward, setRecordToAward] = useState(null);
  const [awardForm] = Form.useForm();
  const [awardLoading, setAwardLoading] = useState(false);

  const [canvasses, setCanvasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "table"
  const [suppliers, setSuppliers] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isAddBidModalOpen, setIsAddBidModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Kanban Drag-and-Drop & List View Dropdown Confirmation Interception
  // pendingStatusChange state object stores recordId and newStatus
  const [pendingStatusChange, setPendingStatusChange] = useState(null); // { recordId, newStatus }
  const [transitionLoading, setTransitionLoading] = useState(false);

  const [activeCanvass, setActiveCanvass] = useState(null);

  // PMO Master Procurement Report state
  const [reportSearchText, setReportSearchText] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("all");
  const [reportDeptFilter, setReportDeptFilter] = useState("all");
  const [auditTrailModalRecord, setAuditTrailModalRecord] = useState(null);
  const [isAuditTrailModalOpen, setIsAuditTrailModalOpen] = useState(false);

  const navigate = useNavigate();

  const normalizedCanvasses = useMemo(() => {
    return canvasses
      .filter((c) => {
        // HR & Training Services completely bypass PMO Canvassing
        if (c.sub_category === "HR & Training Services" || c.pr_type === "Services/OpEx (Budget Only)" || c.is_bypassed_pmo) {
          return false;
        }
        return true;
      })
      .map((c) => ({
        ...c,
        status: normalizeCanvassStatus(c.status),
      }));
  }, [canvasses]);

  const fetchCanvasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/canvasses");
      if (res.data && res.data.data) {
        setCanvasses(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load canvasses:", err);
      message.error("Failed to fetch canvass records.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [supRes, deptRes] = await Promise.all([
        axios.get("/api/suppliers"),
        axios.get("/api/departments"),
      ]);
      if (supRes.data?.data) setSuppliers(supRes.data.data);
      if (deptRes.data?.data) setDepartments(deptRes.data.data);
    } catch (err) {
      console.error("Failed to fetch reference data:", err);
    }
  };

  useEffect(() => {
    fetchCanvasses();
    fetchReferenceData();
  }, []);

  // When onDragEnd (for Kanban) is triggered
  const handleDragEnd = (resultOrItemId, sourceColId, targetColId) => {
    let recordId;
    let newStatus;

    if (resultOrItemId && typeof resultOrItemId === "object" && resultOrItemId.destination) {
      const { destination, source, draggableId } = resultOrItemId;
      if (!destination) return;
      if (
        destination.droppableId === source?.droppableId &&
        destination.index === source?.index
      ) {
        return;
      }
      recordId = draggableId;
      newStatus = destination.droppableId;
    } else {
      recordId = resultOrItemId;
      newStatus = targetColId;
    }

    const normTarget = normalizeCanvassStatus(newStatus);
    if (!normTarget) return;

    const canvassId = Number(recordId);
    const movingCanvass =
      normalizedCanvasses.find((c) => c.id === canvassId) ||
      canvasses.find((c) => c.id === canvassId);
    if (!movingCanvass) return;

    const normSource = normalizeCanvassStatus(movingCanvass.status);
    if (normSource === normTarget) return;

    // VALIDATION RULE: Users cannot drag a card into the 'Canvassing' column unless it has explicitly passed 'Finance Approval'
    if (normTarget === "Canvassing / Bidding") {
      if (!hasPassedFinanceApproval(movingCanvass)) {
        notification.error({
          message: "Finance Approval Required",
          description: (
            <div className="space-y-1">
              <p className="font-semibold text-red-600 text-xs mb-1">
                Cannot move "{movingCanvass.canvass_no || movingCanvass.title}" into Canvassing / Bidding.
              </p>
              <p className="text-slate-600 text-xs">
                <strong>Validation Policy:</strong> Requests are strictly prohibited from entering Canvassing / Bidding unless they have explicitly passed <strong>Finance Approval</strong>.
              </p>
              <div className="bg-amber-50 p-1.5 rounded border border-amber-200 text-amber-900 text-xs font-medium mt-1">
                👉 Move to <strong>Pending Finance Approval</strong> and click <strong>Approve Finance</strong> first.
              </div>
            </div>
          ),
          duration: 6,
          placement: "topRight",
        });
        return; // Snaps card back immediately; does not update state or open modal
      }
    }

    // Do not update the main data state yet. Store in pendingStatusChange to open confirmation modal.
    setPendingStatusChange({
      recordId: movingCanvass.id,
      newStatus: normTarget,
    });
  };

  // When onChange (for the List dropdown) is triggered
  const handleListStatusChange = (recordId, rawStatus) => {
    const normTarget = normalizeCanvassStatus(rawStatus);
    if (!normTarget) return;

    const canvassId = Number(recordId);
    const movingCanvass =
      normalizedCanvasses.find((c) => c.id === canvassId) ||
      canvasses.find((c) => c.id === canvassId);
    if (!movingCanvass) return;

    const normSource = normalizeCanvassStatus(movingCanvass.status);
    if (normSource === normTarget) return;

    // VALIDATION RULE: Users cannot transition a card into 'Canvassing' column unless it has explicitly passed 'Finance Approval'
    if (normTarget === "Canvassing / Bidding") {
      if (!hasPassedFinanceApproval(movingCanvass)) {
        notification.error({
          message: "Finance Approval Required",
          description: (
            <div className="space-y-1">
              <p className="font-semibold text-red-600 text-xs mb-1">
                Cannot set "{movingCanvass.canvass_no || movingCanvass.title}" to Canvassing / Bidding.
              </p>
              <p className="text-slate-600 text-xs">
                <strong>Validation Policy:</strong> Requests cannot enter Canvassing / Bidding unless they have explicitly passed <strong>Finance Approval</strong>.
              </p>
              <div className="bg-amber-50 p-1.5 rounded border border-amber-200 text-amber-900 text-xs font-medium mt-1">
                👉 Please approve this requisition in Finance before starting Canvassing.
              </div>
            </div>
          ),
          duration: 6,
          placement: "topRight",
        });
        return;
      }
    }

    // Do not update the main data state yet. Store in pendingStatusChange to open confirmation modal.
    setPendingStatusChange({
      recordId: movingCanvass.id,
      newStatus: normTarget,
    });
  };

  // Explicit Finance Approval helper so users can easily approve requisitions
  const handleApproveFinance = async (canvass) => {
    try {
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
      setCanvasses((prev) =>
        prev.map((c) =>
          Number(c.id) === Number(canvass.id)
            ? {
                ...c,
                finance_status: "Finance Approved",
                finance_approved_at: nowStr,
                finance_approved_by: "Finance Director",
              }
            : c
        )
      );
      await axios.post(`/api/canvasses/${canvass.id}/finance-approve`, {
        approved_by: "Finance Director",
        remarks: "Budget verified and approved for canvassing / bidding.",
      });
      message.success(`Finance Approval granted for ${canvass.canvass_no || canvass.title}! Cleared to proceed to Canvassing.`);
      fetchCanvasses();
    } catch (err) {
      console.error("Failed to approve in finance:", err);
      message.error("Failed to submit finance approval.");
      fetchCanvasses();
    }
  };

  const handleCardDrop = (itemId, sourceColId, targetColId) => {
    handleDragEnd(itemId, sourceColId, targetColId);
  };

  const pendingRecord = useMemo(() => {
    if (!pendingStatusChange) return null;
    return (
      normalizedCanvasses.find((c) => Number(c.id) === Number(pendingStatusChange.recordId)) ||
      canvasses.find((c) => Number(c.id) === Number(pendingStatusChange.recordId)) ||
      null
    );
  }, [pendingStatusChange, normalizedCanvasses, canvasses]);

  // If the user clicks 'Accept' in the modal, apply the change from pendingStatusChange
  // to the main data state so the UI updates, then close the modal and clear the pending state.
  const handleConfirmTransition = async (remarks = "") => {
    if (!pendingStatusChange) return;
    const { recordId, newStatus } = pendingStatusChange;
    const canvassId = Number(recordId);
    setTransitionLoading(true);

    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

    // 1. Apply the change from pendingStatusChange to the main data state so the UI updates immediately
    setCanvasses((prev) =>
      prev.map((c) =>
        Number(c.id) === canvassId
          ? {
              ...c,
              status: newStatus,
              updated_at: nowStr,
              stage_entered_at: nowStr,
            }
          : c
      )
    );

    // 2. Close the modal and clear the pending state
    setPendingStatusChange(null);

    // 3. Persist update via server API
    try {
      const res = await axios.patch(`/api/canvasses/${canvassId}/status`, {
        status: newStatus,
        remarks: remarks || undefined,
        performed_by: "Procurement Officer",
        role: "Canvassing Agent",
      });
      message.success(`Canvass status updated to "${newStatus}" successfully!`);
      if (res.data?.data) {
        setCanvasses((prev) =>
          prev.map((c) => (Number(c.id) === canvassId ? { ...c, ...res.data.data } : c))
        );
      }
      fetchCanvasses();
    } catch (err) {
      console.error("Failed to update status on server:", err);
      message.error("Failed to update status on server. Reverting...");
      fetchCanvasses();
    } finally {
      setTransitionLoading(false);
    }
  };

  // If the user clicks 'Cancel', simply close the modal and clear the pending state
  // so the UI naturally reverts to its original position.
  const handleCancelTransition = () => {
    setPendingStatusChange(null);
  };

  // Select Winning Bid -> Transition to 'Winning Bid Selected' & Submit to Finance Gatekeeper
  const handleSelectWinningBid = async (canvass, bid) => {
    try {
      const res = await axios.post(`/api/canvasses/${canvass.id}/bids/${bid.id}/select-winner`);
      const resultData = res.data?.data;
      const isOver = resultData?.isOverBudget;

      notification.open({
        message: isOver ? "Winning Bid Awarded — Over Budget!" : "Winning Bid Awarded & Sent to Finance",
        description: (
          <div className="space-y-2">
            <p>{res.data?.message}</p>
            {isOver ? (
              <Alert
                type="error"
                showIcon
                message="Finance Gatekeeper Revision Flagged"
                description={`Department balance is exceeded by ₱${Math.abs(resultData.variance).toLocaleString()}. Line items can be trimmed in Finance Approval.`}
              />
            ) : (
              <Alert
                type="success"
                showIcon
                message="Cleared for Finance Budget Approval"
                description={`Estimated remaining department balance after PO: ₱${Number(resultData.variance).toLocaleString()}.`}
              />
            )}
            <Button
              type="primary"
              size="small"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate("/finance-approval")}
            >
              Open Finance Approval
            </Button>
          </div>
        ),
        duration: 8,
      });

      setIsCompareModalOpen(false);
      fetchCanvasses();
    } catch (err) {
      console.error("Failed to select winner:", err);
      message.error("Failed to select winning bid.");
    }
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleOpenQuickAward = (record) => {
    setRecordToAward(record);
    const suggestedAmount = record.winning_bid_amount || record.total_amount || record.total_estimated_budget || 0;
    const defaultSupplier = record.winning_supplier || record.supplier_name || (suppliers[0]?.supplier_name || "Preferred Vendor");

    awardForm.setFieldsValue({
      supplier_name: defaultSupplier,
      bid_amount: suggestedAmount,
      delivery_lead_time_days: 14,
      remarks: "Awarded based on competitive quotation review",
    });
    setAwardModalVisible(true);
  };

  const handleConfirmQuickAward = async () => {
    try {
      const values = await awardForm.validateFields();
      if (!recordToAward) return;
      setAwardLoading(true);

      await awardBid(recordToAward.id, `bid-${Date.now()}`, {
        supplier_name: values.supplier_name,
        bid_amount: Number(values.bid_amount) || 0,
        delivery_lead_time_days: values.delivery_lead_time_days || 14,
        remarks: values.remarks,
      });

      notification.success({
        message: "Winning Bid Awarded Successfully!",
        description: (
          <div>
            <p>Contract awarded to <strong>{values.supplier_name}</strong> for <strong>₱{Number(values.bid_amount).toLocaleString()}</strong>.</p>
            <p className="text-xs text-slate-500 mt-1">Status updated to <strong>'Bid Awarded - Pending PR'</strong>. The requesting department can now generate their formal Purchase Request based on the winning quotation.</p>
          </div>
        ),
        duration: 6,
      });

      setAwardModalVisible(false);
      setRecordToAward(null);
      fetchCanvasses();
    } catch (err) {
      console.error("Failed to award bid:", err);
      message.error("Failed to award bid.");
    } finally {
      setAwardLoading(false);
    }
  };

  // Approve Winning Bid -> Update status to 'Bid Awarded - Pending PR'
  const handleApproveBid = (canvass, bid) => {
    modal.confirm({
      title: "Award Winning Bid & Proceed to Formal PR Drafting?",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      content: (
        <div className="space-y-2 py-2">
          <p>
            You are about to award the contract for{" "}
            <strong>{canvass.canvass_no || canvass.pr_no}</strong> to{" "}
            <strong>{bid.supplier_name}</strong> for{" "}
            <strong className="text-emerald-700">
              ₱{Number(bid.bid_amount).toLocaleString()}
            </strong>
            .
          </p>
          <Alert
            type="info"
            showIcon
            message="Stage 2 -> Stage 3 Sequence"
            description="Awarding this bid marks the status as 'Bid Awarded - Pending PR'. This transitions the request to Stage 3 (PR Drafting) where the department generates the formal Purchase Request or reviews/contests the award."
          />
        </div>
      ),
      okText: "Award Bid & Move to PR Drafting",
      okButtonProps: { className: "bg-emerald-600 hover:bg-emerald-700 text-white" },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // Sync with SSoT Provider: updates status to 'Bid Awarded - Pending PR' and broadcasts realtime update
          await awardBid(canvass.id || canvass.pr_id, bid.id, {
            supplier_name: bid.supplier_name,
            bid_amount: Number(bid.bid_amount),
          });

          // Also trigger server-side canvass approval if available
          try {
            await axios.patch(
              `/api/canvasses/${canvass.id}/bids/${bid.id}/approve`,
              { warehouse_id: 1 }
            );
          } catch (e) {
            console.log("Legacy canvass patch notice:", e?.message);
          }

          notification.success({
            message: "Winning Bid Awarded!",
            description: (
              <div>
                <p>Contract awarded to <strong>{bid.supplier_name}</strong> for ₱{Number(bid.bid_amount).toLocaleString()}.</p>
                <p className="text-xs text-slate-500 mt-1">Status updated to <strong>'Bid Awarded - Pending PR'</strong>. Initiating department has been notified to draft formal PR.</p>
              </div>
            ),
            duration: 6,
          });

          setIsCompareModalOpen(false);
          fetchCanvasses();
        } catch (err) {
          console.error("Failed to approve bid:", err);
          message.error("Failed to approve bid.");
        }
      },
    });
  };

  // Statistics metrics
  const totalCanvasses = canvasses.length;
  const activeBidding = canvasses.filter((c) => {
    const s = normalizeCanvassStatus(c.status);
    return s === "Canvassing / Bidding" || s === "Pending Finance Approval";
  }).length;
  const approvedCanvasses = canvasses.filter(
    (c) => normalizeCanvassStatus(c.status) === "Purchase Order Issued"
  ).length;
  const totalBidsCount = canvasses.reduce(
    (acc, c) => acc + (c.supplier_bids?.length || 0),
    0
  );

  // Render individual Canvass card on the Kanban Board
  const renderCanvassCard = (canvass) => {
    const priorityColors = {
      Urgent: "error",
      High: "warning",
      Medium: "processing",
      Low: "default",
    };

    const bidsCount = canvass.supplier_bids?.length || 0;
    const isApproved = normalizeCanvassStatus(canvass.status) === "Approved";

    return (
      <Card
        size="small"
        className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none"
      >
        <div className="space-y-2">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {canvass.canvass_no}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <StageTimerBadge
                entryTimestamp={canvass.stage_entered_at || canvass.updated_at || canvass.created_at}
                currentStage={canvass.status}
                thresholdDays={3}
                history={{
                  canvass_started_at: canvass.canvass_started_at,
                  pr_submitted_at: canvass.pr_submitted_at,
                  finance_approved_at: canvass.finance_approved_at,
                  po_dispatched_at: canvass.po_dispatched_at,
                  items_received_at: canvass.items_received_at,
                }}
              />
              <Tag color={priorityColors[canvass.priority] || "default"} className="m-0 text-[11px]">
                {canvass.priority}
              </Tag>
            </div>
          </div>

          {/* Title */}
          <Text strong className="text-sm text-slate-900 line-clamp-2 leading-snug">
            {canvass.title}
          </Text>

          {/* Department */}
          <div className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
            {canvass.department_name}
          </div>

          {/* Budget & Items count */}
          <div className="flex items-center justify-between text-xs py-1 border-y border-slate-100 bg-slate-50/60 -mx-3 px-3">
            <div>
              <span className="text-slate-400">Budget: </span>
              <span className="font-semibold text-slate-800">
                ₱{Number(canvass.total_estimated_budget || 0).toLocaleString()}
              </span>
            </div>
            <div className="text-slate-500">
              {canvass.items?.length || 0} items
            </div>
          </div>

          {/* Bids Information & Attachment Indicator */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <Badge
                count={bidsCount}
                style={{
                  backgroundColor: bidsCount > 0 ? "#1890ff" : "#d9d9d9",
                }}
              />
              <span className="text-xs text-slate-600">
                {bidsCount === 1 ? "1 Bid" : `${bidsCount} Bids`}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <AttachmentBadge count={canvass.attachments?.length || 0} />
              {isApproved && canvass.pr_no && (
                <Tag color="cyan" className="m-0 text-[10px] font-mono">
                  {canvass.pr_no}
                </Tag>
              )}
              {isApproved && canvass.po_no && (
                <Tag color="green" className="m-0 text-[10px] font-mono">
                  {canvass.po_no}
                </Tag>
              )}
            </div>
          </div>

          {/* Department Justification & Pending Canvass prompt */}
          {canvass.status === "Pending Canvass" && (
            <div className="pt-2 border-t border-purple-100 space-y-1.5">
              {canvass.justification && (
                <div className="text-[11px] text-slate-600 bg-purple-50/60 p-1.5 rounded border border-purple-100 leading-snug">
                  <span className="font-medium text-purple-800">Justification:</span> {canvass.justification}
                </div>
              )}
              <Button
                type="primary"
                size="small"
                className="w-full text-xs bg-purple-600 hover:bg-purple-700 font-medium"
                icon={<ArrowRightOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardDrop(canvass.id, "Pending Canvass", "Seeking Bids");
                }}
              >
                Start Sourcing Bids →
              </Button>
            </div>
          )}

          {/* Finance Approval Status & Quick Action */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Finance Approval:</span>
              {hasPassedFinanceApproval(canvass) ? (
                <Tag color="success" className="m-0 text-[10px]" icon={<CheckCircleOutlined />}>
                  Approved
                </Tag>
              ) : (
                <Tag color="warning" className="m-0 text-[10px]" icon={<ClockCircleOutlined />}>
                  Pending Approval
                </Tag>
              )}
            </div>

            {/* Quick 1-click Approve Finance if not yet approved */}
            {!hasPassedFinanceApproval(canvass) && (
              <Button
                type="primary"
                size="small"
                className="w-full text-xs bg-amber-600 hover:bg-amber-500 font-medium mt-1"
                icon={<CheckCircleOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveFinance(canvass);
                }}
              >
                Approve Finance (Clear for Canvassing)
              </Button>
            )}
          </div>

          {/* Card Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              className="text-xs text-slate-600 hover:text-blue-600 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setActiveCanvass(canvass);
                setIsDetailModalOpen(true);
              }}
            >
              Details
            </Button>

            <div className="flex items-center gap-1">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                className="text-xs text-blue-600 hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCanvass(canvass);
                  setIsAddBidModalOpen(true);
                }}
              >
                Bid
              </Button>

              <Button
                type="primary"
                ghost
                size="small"
                icon={<SwapOutlined />}
                className="text-xs"
                disabled={bidsCount === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCanvass(canvass);
                  setIsCompareModalOpen(true);
                }}
              >
                Compare ({bidsCount})
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Tabular columns
  const tableColumns = [
    {
      title: "RFQ No.",
      dataIndex: "canvass_no",
      key: "canvass_no",
      render: (text) => <span className="font-mono font-semibold">{text}</span>,
    },
    {
      title: "Title & Details",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div className="font-medium text-slate-900">{text}</div>
          <div className="text-xs text-slate-500">{record.department_name}</div>
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
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
    },
    {
      title: "Est. Budget",
      dataIndex: "total_estimated_budget",
      key: "total_estimated_budget",
      render: (val) => `₱${Number(val || 0).toLocaleString()}`,
    },
    {
      title: "Bids Received",
      dataIndex: "supplier_bids",
      key: "bids",
      render: (bids = []) => (
        <Badge count={bids.length} style={{ backgroundColor: bids.length ? "#1890ff" : "#ccc" }} />
      ),
    },
    {
      title: "Status & Time in Stage",
      dataIndex: "status",
      key: "status",
      width: 220,
      render: (status, record) => {
        const currentStatus = normalizeCanvassStatus(status);
        return (
          <div onClick={(e) => e.stopPropagation()} className="space-y-1.5">
            <Select
              value={currentStatus}
              className="w-full min-w-[150px]"
              onChange={(newStatus) => {
                if (newStatus === currentStatus) return;
                handleListStatusChange(record.id, newStatus);
              }}
              popupMatchSelectWidth={false}
              size="middle"
            >
              {CANVASS_COLUMNS.map((col) => (
                <Option key={col.id} value={col.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                      style={{ backgroundColor: col.color }}
                    />
                    <span className="font-medium text-xs text-slate-700">{col.title}</span>
                  </div>
                </Option>
              ))}
            </Select>
            <div className="flex items-center">
              <StageTimerBadge
                entryTimestamp={record.stage_entered_at || record.updated_at || record.created_at}
                currentStage={currentStatus}
                thresholdDays={3}
                history={{
                  canvass_started_at: record.canvass_started_at,
                  pr_submitted_at: record.pr_submitted_at,
                  finance_approved_at: record.finance_approved_at,
                  po_dispatched_at: record.po_dispatched_at,
                  items_received_at: record.items_received_at,
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            onClick={() => {
              setActiveCanvass(record);
              setIsDetailModalOpen(true);
            }}
          >
            Details
          </Button>
          <Button
            size="small"
            type="primary"
            ghost
            disabled={!record.supplier_bids?.length}
            onClick={() => {
              setActiveCanvass(record);
              setIsCompareModalOpen(true);
            }}
          >
            Compare Bids ({record.supplier_bids?.length || 0})
          </Button>
        </Space>
      ),
    },
  ];

  // PMO Master Procurement Report records memo
  const masterProcurementRecords = useMemo(() => {
    let source = (unifiedRecords && unifiedRecords.length > 0) ? unifiedRecords : canvasses;

    let records = source.filter((r) => {
      // Exclude bypassed
      if (r.sub_category === "HR & Training Services" || r.pr_type === "Services/OpEx (Budget Only)" || r.is_bypassed_pmo) {
        return false;
      }
      return true;
    });

    if (reportStatusFilter !== "all") {
      records = records.filter((r) => r.status === reportStatusFilter);
    }

    if (reportDeptFilter !== "all") {
      records = records.filter(
        (r) =>
          r.department_name === reportDeptFilter ||
          r.department_code === reportDeptFilter ||
          String(r.department_id) === String(reportDeptFilter)
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
          (r.winning_supplier && r.winning_supplier.toLowerCase().includes(q)) ||
          (r.awarded_supplier && r.awarded_supplier.toLowerCase().includes(q)) ||
          (r.items &&
            Array.isArray(r.items) &&
            r.items.some((it) => it.item_name?.toLowerCase().includes(q)))
      );
    }

    return records;
  }, [unifiedRecords, canvasses, reportStatusFilter, reportDeptFilter, reportSearchText]);

  // PMO Master Report Statistics
  const masterTotalEncumbered = useMemo(() => {
    return masterProcurementRecords.reduce((sum, r) => {
      const val = Number(
        r.winning_bid_amount || r.total_estimated_budget || r.total_amount || 0
      );
      return sum + val;
    }, 0);
  }, [masterProcurementRecords]);

  const masterCompletedCount = useMemo(() => {
    const completedStages = [
      "PO Issued",
      "Purchase Order Issued",
      "Sent to Supplier",
      "In Transit",
      "Partially Received",
      "Fully Received",
    ];
    return masterProcurementRecords.filter((r) => completedStages.includes(r.status)).length;
  }, [masterProcurementRecords]);

  const masterActiveSourcingCount = useMemo(() => {
    const sourcingStages = [
      "Pending Canvass",
      "Canvassing in Progress",
      "Bidding",
      "Bid Awarded - Pending PR",
    ];
    return masterProcurementRecords.filter((r) => sourcingStages.includes(r.status)).length;
  }, [masterProcurementRecords]);

  // PMO Master Report Export to CSV
  const handleExportMasterCSV = () => {
    try {
      const headers = [
        "PR Number",
        "RFQ Reference",
        "Requesting Department",
        "Winning / Awarded Supplier",
        "Current Pipeline Stage",
        "Encumbered Budget (PHP)",
        "Date Initiated",
        "Lead Time",
      ];
      const rows = masterProcurementRecords.map((r) => {
        const pr = r.pr_no || "Pending PR";
        const rfq = r.canvass_no || `RFQ-${r.id}`;
        const dept = r.department_name || r.department_code || "University Department";
        const supplier =
          r.winning_supplier ||
          r.awarded_supplier ||
          (r.quotations?.find((q) => q.is_selected)?.supplier_name) ||
          "Awaiting Sourcing Award";
        const stage = r.status || "Pending Canvass";
        const budget = Number(
          r.winning_bid_amount || r.total_estimated_budget || r.total_amount || 0
        ).toFixed(2);
        const initiated = r.created_at ? r.created_at.slice(0, 10) : (r.date_requested || "N/A");

        const startDate = r.created_at ? dayjs(r.created_at) : (r.date_requested ? dayjs(r.date_requested) : null);
        const endDate = r.po_date ? dayjs(r.po_date) : (r.completed_at ? dayjs(r.completed_at) : null);
        let leadTime = "Active";
        if (startDate && endDate) {
          leadTime = `${endDate.diff(startDate, "day")} days (Completed)`;
        } else if (startDate) {
          leadTime = `${dayjs().diff(startDate, "day")} days elapsed`;
        }

        return [
          `"${pr}"`,
          `"${rfq}"`,
          `"${dept}"`,
          `"${supplier}"`,
          `"${stage}"`,
          `"${budget}"`,
          `"${initiated}"`,
          `"${leadTime}"`,
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
        `PMO_Master_Procurement_Report_${dayjs().format("YYYYMMDD_HHmmss")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success("PMO Master Procurement Report exported to CSV successfully.");
    } catch (err) {
      console.error("Export error:", err);
      message.error("Failed to export Master Procurement Report.");
    }
  };

  // Master Procurement Report Columns
  const masterReportColumns = [
    {
      title: "PR Number",
      key: "pr_number",
      width: 170,
      render: (_, r) => (
        <div>
          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 block w-fit">
            {r.pr_no || "Pending PR"}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
            RFQ: {r.canvass_no || `RFQ-${r.id}`}
          </span>
        </div>
      ),
    },
    {
      title: "Requesting Department",
      key: "requesting_department",
      width: 190,
      render: (_, r) => (
        <div className="flex items-center gap-1.5">
          <BankOutlined className="text-slate-400" />
          <div>
            <div className="font-semibold text-xs text-slate-800">
              {r.department_name || "Department"}
            </div>
            {r.department_code && (
              <span className="text-[10px] text-slate-400 font-mono">
                {r.department_code}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Winning / Awarded Supplier",
      key: "supplier",
      width: 210,
      render: (_, r) => {
        const supplier =
          r.winning_supplier ||
          r.awarded_supplier ||
          (r.quotations?.find((q) => q.is_selected)?.supplier_name);
        if (supplier) {
          return (
            <div className="flex items-center gap-1.5">
              <ShoppingOutlined className="text-emerald-600" />
              <div>
                <span className="font-semibold text-xs text-slate-800 block">
                  {supplier}
                </span>
                {r.supplier_bids?.length > 0 && (
                  <span className="text-[10px] text-slate-400">
                    from {r.supplier_bids.length} quotations
                  </span>
                )}
              </div>
            </div>
          );
        }
        return (
          <span className="text-xs text-slate-400 italic">
            Awaiting Sourcing Award
          </span>
        );
      },
    },
    {
      title: "Current Pipeline Stage",
      dataIndex: "status",
      key: "pipeline_stage",
      width: 190,
      render: (status) => {
        const map = {
          "Pending Canvass": { color: "purple", text: "Pending Canvass" },
          "Canvassing in Progress": { color: "processing", text: "Canvassing" },
          "Bidding": { color: "gold", text: "Active Bidding" },
          "Bid Awarded - Pending PR": { color: "cyan", text: "Bid Awarded - Pending PR" },
          "Contested": { color: "red", text: "Contested" },
          "Pending Finance Approval": { color: "orange", text: "Pending Finance Clearance" },
          "Pending Finance Review": { color: "orange", text: "Pending Finance Review" },
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
      title: "Encumbered Budget",
      key: "encumbered_budget",
      width: 160,
      render: (_, r) => {
        const val = Number(
          r.winning_bid_amount || r.total_estimated_budget || r.total_amount || 0
        );
        return (
          <strong className="text-sm text-slate-900 font-mono">
            ₱{val.toLocaleString()}
          </strong>
        );
      },
    },
    {
      title: "Lead Time (Initiated vs Completed)",
      key: "lead_time",
      width: 210,
      render: (_, r) => {
        const startDate = r.created_at ? dayjs(r.created_at) : (r.date_requested ? dayjs(r.date_requested) : null);
        const endDate = r.po_date ? dayjs(r.po_date) : (r.completed_at ? dayjs(r.completed_at) : null);
        const isFinished = ["PO Issued", "Purchase Order Issued", "Sent to Supplier", "In Transit", "Partially Received", "Fully Received"].includes(r.status);

        let leadDays = null;
        let badgeColor = "default";
        if (startDate && endDate) {
          leadDays = endDate.diff(startDate, "day");
          badgeColor = leadDays <= 7 ? "green" : leadDays <= 14 ? "blue" : "orange";
        } else if (startDate) {
          leadDays = dayjs().diff(startDate, "day");
          badgeColor = leadDays > 14 ? "volcano" : "blue";
        }

        return (
          <div>
            <div className="flex items-center gap-1.5">
              <ClockCircleOutlined className="text-slate-400 text-xs" />
              <span className="text-xs font-semibold text-slate-800">
                {leadDays !== null ? `${leadDays} day${leadDays === 1 ? "" : "s"}` : "N/A"}
              </span>
              <Tag color={badgeColor} className="ml-1 text-[10px] m-0">
                {isFinished ? "Delivered / PO" : "In Progress"}
              </Tag>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Init: {startDate ? startDate.format("YYYY-MM-DD") : "N/A"}
              {endDate && ` • End: ${endDate.format("YYYY-MM-DD")}`}
            </div>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 170,
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
              setActiveCanvass(record);
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
    <div className="pmo-canvassing-module space-y-5 p-4 max-w-7xl mx-auto">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <Title level={3} className="m-0 text-slate-900">
            Canvassing & Sourcing (RFQ)
          </Title>
          <Paragraph className="text-slate-500 m-0 text-sm">
            Manage procurement bids, evaluate supplier quotations side-by-side, and award winning bids into Purchase Orders.
          </Paragraph>
        </div>

        <div className="flex items-center gap-3">
          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="kanban">
              <AppstoreOutlined className="mr-1" /> Kanban
            </Radio.Button>
            <Radio.Button value="table">
              <UnorderedListOutlined className="mr-1" /> List
            </Radio.Button>
          </Radio.Group>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="middle"
            onClick={handleOpenCreateModal}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create RFQ / Canvass
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border border-slate-200 bg-white">
            <Statistic
              title={<span className="text-xs text-slate-500">Total Canvasses</span>}
              value={totalCanvasses}
              prefix={<FileTextOutlined className="text-blue-500 text-sm" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border border-slate-200 bg-white">
            <Statistic
              title={<span className="text-xs text-slate-500">Active Bidding</span>}
              value={activeBidding}
              prefix={<ClockCircleOutlined className="text-amber-500 text-sm" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border border-slate-200 bg-white">
            <Statistic
              title={<span className="text-xs text-slate-500">Supplier Bids Received</span>}
              value={totalBidsCount}
              prefix={<TeamOutlined className="text-purple-500 text-sm" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border border-slate-200 bg-white">
            <Statistic
              title={<span className="text-xs text-slate-500">Approved & Pushed to PO</span>}
              value={approvedCanvasses}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined className="text-emerald-500 text-sm" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs: Sourcing Queue (Strict Pipeline Filter: Ready for Canvass & Bidding) vs All RFQs */}
      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        type="card"
        className="bg-transparent"
        items={[
          {
            key: "sourcing_queue",
            label: (
              <span className="font-semibold px-2 flex items-center gap-2">
                <FileTextOutlined className="text-blue-600" />
                <span>Stage 2: Sourcing Queue (Pending Canvass)</span>
                <Badge
                  count={canvassingRecords.length}
                  style={{ backgroundColor: "#0284c7" }}
                  overflowCount={99}
                />
              </span>
            ),
            children: (
              <div className="space-y-4">
                <Alert
                  type="info"
                  showIcon
                  className="rounded-lg border-blue-200 bg-blue-50/80 text-blue-900"
                  message={
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span>
                        <strong>Stage 2 Pipeline Filter:</strong> Displays RFQs awaiting quotations with status{" "}
                        <Tag color="purple" className="font-semibold">Pending Canvass</Tag> OR{" "}
                        <Tag color="gold" className="font-semibold">Bidding</Tag>.
                        Awarding the winning quotation updates status to <Tag color="cyan">Bid Awarded - Pending PR</Tag>, advancing to Stage 3 for formal Department PR generation.
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {canvassingRecords.length} record(s) in active sourcing
                      </span>
                    </div>
                  }
                />

                {canvassingRecords.length === 0 ? (
                  <Card className="rounded-xl border border-slate-200 p-12 text-center shadow-sm bg-white">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
                      <FileTextOutlined style={{ fontSize: 32 }} />
                    </div>
                    <Title level={4} className="text-slate-800">
                      No Records in Sourcing Queue
                    </Title>
                    <Paragraph className="text-slate-500 max-w-md mx-auto">
                      Department Canvass Requests (RFQs) created in Stage 1 automatically flow into this queue with status <strong>'Pending Canvass'</strong>.
                    </Paragraph>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {canvassingRecords.map((rec) => {
                      const budget = rec.total_estimated_budget || rec.total_amount || 0;
                      const bids = rec.supplier_bids || [];
                      const isReadyForCanvass = rec.status === "Ready for Canvass";
                      const isBidding = rec.status === "Bidding" || rec.status === "Canvassing / Bidding" || rec.status === "Canvassing";

                      return (
                        <Card
                          key={rec.id}
                          className="rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between"
                          styles={{ body: { padding: "16px", display: "flex", flexDirection: "column", height: "100%" } }}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {rec.pr_no || `PR-${rec.id}`}
                              </span>
                              <Tag color={isReadyForCanvass ? "blue" : "gold"}>
                                {rec.status}
                              </Tag>
                            </div>

                            <h4 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2">
                              {rec.title || rec.purpose || "Procurement Requisition"}
                            </h4>

                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1.5 mb-3">
                              <div className="flex items-center justify-between text-slate-600">
                                <span className="font-medium">{rec.department_name}</span>
                                <span className="text-slate-400">By: {rec.requested_by}</span>
                              </div>
                              <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-slate-500">Target Budget:</span>
                                <strong className="text-slate-900 font-bold text-sm">
                                  ₱{Number(budget).toLocaleString()}
                                </strong>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Supplier Bids:</span>
                                <span className="font-medium text-blue-700">
                                  {bids.length} quote(s) received
                                </span>
                              </div>
                            </div>

                            {rec.items && rec.items.length > 0 && (
                              <div className="text-xs text-slate-500 mb-3">
                                <span className="font-semibold text-slate-700 block mb-1">
                                  Requested Items ({rec.items.length}):
                                </span>
                                <div className="space-y-0.5 max-h-20 overflow-y-auto">
                                  {rec.items.slice(0, 3).map((it, idx) => (
                                    <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                                      <span className="truncate max-w-[170px]">• {it.item_name}</span>
                                      <span>{it.quantity} {it.unit || "pcs"}</span>
                                    </div>
                                  ))}
                                  {rec.items.length > 3 && (
                                    <div className="text-[10px] text-slate-400 italic">
                                      + {rec.items.length - 3} more line item(s)
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 mt-auto">
                            {isReadyForCanvass && (
                              <Button
                                size="small"
                                className="w-full bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                                icon={<ClockCircleOutlined />}
                                onClick={async () => {
                                  await startBidding(rec.id);
                                  message.success("Stage moved to 'Bidding'. Now receiving vendor quotations.");
                                }}
                              >
                                Move to Bidding
                              </Button>
                            )}

                            <div className="flex items-center gap-2">
                              {bids.length > 0 && (
                                <Button
                                  size="small"
                                  ghost
                                  type="primary"
                                  className="flex-1 text-xs"
                                  onClick={() => {
                                    setActiveCanvass(rec);
                                    setIsCompareModalOpen(true);
                                  }}
                                >
                                  Compare ({bids.length})
                                </Button>
                              )}
                              <Button
                                type="primary"
                                size="small"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center justify-center gap-1"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleOpenQuickAward(rec)}
                              >
                                Award Winning Bid
                              </Button>
                            </div>
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
            key: "all_rfqs",
            label: (
              <span className="font-semibold px-2 flex items-center gap-2">
                <AppstoreOutlined className="text-slate-600" />
                <span>All RFQs / History</span>
                <Badge
                  count={normalizedCanvasses.length}
                  style={{ backgroundColor: "#8c8c8c" }}
                  overflowCount={99}
                />
              </span>
            ),
            children: (
              viewMode === "kanban" ? (
                <KanbanBoard
                  columns={CANVASS_COLUMNS}
                  items={normalizedCanvasses}
                  onDragEnd={handleDragEnd}
                  onCardDrop={handleDragEnd}
                  renderCard={renderCanvassCard}
                  onCardClick={(item) => {
                    setActiveCanvass(item);
                    setIsDetailModalOpen(true);
                  }}
                />
              ) : (
                <Card className="rounded-xl border border-slate-200 bg-white p-0">
                  <Table
                    columns={tableColumns}
                    dataSource={normalizedCanvasses}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
              )
            ),
          },
          {
            key: "master_procurement_report",
            label: (
              <span className="font-semibold px-2 flex items-center gap-2">
                <FileTextOutlined className="text-emerald-600" />
                <span>Master Procurement Report</span>
                <Badge
                  count={masterProcurementRecords.length}
                  style={{ backgroundColor: "#059669" }}
                  overflowCount={999}
                />
              </span>
            ),
            children: (
              <div className="space-y-4">
                {/* Summary Metrics Bar */}
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-xs">
                      <Statistic
                        title={
                          <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                            <FileTextOutlined className="text-blue-600" />
                            Total University Transactions
                          </span>
                        }
                        value={masterProcurementRecords.length}
                        suffix={<span className="text-xs text-blue-600 font-normal">Requisitions</span>}
                        valueStyle={{ color: "#1d4ed8", fontWeight: 700 }}
                      />
                      <div className="text-xs text-blue-700/80 mt-1">
                        Across all colleges, units & departments
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-xs">
                      <Statistic
                        title={
                          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                            <ClockCircleOutlined className="text-amber-600" />
                            In Sourcing & Clearance
                          </span>
                        }
                        value={masterActiveSourcingCount}
                        suffix={<span className="text-xs text-amber-600 font-normal">Active</span>}
                        valueStyle={{ color: "#b45309", fontWeight: 700 }}
                      />
                      <div className="text-xs text-amber-700/80 mt-1">
                        Canvassing, bidding & finance verification
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-xs">
                      <Statistic
                        title={
                          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                            <SafetyCertificateOutlined className="text-emerald-600" />
                            POs Dispatched & Delivered
                          </span>
                        }
                        value={masterCompletedCount}
                        suffix={<span className="text-xs text-emerald-600 font-normal">Orders</span>}
                        valueStyle={{ color: "#047857", fontWeight: 700 }}
                      />
                      <div className="text-xs text-emerald-700/80 mt-1">
                        Purchase Orders executed or in delivery
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-xs">
                      <Statistic
                        title={
                          <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <DollarOutlined className="text-slate-600" />
                            Total Encumbered Budget
                          </span>
                        }
                        value={masterTotalEncumbered}
                        precision={2}
                        prefix={<span className="text-slate-600 mr-0.5">₱</span>}
                        valueStyle={{ color: "#1e293b", fontWeight: 700 }}
                      />
                      <div className="text-xs text-slate-500 mt-1">
                        Committed university procurement budget
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* Filter and Control Toolbar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Input
                      placeholder="Search PR, RFQ, Dept, Item, Supplier..."
                      prefix={<SearchOutlined className="text-slate-400" />}
                      value={reportSearchText}
                      onChange={(e) => setReportSearchText(e.target.value)}
                      style={{ width: 280 }}
                      allowClear
                    />

                    <Select
                      value={reportStatusFilter}
                      onChange={setReportStatusFilter}
                      style={{ width: 230 }}
                      placeholder="Filter by Status"
                    >
                      <Option value="all">All Pipeline Stages</Option>
                      <Option value="Pending Canvass">Pending Canvass</Option>
                      <Option value="Bidding">Bidding</Option>
                      <Option value="Bid Awarded - Pending PR">Bid Awarded - Pending PR</Option>
                      <Option value="Contested">Contested</Option>
                      <Option value="Pending Finance Approval">Pending Finance Approval</Option>
                      <Option value="Finance Approved - Pending VPASA">
                        Finance Approved - Pending VPASA
                      </Option>
                      <Option value="Ready for PO">Ready for PO</Option>
                      <Option value="PO Issued">PO Issued</Option>
                      <Option value="Sent to Supplier">Sent to Supplier</Option>
                      <Option value="In Transit">In Transit</Option>
                      <Option value="Partially Received">Partially Received</Option>
                      <Option value="Fully Received">Fully Received</Option>
                    </Select>

                    <Select
                      value={reportDeptFilter}
                      onChange={setReportDeptFilter}
                      style={{ width: 220 }}
                      placeholder="Filter by Department"
                    >
                      <Option value="all">All Departments</Option>
                      {departments.map((d) => (
                        <Option key={d.id} value={d.name || d.department_name}>
                          {d.name || d.department_name} ({d.code || d.abbr || "DEPT"})
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      icon={<FileExcelOutlined />}
                      className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-medium"
                      onClick={handleExportMasterCSV}
                    >
                      Export to CSV
                    </Button>
                  </div>
                </div>

                {/* Master Procurement Table */}
                <Card className="rounded-xl border border-slate-200 shadow-xs bg-white">
                  <Table
                    columns={masterReportColumns}
                    dataSource={masterProcurementRecords}
                    rowKey={(r) => r.id || r.pr_no || r.canvass_no || Math.random()}
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    locale={{
                      emptyText: "No procurement records match your search or filter criteria.",
                    }}
                  />
                </Card>
              </div>
            ),
          },
        ]}
      />

      {/* ==================== CREATE RFQ MODAL ==================== */}
      <CreateCanvassModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        departments={departments}
        onSuccess={fetchCanvasses}
      />

      {/* ==================== COMPARE BIDS SIDE-BY-SIDE MODAL ==================== */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-6">
            <div>
              <span className="text-base font-bold text-slate-900">
                Supplier Bid Comparison: {activeCanvass?.canvass_no}
              </span>
              <div className="text-xs text-slate-500 font-normal">
                {activeCanvass?.title}
              </div>
            </div>
            <Tag color="blue" className="text-xs font-mono">
              Budget: ₱{Number(activeCanvass?.total_estimated_budget || 0).toLocaleString()}
            </Tag>
          </div>
        }
        open={isCompareModalOpen}
        onCancel={() => setIsCompareModalOpen(false)}
        footer={null}
        width={980}
        destroyOnClose
      >
        {activeCanvass?.supplier_bids?.length === 0 ? (
          <Alert
            type="warning"
            showIcon
            message="No supplier bids received yet"
            description="Use the 'Add Bid' action to log quotations from interested suppliers."
          />
        ) : (
          <div className="space-y-4 py-2">
            <Paragraph className="text-xs text-slate-500 m-0">
              Compare quoted prices, delivery schedules, and warranty terms. Click{" "}
              <strong>Approve Bid</strong> on the winning proposal to automatically generate the linked Purchase Order.
            </Paragraph>

            {/* Side by side bid comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCanvass?.supplier_bids?.map((bid, idx) => {
                const isWinning = bid.status === "approved";
                const isRejected = bid.status === "rejected";
                const budgetDiff = Number(bid.bid_amount) - Number(activeCanvass.total_estimated_budget);
                const isUnderBudget = budgetDiff <= 0;

                return (
                  <Card
                    key={bid.id}
                    size="small"
                    className={`rounded-xl border relative transition-all ${
                      isWinning
                        ? "border-emerald-500 ring-2 ring-emerald-400 bg-emerald-50/20"
                        : isRejected
                        ? "border-red-200 bg-red-50/10 opacity-75"
                        : "border-slate-200 bg-white hover:border-blue-400 shadow-xs"
                    }`}
                  >
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                      {isWinning && (
                        <Tag color="green" icon={<CheckCircleOutlined />} className="m-0">
                          Awarded Winner
                        </Tag>
                      )}
                      {!isWinning &&
                        activeCanvass?.supplier_bids?.length > 1 &&
                        Number(bid.bid_amount) ===
                          Math.min(
                            ...activeCanvass.supplier_bids.map((b) => Number(b.bid_amount))
                          ) && (
                          <Tag color="cyan" icon={<TrophyOutlined />} className="m-0 text-[10px]">
                            Lowest Price
                          </Tag>
                        )}
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="pr-12">
                        <Text strong className="text-sm text-slate-900 block line-clamp-1">
                          {bid.supplier_name}
                        </Text>
                        <span className="text-[11px] text-slate-500 block">
                          Contact: {bid.contact_person}
                        </span>
                      </div>

                      {/* Bid Amount Highlight */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[11px] text-slate-500 block">Total Quoted Bid</span>
                        <div className="text-lg font-bold text-slate-900">
                          ₱{Number(bid.bid_amount).toLocaleString()}
                        </div>
                        <div className="text-[11px] mt-0.5">
                          {isUnderBudget ? (
                            <span className="text-emerald-600 font-medium">
                              ₱{Math.abs(budgetDiff).toLocaleString()} under budget
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">
                              ₱{budgetDiff.toLocaleString()} above budget
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="text-xs space-y-1 text-slate-600 pt-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Lead Time:</span>
                          <span className="font-medium">{bid.delivery_lead_time_days} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Est. Delivery:</span>
                          <span className="font-medium">{bid.delivery_date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Payment Terms:</span>
                          <span className="font-medium">{bid.payment_terms}</span>
                        </div>
                      </div>

                      {/* Remarks */}
                      {bid.remarks && (
                        <div className="p-2 rounded bg-amber-50/60 border border-amber-100 text-[11px] text-amber-900 line-clamp-2">
                          {bid.remarks}
                        </div>
                      )}

                      {/* Itemized pricing breakdown */}
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Itemized Quotation:
                        </span>
                        <div className="space-y-1 text-[11px] max-h-32 overflow-y-auto">
                          {bid.item_bids?.map((ib, iIdx) => (
                            <div key={iIdx} className="flex justify-between border-b border-slate-50 pb-0.5">
                              <span className="text-slate-600 truncate max-w-[130px]" title={ib.item_name}>
                                {ib.item_name}
                              </span>
                              <span className="font-mono text-slate-800">
                                ₱{Number(ib.unit_price).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 border-t border-slate-100 space-y-1.5">
                        {isWinning ? (
                          <>
                            <Button
                              block
                              disabled
                              icon={<CheckCircleOutlined />}
                              className="bg-emerald-50 text-emerald-700 border-emerald-300 font-medium"
                            >
                              Winning Bid Awarded
                            </Button>
                            <Button
                              block
                              size="small"
                              type="link"
                              icon={<ArrowRightOutlined />}
                              className="text-xs text-blue-600 font-medium p-0"
                              onClick={() => {
                                setIsCompareModalOpen(false);
                                navigate("/finance-approval");
                              }}
                            >
                              Open in Finance Approval
                            </Button>
                          </>
                        ) : activeCanvass.winning_bid_id ? (
                          <Button block disabled>
                            Another Bid Awarded
                          </Button>
                        ) : (
                          <>
                            <Button
                              type="primary"
                              block
                              icon={<CheckCircleOutlined />}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              onClick={() => handleSelectWinningBid(activeCanvass, bid)}
                            >
                              Award Winner (Submit to Finance)
                            </Button>
                            <Button
                              type="link"
                              block
                              size="small"
                              className="text-xs text-slate-500 hover:text-blue-600 p-0"
                              onClick={() => handleApproveBid(activeCanvass, bid)}
                            >
                              Directly Generate PO (Admin Bypass)
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* ==================== ADD SUPPLIER BID MODAL ==================== */}
      <AddBidModal
        open={isAddBidModalOpen}
        onCancel={() => setIsAddBidModalOpen(false)}
        onSuccess={fetchCanvasses}
        activeCanvass={activeCanvass}
        suppliers={suppliers}
      />

      {/* ==================== CANVASS DETAILS MODAL ==================== */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-8">
            <span className="font-bold text-slate-800">
              {activeCanvass?.canvass_no}: {activeCanvass?.title}
            </span>
            <AttachmentBadge count={activeCanvass?.attachments?.length || 0} showLabel />
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="compare"
            type="primary"
            disabled={!activeCanvass?.supplier_bids?.length}
            onClick={() => {
              setIsDetailModalOpen(false);
              setIsCompareModalOpen(true);
            }}
          >
            Compare Bids ({activeCanvass?.supplier_bids?.length || 0})
          </Button>,
        ]}
        width={780}
      >
        {activeCanvass && (
          <Tabs
            defaultActiveKey="overview"
            items={[
              {
                key: "overview",
                label: "Requisition & Line Items",
                children: (
                  <div className="space-y-4 pt-1">
                    <Descriptions size="small" bordered column={2}>
                      <Descriptions.Item label="Status">
                        <Tag color={CANVASS_COLUMNS.find((c) => c.id === normalizeCanvassStatus(activeCanvass.status))?.color}>
                          {normalizeCanvassStatus(activeCanvass.status)}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Priority">
                        <Tag color={activeCanvass.priority === "Urgent" ? "red" : "blue"}>
                          {activeCanvass.priority}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Department">
                        {activeCanvass.department_name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Requested By">
                        {activeCanvass.requested_by}
                      </Descriptions.Item>
                      <Descriptions.Item label="RFQ Date">
                        {activeCanvass.rfq_date}
                      </Descriptions.Item>
                      <Descriptions.Item label="Deadline">
                        {activeCanvass.deadline}
                      </Descriptions.Item>
                      <Descriptions.Item label="Total Budget">
                        <span className="font-bold text-slate-800">
                          ₱{Number(activeCanvass.total_estimated_budget).toLocaleString()}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Pipeline Links">
                        <Space>
                          {activeCanvass.pr_no && (
                            <Tag color="cyan" className="font-mono text-xs">
                              PR: {activeCanvass.pr_no}
                            </Tag>
                          )}
                          {activeCanvass.po_no && (
                            <Tag color="green" className="font-mono text-xs">
                              PO: {activeCanvass.po_no}
                            </Tag>
                          )}
                          {!activeCanvass.pr_no && !activeCanvass.po_no && (
                            <span className="text-xs text-slate-400">In Sourcing Stage</span>
                          )}
                        </Space>
                      </Descriptions.Item>
                    </Descriptions>

                    <Divider orientation="left" className="text-xs text-slate-500 m-0">
                      Requisition Items
                    </Divider>

                    <Table
                      size="small"
                      dataSource={activeCanvass.items}
                      rowKey="id"
                      pagination={false}
                      columns={[
                        { title: "Item Name", dataIndex: "item_name", key: "item_name" },
                        { title: "Description", dataIndex: "description", key: "description" },
                        { title: "Qty", dataIndex: "quantity", key: "quantity" },
                        { title: "Unit", dataIndex: "unit", key: "unit" },
                        {
                          title: "Est. Unit Price",
                          dataIndex: "estimated_unit_cost",
                          key: "estimated_unit_cost",
                          render: (val) => `₱${Number(val).toLocaleString()}`,
                        },
                      ]}
                    />
                  </div>
                ),
              },
              {
                key: "evidence",
                label: (
                  <span className="flex items-center gap-1.5">
                    <PaperClipOutlined />
                    <span>Evidence & Attachments</span>
                    <Badge
                      count={activeCanvass.attachments?.length || 0}
                      style={{ backgroundColor: activeCanvass.attachments?.length ? "#52c41a" : "#d9d9d9" }}
                      size="small"
                    />
                  </span>
                ),
                children: (
                  <EvidenceAttachmentTab
                    module="canvasses"
                    recordId={activeCanvass.id}
                    attachments={activeCanvass.attachments || []}
                    currentStage="Canvass"
                    onAttachmentChange={(newAttachments) => {
                      setActiveCanvass((prev) => ({
                        ...prev,
                        attachments: newAttachments,
                      }));
                      setCanvasses((prev) =>
                        prev.map((c) =>
                          c.id === activeCanvass.id
                            ? { ...c, attachments: newAttachments }
                            : c
                        )
                      );
                    }}
                  />
                ),
              },
              {
                key: "trail",
                label: (
                  <span className="flex items-center gap-1.5">
                    <HistoryOutlined />
                    <span>Audit Trail</span>
                    <Badge
                      count={activeCanvass.trail?.length || 0}
                      style={{ backgroundColor: "#1890ff" }}
                      size="small"
                    />
                  </span>
                ),
                children: (
                  <div className="pt-2">
                    <RequestTrailTimeline
                      trail={activeCanvass.trail || []}
                      title={`Canvass ${activeCanvass.canvass_no} Trail`}
                    />
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>

      {/* ==================== QUICK AWARD WINNING BID MODAL ==================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircleOutlined />
            <span>Award Winning Vendor & Proceed to Purchase Order</span>
          </div>
        }
        open={awardModalVisible}
        onCancel={() => {
          setAwardModalVisible(false);
          setRecordToAward(null);
        }}
        onOk={handleConfirmQuickAward}
        okText="Confirm Award & Move to PO"
        okButtonProps={{ className: "bg-emerald-600 hover:bg-emerald-700 text-white", loading: awardLoading }}
        destroyOnClose
        width={560}
      >
        <div className="space-y-3 py-2">
          <Alert
            type="info"
            showIcon
            message="Pipeline Status Update: 'Ready for PO'"
            description="Awarding this quotation marks the Requisition status as 'Ready for PO'. This immediately clears it from the Sourcing Queue and queues it in the Purchase Order module for official PO document generation."
          />

          {recordToAward && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Requisition No:</span>
                <span className="font-mono font-bold text-slate-800">{recordToAward.pr_no || `PR-${recordToAward.id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-medium text-slate-800">{recordToAward.department_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approved Budget:</span>
                <span className="font-bold text-slate-900">
                  ₱{Number(recordToAward.total_estimated_budget || recordToAward.total_amount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <Form form={awardForm} layout="vertical" size="middle">
            <Form.Item
              name="supplier_name"
              label="Awarded Supplier / Vendor"
              rules={[{ required: true, message: "Please enter or select winning vendor" }]}
            >
              <Select
                showSearch
                placeholder="Select or type vendor name"
                optionFilterProp="children"
              >
                {suppliers.map((s) => (
                  <Select.Option key={s.id} value={s.supplier_name || s.name}>
                    {s.supplier_name || s.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="bid_amount"
                  label="Final Award Amount (₱)"
                  rules={[{ required: true, message: "Please specify award amount" }]}
                >
                  <InputNumber
                    min={0}
                    className="w-full"
                    formatter={(value) => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => value.replace(/\₱\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="delivery_lead_time_days"
                  label="Delivery Lead Time (Days)"
                  rules={[{ required: true, message: "Specify lead time" }]}
                >
                  <InputNumber min={1} max={365} className="w-full" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="remarks" label="Award Justification / Remarks">
              <Input.TextArea
                rows={2}
                placeholder="Lowest responsive quotation meeting all technical specifications..."
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* PMO Master Report Audit Trail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined className="text-blue-600" />
            <span className="font-bold text-slate-800">
              Procurement Audit Trail — {auditTrailModalRecord?.pr_no || auditTrailModalRecord?.canvass_no || "Transaction"}
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
        width={680}
      >
        <div className="py-2">
          <RequestTrailTimeline
            trail={auditTrailModalRecord?.trail || []}
            title={`Lifecycle Audit Trail: ${auditTrailModalRecord?.pr_no || auditTrailModalRecord?.canvass_no || "Procurement Lifecycle"}`}
          />
        </div>
      </Modal>

      {/* ==================== KANBAN STAGE TRANSITION CONFIRMATION MODAL ==================== */}
      <KanbanTransitionModal
        open={!!pendingStatusChange}
        item={pendingRecord}
        sourceStatus={pendingRecord?.status}
        targetStatus={pendingStatusChange?.newStatus}
        moduleName="Canvassing (RFQ)"
        loading={transitionLoading}
        onAccept={handleConfirmTransition}
        onCancel={handleCancelTransition}
      />
    </div>
  );
}

// Subcomponent: Create Canvass / RFQ Modal with hooked Form
function CreateCanvassModal({ open, onCancel, departments, onSuccess }) {
  if (!open) return null;
  return (
    <CreateCanvassModalInner
      open={open}
      onCancel={onCancel}
      departments={departments}
      onSuccess={onSuccess}
    />
  );
}

function CreateCanvassModalInner({ open, onCancel, departments, onSuccess }) {
  const { message } = App.useApp();
  const [createForm] = Form.useForm();
  const watchedDeptId = Form.useWatch("department_id", createForm);
  const watchedItems = Form.useWatch("items", createForm) || [];

  const formatPHP = (val) => {
    const num = Number(val || 0);
    return `₱${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const estimatedRequisitionTotal = useMemo(() => {
    return watchedItems.reduce((sum, it) => {
      const qty = Number(it?.quantity) || 0;
      const cost = Number(it?.estimated_unit_cost) || 0;
      return sum + qty * cost;
    }, 0);
  }, [watchedItems]);

  const [selectedDeptBudget, setSelectedDeptBudget] = useState(() => {
    const defaultDept = departments[0];
    if (defaultDept) {
      const allocated = Number(defaultDept.allocated_amount ?? defaultDept.budget_allocated ?? 0);
      const utilized = Number(defaultDept.utilized_amount ?? defaultDept.budget_utilized ?? 0);
      const currentBalance = Number(defaultDept.remaining_balance ?? defaultDept.budget_remaining ?? (allocated - utilized));
      return {
        department_id: defaultDept.id,
        department_name: defaultDept.department_name || defaultDept.name || `Department #${defaultDept.id}`,
        allocated_amount: allocated,
        utilized_amount: utilized,
        remaining_balance: currentBalance,
        projected_balance: currentBalance,
      };
    }
    return {
      department_id: null,
      department_name: "",
      allocated_amount: 0,
      utilized_amount: 0,
      remaining_balance: 0,
      projected_balance: 0,
    };
  });

  const handleDepartmentChange = (deptId) => {
    const targetId = Number(deptId);
    const foundDept = departments.find((d) => d.id === targetId || d.id === deptId);
    if (foundDept) {
      const allocated = Number(foundDept.allocated_amount ?? foundDept.budget_allocated ?? 0);
      const utilized = Number(foundDept.utilized_amount ?? foundDept.budget_utilized ?? 0);
      const currentBalance = Number(foundDept.remaining_balance ?? foundDept.budget_remaining ?? (allocated - utilized));
      const projected = currentBalance - estimatedRequisitionTotal;
      const deptName = foundDept.department_name || foundDept.name || `Department #${foundDept.id}`;

      setSelectedDeptBudget({
        department_id: foundDept.id,
        department_name: deptName,
        allocated_amount: allocated,
        utilized_amount: utilized,
        remaining_balance: currentBalance,
        projected_balance: projected,
      });
    }
  };

  useEffect(() => {
    if (watchedDeptId) {
      handleDepartmentChange(watchedDeptId);
    }
  }, [watchedDeptId]);

  const currentProjectedBalance = (selectedDeptBudget.remaining_balance || 0) - estimatedRequisitionTotal;
  const isBudgetExceeded =
    Boolean(selectedDeptBudget.department_id) &&
    estimatedRequisitionTotal > (selectedDeptBudget.remaining_balance || 0);

  const handleCreateSubmit = async (values) => {
    try {
      const selectedDeptObj = departments.find((d) => d.id === values.department_id);
      const payload = {
        title: values.title,
        department_id: values.department_id,
        department_name:
          selectedDeptObj?.department_name ||
          selectedDeptObj?.name ||
          selectedDeptBudget?.department_name ||
          "PMO Office",
        requested_by: values.requested_by,
        priority: values.priority,
        deadline: values.deadline.format("YYYY-MM-DD"),
        notes: values.notes,
        status: "Draft",
        items: values.items || [],
      };

      const res = await axios.post("/api/canvasses", payload);
      message.success(res.data?.message || "Canvass created successfully!");
      onCancel();
      onSuccess();
    } catch (err) {
      console.error("Failed to create canvass:", err);
      message.error("Failed to create canvass.");
    }
  };

  return (
    <Modal
      title="Create Requisition / RFQ (Budget-Linked Multi-Item Request)"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={760}
      destroyOnClose
    >
      <Form
        form={createForm}
        layout="vertical"
        onFinish={handleCreateSubmit}
        initialValues={{
          priority: "Medium",
          deadline: dayjs().add(14, "day"),
          department_id: departments[0]?.id || 1,
          items: [
            {
              item_name: "",
              description: "",
              quantity: 1,
              unit: "Units",
              estimated_unit_cost: 0,
            },
          ],
        }}
      >
        <Form.Item
          name="title"
          label="Requisition / Canvass Title"
          rules={[{ required: true, message: "Please enter canvass title" }]}
        >
          <Input placeholder="e.g. Procurement of Chemistry Lab Glassware & Reagents" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="department_id"
              label="Requesting Department"
              rules={[{ required: true, message: "Please select requesting department" }]}
            >
              <Select
                placeholder="Select requesting department"
                showSearch
                optionFilterProp="label"
                onChange={handleDepartmentChange}
                options={departments.map((d) => {
                  const deptLabel = d.department_name || d.name || `Department #${d.id}`;
                  return {
                    value: d.id,
                    label: deptLabel,
                  };
                })}
              >
                {departments.map((d) => {
                  const deptLabel = d.department_name || d.name || `Department #${d.id}`;
                  return (
                    <Option key={d.id} value={d.id} label={deptLabel}>
                      {deptLabel}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="requested_by"
              label="Requested By / Point of Contact"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. Dr. Rachel Soriano" />
            </Form.Item>
          </Col>
        </Row>

        {/* Live Department Budget Gatekeeper Clearance Preview */}
        {selectedDeptBudget.department_id && (
          <div className="mb-4 p-3.5 rounded-xl border border-slate-200 bg-slate-50/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BankOutlined className="text-blue-600" />
                <span className="font-semibold text-xs text-slate-800">
                  {selectedDeptBudget.department_name} — Real-Time Budget Status
                </span>
              </div>
              <Tag
                color={isBudgetExceeded ? "error" : "success"}
                className="m-0 font-medium"
              >
                {isBudgetExceeded ? "Exceeds Remaining Balance" : "Budget Cleared"}
              </Tag>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Allocated Budget</span>
                <span className="font-semibold text-slate-800">
                  {formatPHP(selectedDeptBudget.allocated_amount)}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Utilized to Date</span>
                <span className="font-semibold text-slate-600">
                  {formatPHP(selectedDeptBudget.utilized_amount)}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Current Balance</span>
                <span className="font-bold text-emerald-700">
                  {formatPHP(selectedDeptBudget.remaining_balance)}
                </span>
              </div>
              <div
                className={`p-2 rounded-lg border ${
                  isBudgetExceeded
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
              >
                <span className="block text-[10px] opacity-80">Projected Balance</span>
                <span className="font-bold">
                  {currentProjectedBalance < 0
                    ? `-${formatPHP(Math.abs(currentProjectedBalance))}`
                    : formatPHP(currentProjectedBalance)}
                </span>
              </div>
            </div>

            {isBudgetExceeded && (
              <Alert
                type="warning"
                showIcon
                className="mt-2.5 text-xs py-1"
                message="Requisition Exceeds Available Department Balance"
                description={`This requisition total (${formatPHP(estimatedRequisitionTotal)}) exceeds ${selectedDeptBudget.department_name}'s remaining balance (${formatPHP(
                  selectedDeptBudget.remaining_balance
                )}) by ${formatPHP(Math.abs(currentProjectedBalance))}. You may still initiate canvassing; once vendor quotes are evaluated, Finance Gatekeeper review will require line-item quantity or price adjustments before a Purchase Order can be issued.`}
              />
            )}
          </div>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="priority" label="Priority Level">
              <Select>
                <Option value="Low">Low</Option>
                <Option value="Medium">Medium</Option>
                <Option value="High">High</Option>
                <Option value="Urgent">Urgent</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="deadline"
              label="Submission Deadline"
              rules={[{ required: true }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" className="text-xs text-slate-500">
          Requisition Items & Estimated Budget
        </Divider>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <div className="space-y-3">
              {fields.map(({ key, name, ...restField }, idx) => (
                <Card key={key} size="small" className="bg-slate-50 border border-slate-200">
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "item_name"]}
                        label={`Item #${idx + 1} Name`}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input placeholder="e.g. Dell Workstation Core i7" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        label="Qty"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={1} className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item {...restField} name={[name, "unit"]} label="Unit">
                        <Select>
                          <Option value="Units">Units</Option>
                          <Option value="Pieces">Pieces</Option>
                          <Option value="Boxes">Boxes</Option>
                          <Option value="Sets">Sets</Option>
                          <Option value="Rolls">Rolls</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "estimated_unit_cost"]}
                        label="Est. Cost (₱)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="w-full" />
                      </Form.Item>
                    </Col>
                  </Row>
                  {fields.length > 1 && (
                    <Button
                      type="link"
                      danger
                      size="small"
                      onClick={() => remove(name)}
                      className="p-0"
                    >
                      Remove Item
                    </Button>
                  )}
                </Card>
              ))}

              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Add Another Item
              </Button>
            </div>
          )}
        </Form.List>

        <Form.Item name="notes" label="Special Instructions / BAC Notes" className="mt-4">
          <Input.TextArea rows={2} placeholder="e.g. Include 2-year warranty and on-site delivery to 3rd floor." />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Save & Create RFQ
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

// Subcomponent: Add Supplier Bid Modal with hooked Form
function AddBidModal({ open, onCancel, onSuccess, activeCanvass, suppliers }) {
  if (!open || !activeCanvass) return null;
  return (
    <AddBidModalInner
      open={open}
      onCancel={onCancel}
      onSuccess={onSuccess}
      activeCanvass={activeCanvass}
      suppliers={suppliers}
    />
  );
}

function AddBidModalInner({ open, onCancel, onSuccess, activeCanvass, suppliers }) {
  const { message } = App.useApp();
  const [bidForm] = Form.useForm();

  const handleAddBidSubmit = async (values) => {
    try {
      const selectedSupplier = suppliers.find((s) => s.id === values.supplier_id);
      const payload = {
        supplier_id: values.supplier_id,
        supplier_name: selectedSupplier?.name || "Independent Supplier",
        contact_person: values.contact_person || selectedSupplier?.contact_person || "",
        email: values.email || selectedSupplier?.email || "",
        phone: values.phone || selectedSupplier?.phone || "",
        bid_amount: values.bid_amount,
        payment_terms: values.payment_terms || "Net 30 Days",
        delivery_lead_time_days: values.delivery_lead_time_days || 7,
        delivery_date: values.delivery_date
          ? values.delivery_date.format("YYYY-MM-DD")
          : dayjs().add(7, "day").format("YYYY-MM-DD"),
        remarks: values.remarks,
        item_bids: (activeCanvass.items || []).map((item, idx) => ({
          item_id: item.id,
          item_name: item.item_name,
          unit_price: values[`item_price_${item.id}`] || (values.bid_amount / activeCanvass.items.length),
          total_price: (values[`item_price_${item.id}`] || (values.bid_amount / activeCanvass.items.length)) * item.quantity,
          brand_model: values[`item_brand_${item.id}`] || "Quoted Spec",
        })),
      };

      await axios.post(`/api/canvasses/${activeCanvass.id}/bids`, payload);
      message.success("Supplier bid recorded successfully!");
      onCancel();
      onSuccess();
    } catch (err) {
      console.error("Failed to add bid:", err);
      message.error("Failed to add supplier bid.");
    }
  };

  return (
    <Modal
      title={`Add Supplier Bid for ${activeCanvass?.canvass_no}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={650}
      destroyOnClose
    >
      <Form
        form={bidForm}
        layout="vertical"
        onFinish={handleAddBidSubmit}
        initialValues={{
          delivery_lead_time_days: 7,
          delivery_date: dayjs().add(7, "day"),
        }}
      >
        <Form.Item
          name="supplier_id"
          label="Registered Supplier"
          rules={[{ required: true, message: "Please select supplier" }]}
        >
          <Select
            placeholder="Select supplier"
            onChange={(supId) => {
              const sup = suppliers.find((s) => s.id === supId);
              if (sup) {
                bidForm.setFieldsValue({
                  contact_person: sup.contact_person,
                  email: sup.email,
                  phone: sup.phone,
                  payment_terms: sup.terms,
                });
              }
            }}
          >
            {suppliers.map((s) => (
              <Option key={s.id} value={s.id}>
                {s.name} ({s.terms})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="contact_person" label="Contact Person">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="phone" label="Phone / Mobile">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="bid_amount"
              label="Total Bid Amount (₱)"
              rules={[{ required: true, message: "Enter total bid" }]}
            >
              <InputNumber min={0} className="w-full" placeholder="e.g. 175000" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="payment_terms" label="Offered Payment Terms">
              <Input placeholder="e.g. Net 30 Days" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="delivery_lead_time_days" label="Lead Time (Days)">
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="delivery_date" label="Commitment Delivery Date">
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="remarks" label="Bidder Remarks / Warranty Terms">
          <Input.TextArea rows={2} placeholder="Warranty period, inclusions, and terms." />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Submit Supplier Bid
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
