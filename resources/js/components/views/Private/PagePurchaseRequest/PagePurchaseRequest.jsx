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
  Radio,
  Tooltip,
  Alert,
  Row,
  Col,
  Statistic,
  Tabs,
  Steps,
  Segmented,
  Popconfirm,
  message,
  notification,
} from "antd";
import {
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PaperClipOutlined,
  CheckOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  TeamOutlined,
  HistoryOutlined,
  AuditOutlined,
  SafetyCertificateOutlined,
  BranchesOutlined,
  ThunderboltOutlined,
  SolutionOutlined,
  EditOutlined,
  UserOutlined,
  SafetyOutlined,
  GlobalOutlined,
  LockOutlined,
  SyncOutlined,
  RollbackOutlined,
  CheckSquareOutlined,
  CloseCircleOutlined,
  BankOutlined,
  FilterOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import KanbanBoard, { AttachmentBadge } from "../../../common/KanbanBoard";
import EvidenceAttachmentTab from "../../../common/EvidenceAttachmentTab";
import KanbanTransitionModal from "../../../common/KanbanTransitionModal";
import RequestTrailTimeline from "../../../common/RequestTrailTimeline";
import ModalResubmitPR from "./components/ModalResubmitPR";
import ModalRequestRevision from "./components/ModalRequestRevision";
import { useProcurementRealtime } from "../../../providers/ProcurementRealtimeProvider";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Department Module workflow columns: displays all requests initiated by that department
// Department Module workflow columns reflecting the 6-stage pipeline:
// Canvassing comes BEFORE Purchase Request and Finance Approval.
export const DEPARTMENT_PR_COLUMNS = [
  {
    id: "Pending Canvass",
    title: "Stage 1: RFQ Initiated",
    color: "#64748b",
    icon: <FileTextOutlined />,
    description: "Request for Canvass submitted to VPASA for supplier sourcing",
  },
  {
    id: "Bid Awarded - Pending PR",
    title: "Stage 3: Ready to Draft PR",
    color: "#08979c",
    icon: <CheckCircleOutlined />,
    description: "Supplier quote awarded — Department generates formal PR",
  },
  {
    id: "Contested",
    title: "Bid Contested",
    color: "#d97706",
    icon: <ExclamationCircleOutlined />,
    description: "Awarded bid contested by department with justification",
  },
  {
    id: "Pending Finance Approval",
    title: "Stage 4: Finance Approval",
    color: "#fa8c16",
    icon: <DollarOutlined />,
    description: "Budget clearance & finance verification against awarded bid",
  },
  {
    id: "Finance Approved - Pending VPASA",
    title: "Stage 5: VPASA Sign-off",
    color: "#722ed1",
    icon: <SafetyCertificateOutlined />,
    description: "Budget certified, awaiting executive authorization",
  },
  {
    id: "Ready for PO",
    title: "Stage 5: Ready for PO",
    color: "#1890ff",
    icon: <ClockCircleOutlined />,
    description: "Executive authorized, ready for PO document generation",
  },
  {
    id: "PO Issued",
    title: "Stage 6: PO Issued",
    color: "#52c41a",
    icon: <CheckCircleOutlined />,
    description: "Purchase Order issued & dispatched",
  },
];

// Finance Module workflow columns: "The Finance Module should only display requests that are 'Pending Finance Approval'."
export const FINANCE_PR_COLUMNS = [
  {
    id: "Pending Finance Approval",
    title: "Awaiting Finance Review",
    color: "#fa8c16",
    icon: <DollarOutlined />,
    description: "Requisitions requiring budget verification",
  },
  {
    id: "Finance Approved - Pending VPASA",
    title: "Approve (Send to VPASA)",
    color: "#52c41a",
    icon: <CheckCircleOutlined />,
    description: "Drop to approve budget & advance to VPASA Executive Authorization",
  },
  {
    id: "Needs Revision",
    title: "Return for Revision",
    color: "#d97706",
    icon: <ExclamationCircleOutlined />,
    description: "Drop to return requisition to department for adjustment",
  },
];

// Backward-compatibility exports
export const STANDARD_PR_COLUMNS = DEPARTMENT_PR_COLUMNS;

// HR & Training Services custom management approval sequence
export const HR_TRAINING_PR_COLUMNS = [
  { id: "Pending Dept Head", title: "Pending Dept Head", color: "#722ed1", icon: <TeamOutlined /> },
  { id: "Pending HR", title: "Pending HR", color: "#eb2f96", icon: <AuditOutlined /> },
  { id: "Pending Finance", title: "Pending Finance", color: "#fa8c16", icon: <DollarOutlined /> },
  { id: "Pending VP Acad / VPAsa", title: "Pending VP Acad / VPAsa", color: "#1890ff", icon: <SafetyCertificateOutlined /> },
  { id: "Approved PR", title: "Approved (Budget Released)", color: "#52c41a", icon: <CheckCircleOutlined /> },
];

export const ALL_PR_COLUMNS = DEPARTMENT_PR_COLUMNS;
export const PR_COLUMNS = ALL_PR_COLUMNS;

export const normalizePRStatus = (status) => {
  if (!status) return "Pending Canvass";
  const s = String(status).trim();
  if (
    s === "Pending Canvass" ||
    s === "New Purchase Request" ||
    s === "Draft" ||
    s === "Draft PR" ||
    s === "Submitted PR" ||
    s === "Pending Department Approval" ||
    s === "Pending Dept Head" ||
    s === "Canvassing / Bidding" ||
    s === "Canvassing" ||
    s === "Bidding" ||
    s === "Seeking Bids" ||
    s === "In Progress" ||
    s === "Under Review"
  ) {
    return "Pending Canvass";
  }
  if (
    s === "Bid Awarded - Pending PR" ||
    s === "Bid Awarded" ||
    s === "Winning Bid Selected"
  ) {
    return "Bid Awarded - Pending PR";
  }
  if (s === "Contested") {
    return "Contested";
  }
  if (
    s === "Pending Finance Approval" ||
    s === "Pending Finance Review" ||
    s === "Budget Review" ||
    s === "Pending Finance" ||
    s === "Pending HR" ||
    s === "Pending VP Acad / VPAsa"
  ) {
    return "Pending Finance Approval";
  }
  if (
    s === "Finance Approved - Pending VPASA" ||
    s === "Finance Approved"
  ) {
    return "Finance Approved - Pending VPASA";
  }
  if (
    s === "Ready for PO" ||
    s === "Ready for Canvass"
  ) {
    return "Ready for PO";
  }
  if (
    s === "PO Issued" ||
    s === "Purchase Order Issued" ||
    s === "Approved" ||
    s === "Approved PR" ||
    s === "PO Ready"
  ) {
    return "PO Issued";
  }
  if (
    s === "Needs Revision" ||
    s === "Revision Required" ||
    s === "Over Budget (Needs Revision)"
  ) {
    return "Needs Revision";
  }
  return s;
};

export const hasPassedFinanceApproval = (item) => {
  if (!item) return false;
  if (item.finance_approved_at || item.finance_approved_at_time) return true;
  if (item.finance_status === "Finance Approved") return true;
  if (item.finance_approved_by) return true;
  if (item.approvals && Array.isArray(item.approvals)) {
    const fin = item.approvals.find(
      (a) => a.role === "Finance" || a.role_title?.toLowerCase().includes("finance")
    );
    if (fin && fin.status === "approved") return true;
  }
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

export default function PagePurchaseRequest() {
  const { message, notification } = App.useApp();

  // Real-time synchronization state via ProcurementRealtimeProvider (SSE + BroadcastChannel)
  const {
    purchaseRequests,
    unifiedRecords,
    departmentRFQRecords,
    prDraftingRecords,
    financePendingRecords,
    vpasaPendingRecords,
    readyForPORecords,
    createRequestForCanvass,
    submitFormalPR,
    contestBid,
    departments: contextDepartments,
    loading: realtimeLoading,
    activeModule,
    setActiveModule,
    activeRole,
    setActiveRole,
    currentUser,
    selectedDepartmentId,
    setSelectedDepartmentId,
    updatePRStatus,
    approvePR,
    requestRevision,
    resubmitPR,
    refresh,
    refreshAll,
  } = useProcurementRealtime();

  const fetchPurchaseRequests = async () => {
    if (typeof refresh === "function") {
      await refresh();
    } else if (typeof refreshAll === "function") {
      await refreshAll();
    }
  };

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "table"
  const [workflowView, setWorkflowView] = useState("all"); // "all" | "pmo" | "hr_training"
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  // Stage 3: Formal PR Drafting & Contest Modals
  const [isDraftPRModalOpen, setIsDraftPRModalOpen] = useState(false);
  const [draftingRecord, setDraftingRecord] = useState(null);
  const [draftForm] = Form.useForm();
  const [draftingLoading, setDraftingLoading] = useState(false);

  const [isContestModalOpen, setIsContestModalOpen] = useState(false);
  const [contestingRecord, setContestingRecord] = useState(null);
  const [contestForm] = Form.useForm();
  const [contestingLoading, setContestingLoading] = useState(false);

  // Active top-level Tab: "all" | "stage3_drafting" | "table"
  const [activeMainTab, setActiveMainTab] = useState("all");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activePR, setActivePR] = useState(null);

  // Digital Signature Modal state for Management Approval Checklist
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signingTarget, setSigningTarget] = useState(null); // { pr, approval }

  // Kanban Drag-and-Drop & List View Dropdown Confirmation Interception
  const [pendingStatusChange, setPendingStatusChange] = useState(null); // { recordId, newStatus }
  const [transitionLoading, setTransitionLoading] = useState(false);

  // Revision & Resubmit Modals
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionTargetRecord, setRevisionTargetRecord] = useState(null);
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [resubmitTargetRecord, setResubmitTargetRecord] = useState(null);

  // Stage 3 Action: Open Draft Formal PR Modal
  const handleOpenDraftPRModal = (record) => {
    setDraftingRecord(record);
    draftForm.setFieldsValue({
      purpose: record.purpose || record.title || "Formal Purchase Request for awarded items",
      notes: `Formal PR drafted from winning quotation by ${record.winning_supplier || record.supplier_name || "Awarded Vendor"}. Ready for finance budget review.`,
    });
    setIsDraftPRModalOpen(true);
  };

  // Stage 3 Action: Submit Formal PR -> status transitions to 'Pending Finance Approval'
  const handleConfirmSubmitFormalPR = async () => {
    try {
      const values = await draftForm.validateFields();
      if (!draftingRecord) return;
      setDraftingLoading(true);

      await submitFormalPR(draftingRecord.id, values.notes || values.purpose);

      notification.success({
        message: "Formal Purchase Request Generated!",
        description: (
          <div>
            <p>
              Requisition for <strong>{draftingRecord.winning_supplier || draftingRecord.supplier_name}</strong> submitted.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Status updated to <strong>'Pending Finance Approval'</strong> (Stage 4). Queued for Finance Gatekeeper budget verification.
            </p>
          </div>
        ),
        duration: 6,
      });

      setIsDraftPRModalOpen(false);
      setDraftingRecord(null);
      fetchPurchaseRequests();
    } catch (err) {
      console.error("Failed to submit formal PR:", err);
      message.error("Failed to submit formal Purchase Request.");
    } finally {
      setDraftingLoading(false);
    }
  };

  // Stage 3 Action: Open Contest Modal
  const handleOpenContestModal = (record) => {
    setContestingRecord(record);
    contestForm.setFieldsValue({
      contest_justification: "",
    });
    setIsContestModalOpen(true);
  };

  // Stage 3 Action: Submit Contest -> status transitions to 'Contested'
  const handleConfirmContestBid = async () => {
    try {
      const values = await contestForm.validateFields();
      if (!contestingRecord) return;
      setContestingLoading(true);

      await contestBid(contestingRecord.id, values.contest_justification);

      notification.warning({
        message: "Bid Award Contested",
        description: (
          <div>
            <p>
              Contestation filed for <strong>{contestingRecord.pr_no || contestingRecord.title}</strong>.
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Status transitioned to <strong>'Contested'</strong>. Your justification has been logged in the audit trail.
            </p>
          </div>
        ),
        duration: 6,
      });

      setIsContestModalOpen(false);
      setContestingRecord(null);
      fetchPurchaseRequests();
    } catch (err) {
      console.error("Failed to contest bid:", err);
      message.error("Failed to register bid contestation.");
    } finally {
      setContestingLoading(false);
    }
  };

  // Determine if current active role is Finance
  const isFinanceUser =
    currentUser?.role === "Finance" ||
    activeRole === "Finance";

  useEffect(() => {
    if (contextDepartments && contextDepartments.length > 0) {
      setDepartments(contextDepartments);
    } else {
      axios
        .get("/api/departments")
        .then((res) => {
          if (res.data?.data) {
            setDepartments(res.data.data);
          }
        })
        .catch(console.error);
    }
  }, [contextDepartments]);

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

    const normTarget = normalizePRStatus(newStatus);
    if (!normTarget) return;

    const record = purchaseRequests.find(
      (p) => String(p.id) === String(recordId) || p.pr_no === recordId
    );
    if (!record) return;
    const normSource = normalizePRStatus(record.status);
    if (normSource === normTarget) return;

    // ROLE-BASED PERMISSIONS:
    // Only users with the 'Finance' role are allowed to change a card's status if it is currently in 'Pending Finance Approval'.
    // If a 'Department' user tries to drag this card or change its list dropdown, disable the action and show an Ant Design message stating 'Unauthorized: Only Finance can approve this step.'
    if (normSource === "Pending Finance Approval" && !isFinanceUser) {
      message.error("Unauthorized: Only Finance can approve this step.");
      return; // Snaps back
    }

    // FINANCE APPROVAL & REVISION FLOW VIA DRAG-AND-DROP:
    // If a Finance user drags into "Return for Revision" / "Needs Revision":
    if (normTarget === "Needs Revision") {
      setRevisionTargetRecord(record);
      setIsRevisionModalOpen(true);
      return;
    }

    // If a Finance user drags into "Approved (Move to Canvassing)" / "Canvassing / Bidding":
    if (normTarget === "Canvassing / Bidding" && isFinanceUser) {
      handleFinanceApprove(record);
      return;
    }

    // VALIDATION RULE: Users cannot drag a card into the 'Canvassing' column unless it has explicitly passed 'Finance Approval'
    if (normTarget === "Canvassing / Bidding") {
      if (!hasPassedFinanceApproval(record)) {
        notification.error({
          message: "Finance Approval Required",
          description: (
            <div className="space-y-1">
              <p className="font-semibold text-red-600 text-xs mb-1">
                Cannot move "{record.pr_no || record.purpose}" into Canvassing / Bidding.
              </p>
              <p className="text-slate-600 text-xs">
                <strong>Validation Policy:</strong> Requisitions cannot enter the <strong>Canvassing</strong> stage unless they have explicitly passed <strong>Finance Approval</strong>.
              </p>
              <div className="bg-amber-50 p-1.5 rounded border border-amber-200 text-amber-900 text-xs font-medium mt-1">
                👉 Please switch to the <strong>Finance Role</strong> to approve budget verification first.
              </div>
            </div>
          ),
          duration: 6,
          placement: "topRight",
        });
        return; // Snaps back
      }
    }

    // Open transition confirmation modal for standard transitions
    setPendingStatusChange({
      recordId: record.id,
      newStatus: normTarget,
    });
  };

  // When onChange (for the List dropdown) is triggered
  const handleListStatusChange = (recordId, rawStatus) => {
    const normTarget = normalizePRStatus(rawStatus);
    if (!normTarget) return;

    const record = purchaseRequests.find(
      (p) => String(p.id) === String(recordId) || p.pr_no === recordId
    );
    if (!record) return;
    const normSource = normalizePRStatus(record.status);
    if (normSource === normTarget) return;

    // ROLE-BASED PERMISSIONS:
    // Only users with the 'Finance' role are allowed to change a card's status if it is currently in 'Pending Finance Approval'.
    // If a 'Department' user tries to drag this card or change its list dropdown, disable the action and show an Ant Design message stating 'Unauthorized: Only Finance can approve this step.'
    if (normSource === "Pending Finance Approval" && !isFinanceUser) {
      message.error("Unauthorized: Only Finance can approve this step.");
      return;
    }

    // FINANCE APPROVAL & REVISION FLOW VIA LIST DROPDOWN:
    if (normTarget === "Needs Revision") {
      setRevisionTargetRecord(record);
      setIsRevisionModalOpen(true);
      return;
    }

    if (normTarget === "Canvassing / Bidding" && isFinanceUser) {
      handleFinanceApprove(record);
      return;
    }

    // VALIDATION RULE: Requisitions cannot enter Canvassing unless approved by Finance
    if (normTarget === "Canvassing / Bidding") {
      if (!hasPassedFinanceApproval(record)) {
        notification.error({
          message: "Finance Approval Required",
          description: (
            <div className="space-y-1">
              <p className="font-semibold text-red-600 text-xs mb-1">
                Cannot set "{record.pr_no || record.purpose}" to Canvassing / Bidding.
              </p>
              <p className="text-slate-600 text-xs">
                <strong>Validation Policy:</strong> Requisitions cannot enter Canvassing / Bidding unless they have explicitly passed <strong>Finance Approval</strong>.
              </p>
            </div>
          ),
          duration: 6,
          placement: "topRight",
        });
        return;
      }
    }

    setPendingStatusChange({
      recordId: record.id,
      newStatus: normTarget,
    });
  };

  // One-click Finance Approval for PR cards (Finance Module / Action Button)
  const handleFinanceApprove = async (record) => {
    if (!isFinanceUser) {
      message.error("Unauthorized: Only Finance can approve this step.");
      return;
    }
    try {
      setTransitionLoading(true);
      await approvePR(
        record.id,
        "Budget verified against approved departmental allocation. Approved for Canvassing."
      );
      if (activePR && String(activePR.id) === String(record.id)) {
        setActivePR((prev) => ({
          ...prev,
          status: "Canvassing / Bidding",
          finance_status: "Finance Approved",
        }));
      }
    } catch (err) {
      console.error("Failed to approve in finance:", err);
    } finally {
      setTransitionLoading(false);
    }
  };

  // Handle Finance Request Revision Modal submission
  const handleConfirmRevision = async (recordId, remarks) => {
    if (!isFinanceUser) {
      message.error("Unauthorized: Only Finance can approve or request revisions for this step.");
      return;
    }
    try {
      setTransitionLoading(true);
      await requestRevision(recordId, remarks);
      setIsRevisionModalOpen(false);
      setRevisionTargetRecord(null);
    } catch (err) {
      console.error("Failed to submit revision request:", err);
    } finally {
      setTransitionLoading(false);
    }
  };

  // Handle Department Edit & Resubmit Requisition Modal submission
  const handleConfirmResubmit = async (recordId, payload) => {
    try {
      setTransitionLoading(true);
      await resubmitPR(recordId, payload);
      setIsResubmitModalOpen(false);
      setResubmitTargetRecord(null);
    } catch (err) {
      console.error("Failed to resubmit purchase request:", err);
    } finally {
      setTransitionLoading(false);
    }
  };

  // Backwards compatibility for direct card / modal button clicks
  const handleCardDrop = (recordId, sourceColId, targetColId) => {
    handleDragEnd(recordId, sourceColId, targetColId);
  };

  // Find the record corresponding to pendingStatusChange
  const pendingRecord = useMemo(() => {
    if (!pendingStatusChange) return null;
    return (
      purchaseRequests.find(
        (p) => String(p.id) === String(pendingStatusChange.recordId)
      ) || null
    );
  }, [pendingStatusChange, purchaseRequests]);

  // If the user clicks 'Accept' in the modal, apply the change from pendingStatusChange
  // using updatePRStatus which updates local state immediately and broadcasts via SSE
  const handleConfirmTransition = async (remarks = "") => {
    if (!pendingStatusChange) return;
    const { recordId, newStatus } = pendingStatusChange;

    const targetRecord = purchaseRequests.find(
      (p) => String(p.id) === String(recordId)
    );
    const isHR =
      targetRecord?.sub_category === "HR & Training Services" ||
      targetRecord?.is_bypassed_pmo;

    setPendingStatusChange(null);
    setTransitionLoading(true);
    try {
      await updatePRStatus(recordId, newStatus, {
        remarks: remarks || undefined,
        performed_by: isHR
          ? "Executive Approver / Management Signatory"
          : isFinanceUser
          ? "Finance Officer"
          : "Department Head / Requester",
        role: isFinanceUser ? "Finance" : isHR ? "Executive Signatory" : "Department",
      });
    } catch (err) {
      console.error("Failed to update status on server:", err);
      message.error("Failed to update status on server. Reverting...");
    } finally {
      setTransitionLoading(false);
    }
  };

  // If the user clicks 'Cancel', simply close the modal and clear the pending state
  const handleCancelTransition = () => {
    setPendingStatusChange(null);
  };

  // Open digital signature modal
  const handleOpenSignModal = (pr, approval) => {
    setSigningTarget({ pr, approval });
    setIsSignModalOpen(true);
  };

  // Determine active Kanban columns based on active module & workflow view
  const activeKanbanColumns = useMemo(() => {
    if (activeModule === "finance") {
      return FINANCE_PR_COLUMNS;
    }
    if (workflowView === "hr_training") {
      return HR_TRAINING_PR_COLUMNS;
    }
    return DEPARTMENT_PR_COLUMNS;
  }, [activeModule, workflowView]);

  // MODULE FILTERING SPECIFICATION:
  // - The Finance Module should only display requests that are 'Pending Finance Approval'.
  // - The Department Module should display all requests initiated by that department,
  //   allowing them to track the live status (e.g., 'Pending Finance Approval', 'Canvassing', or 'Needs Revision').
  const filteredPRs = useMemo(() => {
    return purchaseRequests
      .filter((pr) => {
        const norm = normalizePRStatus(pr.status);

        if (activeModule === "finance") {
          // STRICT FINANCE MODULE FILTER:
          // The Finance Module should ONLY display requests that are 'Pending Finance Approval'
          if (norm !== "Pending Finance Approval") {
            return false;
          }
        } else {
          // DEPARTMENT MODULE FILTER:
          // Display all requests initiated by that department
          if (selectedDepartmentId !== "all") {
            if (String(pr.department_id) !== String(selectedDepartmentId)) {
              return false;
            }
          }

          // PMO / HR workflow tabs filtering if active
          if (workflowView === "pmo") {
            if (
              pr.is_bypassed_pmo ||
              pr.sub_category === "HR & Training Services" ||
              pr.pr_type === "Services/OpEx (Budget Only)"
            ) {
              return false;
            }
          } else if (workflowView === "hr_training") {
            if (pr.sub_category !== "HR & Training Services" && !pr.approvals?.length) {
              return false;
            }
          }
        }

        const matchesSearch =
          !searchQuery ||
          pr.pr_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pr.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pr.department_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pr.sub_category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pr.pr_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pr.canvass_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pr.po_no?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPriority =
          filterPriority === "all" || pr.priority === filterPriority;

        return matchesSearch && matchesPriority;
      })
      .map((pr) => {
        const isHR = pr.sub_category === "HR & Training Services" || pr.is_bypassed_pmo;
        if (workflowView === "hr_training" && isHR) {
          return pr;
        }
        return {
          ...pr,
          status: normalizePRStatus(pr.status),
        };
      });
  }, [
    purchaseRequests,
    activeModule,
    selectedDepartmentId,
    workflowView,
    searchQuery,
    filterPriority,
  ]);

  // Counts for workflow badges
  const pmoCount = useMemo(
    () =>
      purchaseRequests.filter(
        (p) =>
          !p.is_bypassed_pmo &&
          p.sub_category !== "HR & Training Services" &&
          p.pr_type !== "Services/OpEx (Budget Only)"
      ).length,
    [purchaseRequests]
  );

  const hrTrainingCount = useMemo(
    () =>
      purchaseRequests.filter(
        (p) => p.sub_category === "HR & Training Services" || (p.approvals && p.approvals.length > 0)
      ).length,
    [purchaseRequests]
  );

  // KPI Calculations
  const totalBudgetRequested = filteredPRs.reduce(
    (sum, p) => sum + (Number(p.total_estimated_budget) || 0),
    0
  );
  const pendingCount = filteredPRs.filter(
    (p) =>
      p.status === "Submitted PR" ||
      p.status === "Budget Review" ||
      p.status === "Pending Dept Head" ||
      p.status === "Pending HR" ||
      p.status === "Pending Finance" ||
      p.status === "Pending VP Acad / VPAsa"
  ).length;
  const approvedCount = filteredPRs.filter((p) => p.status === "Approved PR").length;

  // Render Kanban card
  const renderPRCard = (pr) => {
    const isApproved = pr.status === "Approved PR";
    const isUrgent = pr.priority === "Urgent";
    const isHR = pr.sub_category === "HR & Training Services" || pr.is_bypassed_pmo;
    const normStatus = normalizePRStatus(pr.status);
    const isPendingFinance = normStatus === "Pending Finance Approval";
    const isNeedsRevision = normStatus === "Needs Revision";

    // Calculate signed count
    const approvedSignatures = (pr.approvals || []).filter((a) => a.status === "approved").length;
    const totalSignatures = (pr.approvals || []).length;
    const nextPendingApproval = (pr.approvals || []).find((a) => a.status === "pending");

    return (
      <Card
        size="small"
        className={`bg-white rounded-xl border shadow-xs hover:shadow-md transition-all select-none ${
          isNeedsRevision
            ? "border-amber-400 bg-amber-50/20"
            : isPendingFinance
            ? "border-orange-300 bg-orange-50/10"
            : isApproved
            ? "border-emerald-200 bg-emerald-50/10"
            : isHR
            ? "border-purple-200"
            : "border-slate-200"
        } ${
          isPendingFinance && !isFinanceUser
            ? "cursor-not-allowed opacity-95"
            : "cursor-grab active:cursor-grabbing hover:border-blue-400"
        }`}
      >
        <div className="space-y-2">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <span
              className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border ${
                isNeedsRevision
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : isHR
                  ? "bg-purple-50 text-purple-800 border-purple-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
              }`}
            >
              {pr.pr_no}
            </span>
            <div className="flex items-center gap-1">
              {pr.revision_count ? (
                <Tag color="volcano" className="m-0 text-[10px] font-semibold">
                  Rev #{pr.revision_count}
                </Tag>
              ) : null}
              <AttachmentBadge count={pr.attachments?.length || 0} />
              <Tag color={isUrgent ? "red" : pr.priority === "High" ? "orange" : "blue"} className="m-0 text-[10px]">
                {pr.priority}
              </Tag>
            </div>
          </div>

          {/* PR Type & Sub-category Badges */}
          <div className="flex flex-wrap items-center gap-1">
            {isNeedsRevision && (
              <Tag color="warning" className="m-0 text-[10px] font-bold">
                ⚠️ Needs Revision
              </Tag>
            )}
            {isPendingFinance && (
              <Tag color="gold" className="m-0 text-[10px] font-semibold">
                ⏳ Pending Finance
              </Tag>
            )}
            {isHR ? (
              <>
                <Tag color="purple" className="m-0 text-[10px] font-medium flex items-center gap-0.5">
                  <ThunderboltOutlined className="text-[9px]" /> HR & Training Services
                </Tag>
                <Tag color="magenta" className="m-0 text-[9px]">
                  Bypasses PMO
                </Tag>
              </>
            ) : (
              <Tag color="geekblue" className="m-0 text-[10px]">
                {pr.pr_type || "Goods (Inventoriable)"}
              </Tag>
            )}
          </div>

          {/* Purpose & Department */}
          <div>
            <Text strong className="text-sm text-slate-900 block line-clamp-2">
              {pr.purpose}
            </Text>
            <div className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1 mt-0.5">
              <TeamOutlined className="text-slate-400" />
              <span>{pr.department_name}</span>
            </div>
          </div>

          {/* Budget & Items */}
          <div className="flex items-center justify-between text-xs py-1.5 border-y border-slate-100 bg-slate-50/60 -mx-3 px-3">
            <div>
              <span className="text-slate-400">Budget: </span>
              <span className="font-bold text-slate-900">
                ₱{Number(pr.total_estimated_budget || 0).toLocaleString()}
              </span>
            </div>
            <div className="text-slate-500 font-medium">
              {pr.items?.length || 0} {isHR ? "expense items" : "items"}
            </div>
          </div>

          {/* Needs Revision Feedback Box for Department Users */}
          {isNeedsRevision && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 text-xs text-amber-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1 text-[11px] text-amber-900">
                <ExclamationCircleOutlined className="text-amber-600" /> Finance Revision Remarks:
              </div>
              <div className="text-[11px] font-medium leading-relaxed bg-white/80 p-1.5 rounded border border-amber-200">
                "{pr.revision_remarks || "Budget revision requested. Please adjust unit costs or quantities."}"
              </div>
              {pr.revision_requested_by && (
                <div className="text-[10px] text-amber-800">
                  Requested by: <strong>{pr.revision_requested_by}</strong>
                </div>
              )}
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs mt-1 shadow-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setResubmitTargetRecord(pr);
                  setIsResubmitModalOpen(true);
                }}
              >
                Edit & Resubmit Requisition
              </Button>
            </div>
          )}

          {/* Approval Signatures Progress (For HR & Training Services) */}
          {totalSignatures > 0 && (
            <div className="bg-purple-50/80 p-1.5 rounded-lg border border-purple-100 text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-purple-900 flex items-center gap-1">
                  <AuditOutlined className="text-purple-600" /> Signatures:
                </span>
                <span className="font-bold text-purple-800">
                  {approvedSignatures} of {totalSignatures} Signed
                </span>
              </div>
              <div className="flex items-center gap-1">
                {pr.approvals.map((app, idx) => (
                  <Tooltip key={idx} title={`${app.role}: ${app.status === "approved" ? "Signed" : "Pending"}`}>
                    <div
                      className={`flex-1 h-1.5 rounded-full ${
                        app.status === "approved"
                          ? "bg-emerald-500"
                          : idx === approvedSignatures
                          ? "bg-amber-400 animate-pulse"
                          : "bg-slate-200"
                      }`}
                    />
                  </Tooltip>
                ))}
              </div>
              {nextPendingApproval && !isApproved && (
                <div className="text-[10px] text-purple-700 truncate">
                  Next: <strong>{nextPendingApproval.role}</strong>
                </div>
              )}
            </div>
          )}

          {/* Pipeline Badges */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <div>
              {pr.canvass_no && !isHR && (
                <Tooltip title={`Sourced from Canvass RFQ ${pr.canvass_no}`}>
                  <Tag color="cyan" className="m-0 text-[10px] font-mono">
                    RFQ: {pr.canvass_no}
                  </Tag>
                </Tooltip>
              )}
              {isHR && (
                <Tag color="gold" className="m-0 text-[10px] font-mono">
                  OpEx Budget Only
                </Tag>
              )}
            </div>
            <div>
              {pr.po_no ? (
                <Tooltip title={`Linked Purchase Order ${pr.po_no}`}>
                  <Tag color="green" className="m-0 text-[10px] font-mono">
                    PO: {pr.po_no}
                  </Tag>
                </Tooltip>
              ) : (
                <span>Due: {pr.target_date || "—"}</span>
              )}
            </div>
          </div>

          {/* Finance Approval Actions & Role Check */}
          {isPendingFinance && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Finance Step:</span>
                <Tag color="warning" className="m-0 text-[10px]" icon={<ClockCircleOutlined />}>
                  Awaiting Finance Review
                </Tag>
              </div>

              {isFinanceUser ? (
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <Button
                    type="primary"
                    size="small"
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 font-medium"
                    icon={<CheckCircleOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFinanceApprove(pr);
                    }}
                  >
                    Approve (Canvass)
                  </Button>
                  <Button
                    danger
                    size="small"
                    className="text-xs font-medium border-amber-400 text-amber-700 hover:bg-amber-50"
                    icon={<ExclamationCircleOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRevisionTargetRecord(pr);
                      setIsRevisionModalOpen(true);
                    }}
                  >
                    Needs Revision
                  </Button>
                </div>
              ) : (
                <div
                  className="bg-slate-100 p-2 rounded text-[11px] text-slate-600 flex items-center gap-1.5 cursor-pointer hover:bg-red-50 hover:text-red-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    message.error("Unauthorized: Only Finance can approve this step.");
                  }}
                >
                  <span className="font-semibold">🔒 Locked:</span>
                  <span>Only Finance users can approve this step.</span>
                </div>
              )}
            </div>
          )}

          {/* Stage 3: Ready to Draft PR Actions (Department Action on Awarded Bid) */}
          {normStatus === "Bid Awarded - Pending PR" && (
            <div className="pt-2 border-t border-teal-200 bg-teal-50/60 -mx-3 px-3 py-2 space-y-1.5 rounded-b-xl">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-teal-900">Stage 3: Awarded Bid Ready</span>
                <Tag color="cyan" className="m-0 text-[10px]">Quote Selected</Tag>
              </div>
              <div className="text-[11px] text-slate-700">
                Supplier: <strong>{pr.winning_supplier || pr.supplier_name || "Awarded Vendor"}</strong>
                {pr.winning_bid_amount ? ` (₱${Number(pr.winning_bid_amount).toLocaleString()})` : ""}
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <Button
                  type="primary"
                  size="small"
                  icon={<FileTextOutlined />}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDraftPRModal(pr);
                  }}
                >
                  Draft Formal PR
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  className="text-xs font-medium border-rose-300 text-rose-700 hover:bg-rose-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenContestModal(pr);
                  }}
                >
                  Contest Bid
                </Button>
              </div>
            </div>
          )}

          {normStatus === "Contested" && (
            <div className="pt-2 border-t border-amber-200 bg-amber-50/70 -mx-3 px-3 py-2 space-y-1 rounded-b-xl">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-amber-900 flex items-center gap-1">
                  <ExclamationCircleOutlined className="text-amber-600" /> Awarded Bid Contested
                </span>
                <Tag color="volcano" className="m-0 text-[10px]">Contested</Tag>
              </div>
              <div className="text-[11px] text-amber-950 italic line-clamp-2 bg-white/70 p-1.5 rounded border border-amber-200">
                "{pr.contest_justification || "Contested by requesting department."}"
              </div>
            </div>
          )}

          {/* Card Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              className="text-xs text-slate-600 hover:text-blue-600 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setActivePR(pr);
                setIsDetailModalOpen(true);
              }}
            >
              Inspect & Checklist
            </Button>

            {!isApproved && !isPendingFinance && !isNeedsRevision && (
              isHR ? (
                nextPendingApproval ? (
                  <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSignModal(pr, nextPendingApproval);
                    }}
                  >
                    Sign ({nextPendingApproval.role})
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckOutlined />}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardDrop(pr.id, pr.status, "Approved PR");
                    }}
                  >
                    Release Budget
                  </Button>
                )
              ) : (
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardDrop(pr.id, pr.status, "Approved PR");
                  }}
                >
                  Approve & PO
                </Button>
              )
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Table columns
  const tableColumns = [
    {
      title: "PR Number",
      dataIndex: "pr_no",
      key: "pr_no",
      width: 140,
      render: (val) => <span className="font-mono font-semibold text-blue-700">{val}</span>,
    },
    {
      title: "Purpose / Requisition",
      dataIndex: "purpose",
      key: "purpose",
      render: (val, r) => (
        <div>
          <div className="font-medium text-slate-900">{val}</div>
          <div className="text-xs text-slate-500">Dept: {r.department_name}</div>
        </div>
      ),
    },
    {
      title: "PR Type & Category",
      key: "type_category",
      width: 200,
      render: (_, r) => {
        const isHR = r.sub_category === "HR & Training Services" || r.is_bypassed_pmo;
        return (
          <div className="space-y-1">
            <div>
              <Tag color={isHR ? "purple" : "geekblue"} className="font-medium text-xs m-0">
                {r.pr_type || "Goods (Inventoriable)"}
              </Tag>
            </div>
            <div className="text-xs text-slate-600 font-medium truncate max-w-[190px]">
              {r.sub_category || "General Supplies"}
            </div>
            {isHR && (
              <Tag color="magenta" className="text-[10px] m-0">
                Bypasses PMO & Canvassing
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
      width: 210,
      render: (status, record) => {
        const isHR = record.sub_category === "HR & Training Services" || record.is_bypassed_pmo;
        const availableCols = isHR
          ? HR_TRAINING_PR_COLUMNS
          : activeModule === "finance"
          ? FINANCE_PR_COLUMNS
          : DEPARTMENT_PR_COLUMNS;
        const totalSignatures = record.approvals?.length || 0;
        const signedCount = (record.approvals || []).filter((a) => a.status === "approved").length;

        const currentStatus = isHR ? status : normalizePRStatus(status);
        const isPendingFinance = currentStatus === "Pending Finance Approval";
        const isNeedsRevision = currentStatus === "Needs Revision";

        return (
          <div onClick={(e) => e.stopPropagation()} className="space-y-1">
            <Select
              value={currentStatus}
              className="w-full min-w-[160px]"
              onChange={(newStatus) => {
                if (newStatus === currentStatus) return;
                handleListStatusChange(record.id, newStatus);
              }}
              popupMatchSelectWidth={false}
              size="middle"
              disabled={isPendingFinance && !isFinanceUser}
            >
              {availableCols.map((col) => (
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
            <div className="flex items-center justify-between text-[10px]">
              {isPendingFinance && !isFinanceUser ? (
                <Tooltip title="Unauthorized: Only Finance can approve this step.">
                  <Tag color="error" className="m-0 text-[10px] cursor-not-allowed">
                    🔒 Finance Restricted
                  </Tag>
                </Tooltip>
              ) : isNeedsRevision ? (
                <Tag color="warning" className="m-0 text-[10px]">
                  ⚠️ Needs Revision
                </Tag>
              ) : hasPassedFinanceApproval(record) ? (
                <Tag color="success" className="m-0 text-[10px]">✓ Finance Cleared</Tag>
              ) : (
                <Tag color="warning" className="m-0 text-[10px]">Needs Finance</Tag>
              )}
              {totalSignatures > 0 && (
                <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-0.5">
                  <AuditOutlined /> {signedCount}/{totalSignatures}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 95,
      render: (p) => (
        <Tag color={p === "Urgent" ? "red" : p === "High" ? "orange" : "blue"}>{p}</Tag>
      ),
    },
    {
      title: "Total Budget",
      dataIndex: "total_estimated_budget",
      key: "total_estimated_budget",
      width: 130,
      render: (val) => <span className="font-semibold">₱{Number(val || 0).toLocaleString()}</span>,
    },
    {
      title: "Evidence",
      key: "attachments",
      width: 100,
      render: (_, r) => <AttachmentBadge count={r.attachments?.length || 0} showLabel />,
    },
    {
      title: "Pipeline Origin & PO",
      key: "links",
      width: 140,
      render: (_, r) => {
        const isHR = r.sub_category === "HR & Training Services" || r.is_bypassed_pmo;
        return (
          <Space direction="vertical" size={2}>
            {r.canvass_no && !isHR && <Tag color="cyan" className="font-mono text-[10px]">RFQ: {r.canvass_no}</Tag>}
            {r.po_no && <Tag color="green" className="font-mono text-[10px]">PO: {r.po_no}</Tag>}
            {isHR && <Tag color="gold" className="font-mono text-[10px]">OpEx Budget</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, r) => {
        const isHR = r.sub_category === "HR & Training Services" || r.is_bypassed_pmo;
        const nextPendingApproval = (r.approvals || []).find((a) => a.status === "pending");
        const normStatus = normalizePRStatus(r.status);
        const isPendingFinance = normStatus === "Pending Finance Approval";
        const isNeedsRevision = normStatus === "Needs Revision";

        return (
          <Space size={4} wrap>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setActivePR(r);
                setIsDetailModalOpen(true);
              }}
            >
              Inspect
            </Button>

            {/* Stage 3: Department Actions on Awarded Bid */}
            {r.status === "Bid Awarded - Pending PR" && (
              <>
                <Button
                  size="small"
                  type="primary"
                  icon={<FileTextOutlined />}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => handleOpenDraftPRModal(r)}
                >
                  Draft Formal PR
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleOpenContestModal(r)}
                >
                  Contest
                </Button>
              </>
            )}

            {/* Department Action: Edit & Resubmit when in Needs Revision */}
            {isNeedsRevision && (
              <Button
                size="small"
                type="primary"
                icon={<EditOutlined />}
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => {
                  setResubmitTargetRecord(r);
                  setIsResubmitModalOpen(true);
                }}
              >
                Resubmit
              </Button>
            )}

            {/* Finance Actions: Approve or Request Revision */}
            {isPendingFinance && (
              isFinanceUser ? (
                <>
                  <Button
                    size="small"
                    type="primary"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleFinanceApprove(r)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    danger
                    onClick={() => {
                      setRevisionTargetRecord(r);
                      setIsRevisionModalOpen(true);
                    }}
                  >
                    Revision
                  </Button>
                </>
              ) : (
                <Tooltip title="Unauthorized: Only Finance can approve this step.">
                  <Button
                    size="small"
                    disabled
                    className="text-slate-400"
                    onClick={() => message.error("Unauthorized: Only Finance can approve this step.")}
                  >
                    🔒 Finance Step
                  </Button>
                </Tooltip>
              )
            )}

            {r.status !== "Approved PR" && !isPendingFinance && !isNeedsRevision && (
              isHR ? (
                nextPendingApproval ? (
                  <Button
                    size="small"
                    type="primary"
                    icon={<EditOutlined />}
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleOpenSignModal(r, nextPendingApproval)}
                  >
                    Sign
                  </Button>
                ) : (
                  <Button
                    size="small"
                    type="primary"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleCardDrop(r.id, r.status, "Approved PR")}
                  >
                    Release
                  </Button>
                )
              ) : (
                <Button
                  size="small"
                  type="primary"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleCardDrop(r.id, r.status, "Approved PR")}
                >
                  Approve
                </Button>
              )
            )}
          </Space>
        );
      },
    },
  ];

  const pendingFinanceCount = purchaseRequests.filter(
    (p) => normalizePRStatus(p.status) === "Pending Finance Approval"
  ).length;

  const needsRevisionCount = purchaseRequests.filter(
    (p) => normalizePRStatus(p.status) === "Needs Revision"
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Module & Role Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            activeModule === "finance"
              ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
              : "bg-blue-500/20 border-blue-400/40 text-blue-300"
          }`}>
            {activeModule === "finance" ? <AuditOutlined className="text-xl" /> : <AppstoreOutlined className="text-xl" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
                Active Module:
              </span>
              <Tag
                color={activeModule === "finance" ? "gold" : "blue"}
                className="m-0 text-[10px] font-semibold uppercase"
              >
                {activeModule === "finance" ? "Finance Module" : "Department Module"}
              </Tag>
              <Tag color="cyan" className="m-0 text-[10px] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
                Live Sync
              </Tag>
            </div>
            <div className="text-sm font-semibold text-slate-100 mt-0.5">
              {activeModule === "finance"
                ? "Restricted to 'Pending Finance Approval' requests for budget clearance or revision requests"
                : "Tracking all initiated departmental requisitions across live workflow stages"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Module Switcher Buttons */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeModule === "department"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-300 hover:text-white"
              }`}
              onClick={() => setActiveModule("department")}
            >
              <TeamOutlined /> Department Module
              {needsRevisionCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 rounded-full font-bold">
                  {needsRevisionCount} Needs Rev
                </span>
              )}
            </button>
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeModule === "finance"
                  ? "bg-amber-500 text-slate-950 font-bold shadow"
                  : "text-slate-300 hover:text-white"
              }`}
              onClick={() => setActiveModule("finance")}
            >
              <AuditOutlined /> Finance Module
              {pendingFinanceCount > 0 && (
                <span className="bg-red-600 text-white text-[10px] px-1.5 rounded-full font-bold">
                  {pendingFinanceCount}
                </span>
              )}
            </button>
          </div>

          {/* Role Persona Toggle (for testing permission checks) */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 px-2 font-medium">Active Role:</span>
            <button
              type="button"
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                !isFinanceUser
                  ? "bg-blue-700 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setActiveRole("Department")}
            >
              Department
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                isFinanceUser
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setActiveRole("Finance")}
            >
              Finance
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Module Banner */}
      {activeModule === "finance" ? (
        <Alert
          message={<span className="font-bold text-amber-900">Finance Approval Module Active</span>}
          description={
            <div className="text-xs text-amber-950 space-y-1">
              <p className="m-0">
                Displaying <strong>only requests that are currently in 'Pending Finance Approval'</strong> ({pendingFinanceCount} requisitions pending).
              </p>
              <p className="m-0 text-slate-700">
                Finance users can evaluate the estimated budget: choose <strong>Approve (Move to Canvassing)</strong> to authorize RFQ bidding, or <strong>Needs Revision</strong> to return the card to the department with feedback remarks.
              </p>
            </div>
          }
          type="warning"
          showIcon
          icon={<AuditOutlined className="text-amber-600 text-lg" />}
          className="border-amber-300 bg-amber-50/80"
        />
      ) : (
        needsRevisionCount > 0 && (
          <Alert
            message={<span className="font-bold text-amber-900">Department Action Required: Needs Revision</span>}
            description={
              <div className="text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2">
                <span>
                  You have <strong>{needsRevisionCount} requisition(s)</strong> returned by Finance for revision. Click <strong>Edit & Resubmit</strong> on the card to revise line items and return to Finance Approval.
                </span>
              </div>
            }
            type="warning"
            showIcon
            closable
            className="border-amber-300 bg-amber-50/90"
          />
        )
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Title level={3} className="m-0 text-slate-900 font-bold tracking-tight">
              {activeModule === "finance" ? "Finance Approval Queue" : "Purchase Requests (PR)"}
            </Title>
            <Tag color={activeModule === "finance" ? "gold" : "processing"} className="m-0 font-medium">
              {activeModule === "finance" ? "Finance Clearance Stage" : "Pipeline Stage 2: Requisition & Review"}
            </Tag>
          </div>
          <Paragraph className="text-slate-500 m-0 mt-1 text-sm">
            {activeModule === "finance"
              ? "Verify departmental budget allocations before canvassing (RFQ). Authorized finance officers can approve or request revisions."
              : "Manage purchase requisitions with live status tracking across department and finance review stages."}
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
            <Radio.Button value="drafting">
              <FileTextOutlined className="mr-1" /> Stage 3: Draft PRs
              <Badge
                count={prDraftingRecords.length}
                size="small"
                style={{ marginLeft: 6, backgroundColor: "#08979c" }}
                overflowCount={99}
              />
            </Radio.Button>
            <Radio.Button value="table">
              <UnorderedListOutlined className="mr-1" /> Table
            </Radio.Button>
          </Radio.Group>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            Create Purchase Request
          </Button>
        </div>
      </div>

      {/* KPI Statistic Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl border border-slate-200 shadow-xs">
            <Statistic
              title={<span className="text-xs text-slate-500 uppercase font-semibold">Total Requests</span>}
              value={purchaseRequests.length}
              prefix={<FileTextOutlined className="text-blue-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl border border-slate-200 shadow-xs">
            <Statistic
              title={<span className="text-xs text-slate-500 uppercase font-semibold">Pending Review</span>}
              value={pendingCount}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<ClockCircleOutlined className="text-amber-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl border border-slate-200 shadow-xs">
            <Statistic
              title={<span className="text-xs text-slate-500 uppercase font-semibold">Approved (Ready for PO / Budget)</span>}
              value={approvedCount}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined className="text-emerald-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl border border-slate-200 shadow-xs">
            <Statistic
              title={<span className="text-xs text-slate-500 uppercase font-semibold">Total Budget Value</span>}
              value={totalBudgetRequested}
              precision={2}
              prefix="₱"
              valueStyle={{ color: "#096dd9" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Workflow Navigation & Views */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <BranchesOutlined className="text-blue-600" /> Pipeline Workflow:
          </span>
          <Segmented
            value={workflowView}
            onChange={setWorkflowView}
            options={[
              {
                label: (
                  <div className="flex items-center gap-2 py-1 px-2.5">
                    <SafetyCertificateOutlined className="text-blue-600" />
                    <span className="font-semibold text-xs">PMO View (Goods Only)</span>
                    <Badge count={pmoCount} overflowCount={99} style={{ backgroundColor: "#1890ff" }} />
                  </div>
                ),
                value: "pmo",
              },
              {
                label: (
                  <div className="flex items-center gap-2 py-1 px-2.5">
                    <ThunderboltOutlined className="text-purple-600" />
                    <span className="font-semibold text-xs">HR & Training Services (Management Chain)</span>
                    <Badge count={hrTrainingCount} overflowCount={99} style={{ backgroundColor: "#722ed1" }} />
                  </div>
                ),
                value: "hr_training",
              },
              {
                label: (
                  <div className="flex items-center gap-2 py-1 px-2.5">
                    <GlobalOutlined className="text-slate-600" />
                    <span className="text-xs">All Requisitions</span>
                    <Badge count={purchaseRequests.length} overflowCount={99} style={{ backgroundColor: "#8c8c8c" }} />
                  </div>
                ),
                value: "all",
              },
            ]}
          />
        </div>
      </div>

      {/* Contextual Workflow Alerts */}
      {workflowView === "pmo" && (
        <Alert
          message={<span className="font-semibold text-blue-900">PMO Procurement View Active</span>}
          description="Displaying inventoriable goods requisitions subject to PMO review, warehouse inventory check, canvassing (RFQ), and PO issuance. Requests flagged as 'HR & Training Services' completely bypass this view."
          type="info"
          showIcon
          icon={<SafetyCertificateOutlined className="text-blue-600" />}
          className="border-blue-200 bg-blue-50/70"
        />
      )}

      {workflowView === "hr_training" && (
        <Alert
          message={
            <span className="font-semibold text-purple-900">
              HR & Training Services — Custom Management Approval Sequence
            </span>
          }
          description={
            <div className="space-y-1 text-xs">
              <p className="m-0 text-slate-700">
                These requests completely <strong>bypass PMO inventory, canvassing, and PO issuance</strong>.
              </p>
              <p className="m-0 font-medium text-purple-800">
                Sequential approval stages: <strong>Pending Dept Head</strong> ➔ <strong>Pending HR</strong> ➔ <strong>Pending Finance</strong> ➔ <strong>Pending VP Acad / VPAsa</strong> ➔ <strong>Approved (Budget Released)</strong>.
              </p>
              <p className="m-0 text-slate-500">
                Each card requires 4 digital signatures before the budget is authorized for disbursement.
              </p>
            </div>
          }
          type="warning"
          showIcon
          icon={<ThunderboltOutlined className="text-purple-600" />}
          className="border-purple-200 bg-purple-50/70"
        />
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <Input.Search
            placeholder="Search PR number, purpose, RFQ or PO..."
            allowClear
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />

          <Select
            value={selectedDepartmentId}
            onChange={setSelectedDepartmentId}
            style={{ width: 220 }}
            placeholder="All Departments"
          >
            <Option value="all">All Departments</Option>
            {departments.map((d) => (
              <Option key={d.id} value={d.id}>
                {d.name || d.department_name}
              </Option>
            ))}
          </Select>

          <Select
            value={filterPriority}
            onChange={setFilterPriority}
            style={{ width: 140 }}
            placeholder="Priority"
          >
            <Option value="all">All Priorities</Option>
            <Option value="Urgent">Urgent</Option>
            <Option value="High">High</Option>
            <Option value="Normal">Normal</Option>
            <Option value="Low">Low</Option>
          </Select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredPRs.length} of {purchaseRequests.length} purchase requests
        </div>
      </div>

      {/* Views: Kanban vs Stage 3 Drafting vs Table */}
      {viewMode === "drafting" ? (
        <div className="space-y-4">
          <Alert
            type="info"
            showIcon
            className="rounded-xl border-teal-200 bg-teal-50/80 text-teal-950"
            message={
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>
                  <strong>Stage 3: Purchase Request Drafting:</strong> Sourcing and Canvassing is complete. The requesting department can now generate the formal Purchase Request with line items locked to the awarded quotation, or file a contestation with justification.
                </span>
                <span className="text-xs font-semibold text-teal-800">
                  {prDraftingRecords.length} record(s) in drafting queue
                </span>
              </div>
            }
          />

          {prDraftingRecords.length === 0 ? (
            <Card className="rounded-xl border border-slate-200 p-12 text-center shadow-xs bg-white">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600 mb-4">
                <FileTextOutlined style={{ fontSize: 32 }} />
              </div>
              <Title level={4} className="text-slate-800">
                No Awarded Quotations Pending Formal PR Drafting
              </Title>
              <Paragraph className="text-slate-500 max-w-md mx-auto">
                Once the Canvassing Officer awards a winning supplier bid in Stage 2, the requisition will automatically appear here for the department to draft the formal PR.
              </Paragraph>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prDraftingRecords.map((rec) => {
                const amount = rec.winning_bid_amount || rec.total_amount || rec.total_estimated_budget || 0;
                const vendor = rec.winning_supplier || rec.supplier_name || "Awarded Supplier";
                const isContested = rec.status === "Contested";

                return (
                  <Card
                    key={rec.id}
                    className={`rounded-xl border shadow-xs hover:shadow-md transition-shadow bg-white flex flex-col justify-between ${
                      isContested ? "border-amber-300 bg-amber-50/20" : "border-teal-200"
                    }`}
                    styles={{ body: { padding: "16px", display: "flex", flexDirection: "column", height: "100%" } }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {rec.pr_no || `RFQ-${rec.id}`}
                        </span>
                        <Tag color={isContested ? "orange" : "cyan"}>
                          {rec.status}
                        </Tag>
                      </div>

                      <h4 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2">
                        {rec.title || rec.purpose || "Procurement Requisition"}
                      </h4>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1.5 mb-3">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-medium">{rec.department_name}</span>
                          <span className="text-slate-400">By: {rec.requested_by || "Initiator"}</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Awarded Supplier:</span>
                            <strong className="text-teal-900">{vendor}</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Winning Quotation:</span>
                            <strong className="text-emerald-700 font-bold text-sm">
                              ₱{Number(amount).toLocaleString()}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {isContested && (
                        <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-900 mb-3 space-y-0.5">
                          <span className="font-bold flex items-center gap-1 text-[11px]">
                            <ExclamationCircleOutlined className="text-amber-600" /> Contest Justification:
                          </span>
                          <p className="m-0 italic text-[11px]">
                            "{rec.contest_justification || "Contested by department"}"
                          </p>
                        </div>
                      )}

                      {rec.items && rec.items.length > 0 && (
                        <div className="text-xs text-slate-500 mb-3">
                          <span className="font-semibold text-slate-700 block mb-1">
                            Line Items ({rec.items.length}):
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
                                + {rec.items.length - 3} more item(s)
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setActivePR(rec);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        Inspect
                      </Button>

                      <div className="flex items-center gap-1.5">
                        {!isContested && (
                          <Button
                            danger
                            size="small"
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleOpenContestModal(rec)}
                          >
                            Contest
                          </Button>
                        )}
                        <Button
                          type="primary"
                          size="small"
                          icon={<FileTextOutlined />}
                          className="bg-teal-600 hover:bg-teal-700"
                          onClick={() => handleOpenDraftPRModal(rec)}
                        >
                          Draft Formal PR
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : viewMode === "kanban" ? (
        <KanbanBoard
          columns={activeKanbanColumns}
          items={filteredPRs}
          renderCard={renderPRCard}
          onDragEnd={handleDragEnd}
          onCardDrop={handleDragEnd}
          isItemDragDisabled={(item) =>
            normalizePRStatus(item.status) === "Pending Finance Approval" && !isFinanceUser
          }
          loading={loading}
        />
      ) : (
        <Card className="rounded-xl border border-slate-200 shadow-xs">
          <Table
            dataSource={filteredPRs}
            columns={tableColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}

      {/* ==================== DRAFT FORMAL PR MODAL (STAGE 3) ==================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <div className="p-1.5 bg-teal-100 text-teal-700 rounded">
              <FileTextOutlined />
            </div>
            <span>Draft Formal Purchase Request (Stage 3)</span>
          </div>
        }
        open={isDraftPRModalOpen}
        onCancel={() => {
          setIsDraftPRModalOpen(false);
          setDraftTargetRecord(null);
        }}
        onOk={handleConfirmSubmitFormalPR}
        confirmLoading={draftSubmitting}
        okText="Submit Formal PR to Finance"
        okButtonProps={{ className: "bg-teal-600 hover:bg-teal-700 text-white" }}
        width={700}
        destroyOnClose
      >
        <div className="py-2 space-y-4">
          <Alert
            type="success"
            showIcon
            className="rounded-lg border-teal-200 bg-teal-50"
            message="Quotation & Canvass Bound"
            description={
              <div className="text-xs text-teal-950 space-y-1">
                <p>
                  This formal PR will be directly bound to the winning vendor quote:{" "}
                  <strong>
                    {draftTargetRecord?.winning_supplier || draftTargetRecord?.supplier_name || "Awarded Vendor"}
                  </strong>{" "}
                  at{" "}
                  <strong>
                    ₱
                    {Number(
                      draftTargetRecord?.winning_bid_amount || draftTargetRecord?.total_amount || 0
                    ).toLocaleString()}
                  </strong>.
                </p>
                <p className="text-[11px] text-teal-800">
                  Submitting will advance this requisition to <strong>'Pending Finance Approval'</strong> for Stage 4 budget verification and fund encumbrance.
                </p>
              </div>
            }
          />

          <Form form={draftForm} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Awarded Supplier" name="supplier_name">
                  <Input disabled className="bg-slate-100 font-semibold text-slate-800" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Winning Bid Amount (₱)" name="winning_amount">
                  <InputNumber
                    disabled
                    className="w-full bg-slate-100 font-bold text-emerald-700"
                    formatter={(val) => `₱ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Formal PR Title / Subject"
              name="title"
              rules={[{ required: true, message: "Please provide a formal PR title" }]}
            >
              <Input placeholder="e.g., Procurement of High-Performance Lab Workstations" />
            </Form.Item>

            <Form.Item
              label="Department Justification & Purpose"
              name="justification"
              rules={[{ required: true, message: "Please state the justification for this procurement" }]}
            >
              <TextArea
                rows={3}
                placeholder="Explain the necessity, intended users, and alignment with department operational goals..."
              />
            </Form.Item>

            <Form.Item
              label="Delivery / Receiving Destination"
              name="delivery_address"
              rules={[{ required: true, message: "Please provide delivery address" }]}
            >
              <Input placeholder="Building, Room, or Central Warehouse" />
            </Form.Item>

            <Form.Item label="Additional Specifications / Notes for Finance" name="notes">
              <TextArea rows={2} placeholder="Any special delivery terms, charging accounts, or notes..." />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* ==================== CONTEST BID MODAL (STAGE 3) ==================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-rose-800">
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded">
              <CloseCircleOutlined />
            </div>
            <span>Contest / Reject Canvass Award (Stage 3)</span>
          </div>
        }
        open={isContestModalOpen}
        onCancel={() => {
          setIsContestModalOpen(false);
          setContestTargetRecord(null);
        }}
        onOk={handleConfirmContestBid}
        confirmLoading={contestSubmitting}
        okText="Confirm Contestation"
        okButtonProps={{ danger: true }}
        width={620}
        destroyOnClose
      >
        <div className="py-2 space-y-3">
          <Alert
            type="warning"
            showIcon
            className="rounded-lg border-amber-200 bg-amber-50"
            message="Contesting Sourcing Award"
            description="If the awarded supplier quotation does not fulfill department specifications or warranty expectations, you must provide a detailed justification. The status will transition to 'Contested' and alert the Canvassing team."
          />

          <Form form={contestForm} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Requisition / Canvass No." name="canvass_no">
                  <Input disabled className="bg-slate-100" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Current Awarded Supplier" name="winning_supplier">
                  <Input disabled className="bg-slate-100 font-semibold" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Reason for Contestation (Required)"
              name="justification"
              rules={[
                { required: true, message: "Please provide a justification for contesting this award" },
                { min: 15, message: "Justification must be at least 15 characters long" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Detail technical non-compliance, incompatible specifications, warranty deficiencies, or alternative pricing evidence..."
              />
            </Form.Item>

            <Form.Item
              label="Alternative Recommendation (Optional)"
              name="alternate_recommendation"
            >
              <TextArea
                rows={2}
                placeholder="e.g., Recommend re-canvassing with Supplier B who offers 3-year on-site SLA..."
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* ==================== CREATE PR MODAL ==================== */}
      <CreatePRModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        departments={departments}
        workflowView={workflowView}
        setWorkflowView={setWorkflowView}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchPurchaseRequests();
        }}
      />

      {/* ==================== PR DETAILS & EVIDENCE MODAL ==================== */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900">{activePR?.pr_no}</span>
              <Tag color={ALL_PR_COLUMNS.find((c) => c.id === activePR?.status)?.color || "blue"}>
                {activePR?.status}
              </Tag>
              {activePR?.sub_category === "HR & Training Services" && (
                <Tag color="purple" className="m-0 font-medium">
                  HR & Training Services
                </Tag>
              )}
            </div>
            <AttachmentBadge count={activePR?.attachments?.length || 0} showLabel />
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>,
          activePR?.status !== "Approved PR" && (
            activePR?.sub_category === "HR & Training Services" ? (
              (() => {
                const nextSig = (activePR?.approvals || []).find((a) => a.status === "pending");
                if (nextSig) {
                  return (
                    <Button
                      key="sign"
                      type="primary"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      icon={<EditOutlined />}
                      onClick={() => handleOpenSignModal(activePR, nextSig)}
                    >
                      Sign as {nextSig.role}
                    </Button>
                  );
                }
                return (
                  <Button
                    key="release"
                    type="primary"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleCardDrop(activePR.id, activePR.status, "Approved PR");
                    }}
                  >
                    Release OpEx Budget
                  </Button>
                );
              })()
            ) : (
              <Button
                key="approve"
                type="primary"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleCardDrop(activePR.id, activePR.status, "Approved PR");
                }}
              >
                Approve PR & Generate Purchase Order
              </Button>
            )
          ),
        ]}
        width={820}
      >
        {activePR && (
          <Tabs
            defaultActiveKey={activePR.sub_category === "HR & Training Services" ? "checklist" : "overview"}
            items={[
              {
                key: "checklist",
                label: (
                  <span className="flex items-center gap-1.5 font-medium">
                    <AuditOutlined className={activePR.sub_category === "HR & Training Services" ? "text-purple-600" : ""} />
                    <span>Approval Checklist & Signatures</span>
                    {activePR.approvals && (
                      <Badge
                        count={`${(activePR.approvals || []).filter((a) => a.status === "approved").length}/${activePR.approvals.length}`}
                        style={{
                          backgroundColor:
                            (activePR.approvals || []).every((a) => a.status === "approved")
                              ? "#52c41a"
                              : "#722ed1",
                        }}
                        size="small"
                      />
                    )}
                  </span>
                ),
                children: (
                  <div className="space-y-4 pt-1">
                    {activePR.sub_category === "HR & Training Services" ? (
                      <Alert
                        type={activePR.status === "Approved PR" ? "success" : "info"}
                        showIcon
                        icon={
                          activePR.status === "Approved PR" ? (
                            <CheckCircleOutlined className="text-emerald-600" />
                          ) : (
                            <ThunderboltOutlined className="text-purple-600" />
                          )
                        }
                        className="border-purple-200 bg-purple-50/70"
                        message={
                          <span className="font-semibold text-purple-950">
                            {activePR.status === "Approved PR"
                              ? "OpEx Budget Released — All 4 Digital Signatures Validated"
                              : "Management Approval Chain (Bypasses PMO & Canvassing)"}
                          </span>
                        }
                        description={
                          activePR.status === "Approved PR" ? (
                            <span className="text-xs text-slate-700">
                              All digital signatures from Dept Head, HR, Finance, and VP have been formally validated. OpEx funds are encumbered and disbursed directly.
                            </span>
                          ) : (
                            <span className="text-xs text-slate-700">
                              This requisition bypasses PMO canvassing and inventory cataloging. Each executive signatory must provide a digital signature below to advance the approval chain.
                            </span>
                          )
                        }
                      />
                    ) : (
                      <Alert
                        type="info"
                        showIcon
                        message="Procurement Requisition Signatures"
                        description="Review the department authorization and procurement certification stages below."
                      />
                    )}

                    {/* Progress Step Bar */}
                    {activePR.approvals && activePR.approvals.length > 0 && (
                      <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
                        <Steps
                          size="small"
                          current={
                            activePR.status === "Approved PR"
                              ? activePR.approvals.length
                              : activePR.approvals.findIndex((a) => a.status === "pending") === -1
                              ? activePR.approvals.length
                              : activePR.approvals.findIndex((a) => a.status === "pending")
                          }
                          status={activePR.status === "Approved PR" ? "finish" : "process"}
                          items={activePR.approvals.map((app) => ({
                            title: app.stage,
                            description: app.status === "approved" ? "Signed" : "Pending",
                          }))}
                        />
                      </div>
                    )}

                    {/* Detailed Approval Cards Checklist */}
                    <div className="space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Signatory Verification & Digital Endorsement Log
                      </div>

                      {(activePR.approvals || []).map((approval, idx) => {
                        const isApproved = approval.status === "approved";
                        const isNextInLine =
                          !isApproved &&
                          (idx === 0 || activePR.approvals[idx - 1].status === "approved");

                        return (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-xl border transition-all ${
                              isApproved
                                ? "bg-emerald-50/40 border-emerald-200"
                                : isNextInLine
                                ? "bg-purple-50/50 border-purple-300 ring-1 ring-purple-200"
                                : "bg-slate-50/60 border-slate-200 opacity-80"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                                    isApproved
                                      ? "bg-emerald-500 text-white"
                                      : isNextInLine
                                      ? "bg-purple-600 text-white shadow-sm"
                                      : "bg-slate-200 text-slate-500"
                                  }`}
                                >
                                  {isApproved ? <CheckOutlined /> : idx + 1}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-sm">
                                      {approval.role}
                                    </span>
                                    {isApproved ? (
                                      <Tag color="green" className="m-0 text-xs font-medium">
                                        Digitally Signed
                                      </Tag>
                                    ) : isNextInLine ? (
                                      <Tag color="purple" className="m-0 text-xs font-semibold animate-pulse">
                                        Action Required
                                      </Tag>
                                    ) : (
                                      <Tag color="default" className="m-0 text-xs text-slate-400">
                                        Awaiting Prior Step
                                      </Tag>
                                    )}
                                  </div>

                                  <div className="text-xs text-slate-600 mt-0.5">
                                    <span className="font-medium text-slate-700">
                                      {approval.signatory_name || "Designated Signatory"}
                                    </span>
                                    {approval.signatory_title && (
                                      <span className="text-slate-400"> • {approval.signatory_title}</span>
                                    )}
                                  </div>

                                  {isApproved ? (
                                    <div className="mt-2 text-xs bg-white/80 p-2 rounded-lg border border-emerald-100 space-y-1">
                                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                                        <ClockCircleOutlined />
                                        <span>Signed at: {approval.signed_at}</span>
                                      </div>
                                      {approval.remarks && (
                                        <div className="text-slate-700 italic">
                                          "{approval.remarks}"
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-400 mt-1">
                                      {isNextInLine
                                        ? "Signature required to transition requisition to the next approver."
                                        : "Waiting for earlier tiers to endorse."}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                {!isApproved && isNextInLine && (
                                  <Button
                                    type="primary"
                                    size="small"
                                    icon={<EditOutlined />}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                    onClick={() => handleOpenSignModal(activePR, approval)}
                                  >
                                    Sign as {approval.role}
                                  </Button>
                                )}
                                {isApproved && (
                                  <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                                    <CheckCircleOutlined /> Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ),
              },
              {
                key: "overview",
                label: "Request Details & Line Items",
                children: (
                  <div className="space-y-4 pt-1">
                    <Descriptions size="small" bordered column={2}>
                      <Descriptions.Item label="PR Type">
                        <Tag color={activePR.sub_category === "HR & Training Services" ? "purple" : "blue"}>
                          {activePR.pr_type || "Goods (Inventoriable)"}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Sub-Category">
                        <span className="font-semibold text-slate-900">{activePR.sub_category || "General Supplies"}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Department">
                        <span className="font-medium">{activePR.department_name}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Priority">
                        <Tag color={activePR.priority === "Urgent" ? "red" : "blue"}>
                          {activePR.priority}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Target Date">
                        {activePR.target_date || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Created On">
                        {activePR.created_at ? dayjs(activePR.created_at).format("YYYY-MM-DD") : "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Pipeline Origin / Links" span={2}>
                        <Space>
                          {activePR.canvass_no && (
                            <Tag color="cyan" className="font-mono text-xs">
                              Canvass RFQ: {activePR.canvass_no}
                            </Tag>
                          )}
                          {activePR.po_no && (
                            <Tag color="green" className="font-mono text-xs">
                              Generated PO: {activePR.po_no}
                            </Tag>
                          )}
                          {activePR.sub_category === "HR & Training Services" && (
                            <Tag color="purple" className="font-mono text-xs">
                              OpEx Direct Budget — PMO Bypassed
                            </Tag>
                          )}
                          {!activePR.canvass_no && !activePR.po_no && activePR.sub_category !== "HR & Training Services" && "Direct Purchase Requisition"}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Requisition Purpose" span={2}>
                        {activePR.purpose}
                      </Descriptions.Item>
                      <Descriptions.Item label="Estimated Budget" span={2}>
                        <span className="text-base font-bold text-slate-900">
                          ₱{Number(activePR.total_estimated_budget || 0).toLocaleString()}
                        </span>
                      </Descriptions.Item>
                    </Descriptions>

                    <Divider orientation="left" className="text-xs text-slate-500 m-0">
                      Line Items / Cost Breakdown ({activePR.items?.length || 0})
                    </Divider>

                    <Table
                      size="small"
                      dataSource={activePR.items}
                      rowKey="id"
                      pagination={false}
                      columns={[
                        {
                          title: "Item / Service Name",
                          dataIndex: "item_name",
                          key: "item_name",
                          render: (name, rec) => (
                            <div>
                              <div className="font-medium text-slate-800">{name}</div>
                              {rec.description && (
                                <div className="text-xs text-slate-400">{rec.description}</div>
                              )}
                            </div>
                          ),
                        },
                        { title: "Qty", dataIndex: "quantity", key: "quantity" },
                        { title: "Unit", dataIndex: "unit", key: "unit" },
                        {
                          title: "Est. Unit Cost",
                          dataIndex: "estimated_unit_cost",
                          key: "estimated_unit_cost",
                          render: (p) => `₱${Number(p).toLocaleString()}`,
                        },
                        {
                          title: "Total Cost",
                          key: "total_cost",
                          render: (_, r) => (
                            <span className="font-semibold">
                              ₱{(Number(r.quantity || 0) * Number(r.estimated_unit_cost || 0)).toLocaleString()}
                            </span>
                          ),
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
                    <span>Evidence & Audit Documents</span>
                    <Badge
                      count={activePR.attachments?.length || 0}
                      style={{ backgroundColor: activePR.attachments?.length ? "#52c41a" : "#d9d9d9" }}
                      size="small"
                    />
                  </span>
                ),
                children: (
                  <EvidenceAttachmentTab
                    module="purchase-requests"
                    recordId={activePR.id}
                    attachments={activePR.attachments || []}
                    currentStage="Purchase Request"
                    onAttachmentChange={(newAttachments) => {
                      setActivePR((prev) => ({
                        ...prev,
                        attachments: newAttachments,
                      }));
                      setPurchaseRequests((prev) =>
                        prev.map((p) =>
                          p.id === activePR.id
                            ? { ...p, attachments: newAttachments }
                            : p
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
                      count={activePR.trail?.length || 0}
                      style={{ backgroundColor: "#1890ff" }}
                      size="small"
                    />
                  </span>
                ),
                children: (
                  <div className="pt-2">
                    <RequestTrailTimeline
                      trail={activePR.trail || []}
                      title={`Purchase Request ${activePR.pr_no} Trail`}
                    />
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>

      {/* ==================== DIGITAL SIGNATURE MODAL ==================== */}
      <SignApprovalModal
        open={isSignModalOpen}
        onCancel={() => setIsSignModalOpen(false)}
        signingTarget={signingTarget}
        onSuccess={async (updatedData) => {
          setIsSignModalOpen(false);
          await fetchPurchaseRequests();
          if (activePR && signingTarget && activePR.id === signingTarget.pr.id && updatedData) {
            setActivePR(updatedData);
          }
        }}
      />

      {/* ==================== KANBAN STAGE TRANSITION CONFIRMATION MODAL ==================== */}
      <KanbanTransitionModal
        open={!!pendingStatusChange}
        item={pendingRecord}
        sourceStatus={pendingRecord?.status}
        targetStatus={pendingStatusChange?.newStatus}
        moduleName="Purchase Request"
        loading={transitionLoading}
        extraAlert={
          pendingStatusChange?.newStatus === "Approved PR" ? (
            pendingRecord?.sub_category === "HR & Training Services" ||
            pendingRecord?.is_bypassed_pmo ? (
              <Alert
                type="success"
                showIcon
                message="OpEx Budget Authorization"
                description="Approving this HR & Training requisition marks all executive approvals as fulfilled and authorizes the immediate disbursement of the OpEx budget."
              />
            ) : (
              <Alert
                type="info"
                showIcon
                message="Automatic Purchase Order Issuance"
                description="Approving this Purchase Request will automatically generate an official Purchase Order and link all attached audit documents."
              />
            )
          ) : null
        }
        onAccept={handleConfirmTransition}
        onCancel={handleCancelTransition}
      />

      {/* ==================== FINANCE REQUEST REVISION MODAL ==================== */}
      <ModalRequestRevision
        open={isRevisionModalOpen}
        onCancel={() => {
          setIsRevisionModalOpen(false);
          setRevisionTargetRecord(null);
        }}
        onConfirm={(recordId, remarks) => handleConfirmRevision(recordId, remarks)}
        record={revisionTargetRecord}
        loading={transitionLoading}
      />

      {/* ==================== DEPARTMENT EDIT & RESUBMIT PR MODAL ==================== */}
      <ModalResubmitPR
        open={isResubmitModalOpen}
        onCancel={() => {
          setIsResubmitModalOpen(false);
          setResubmitTargetRecord(null);
        }}
        onSuccess={(recordId, payload) => handleConfirmResubmit(recordId, payload)}
        record={resubmitTargetRecord}
        loading={transitionLoading}
      />
    </div>
  );
}

// Subcomponent: Create Purchase Request Modal
function CreatePRModal({ open, onCancel, departments, onSuccess, workflowView, setWorkflowView }) {
  if (!open) return null;
  return (
    <CreatePRModalInner
      open={open}
      onCancel={onCancel}
      departments={departments}
      onSuccess={onSuccess}
      workflowView={workflowView}
      setWorkflowView={setWorkflowView}
    />
  );
}

function CreatePRModalInner({ open, onCancel, departments, onSuccess, workflowView, setWorkflowView }) {
  const { message } = App.useApp();
  const [createForm] = Form.useForm();

  const handleCreateSubmit = async (values) => {
    try {
      const items = values.items || [];
      const totalBudget = items.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.estimated_unit_cost) || 0),
        0
      );

      const isHR = values.sub_category === "HR & Training Services";
      const isOpEx = values.pr_type === "Services/OpEx (Budget Only)" || isHR;

      const payload = {
        department_id: values.department_id,
        department_name:
          departments.find((d) => d.id === values.department_id)?.name ||
          departments.find((d) => d.id === values.department_id)?.department_name ||
          "General Administration",
        purpose: values.purpose,
        title: values.purpose,
        pr_type: values.pr_type || "Goods (Inventoriable)",
        sub_category: values.sub_category || "Office & Laboratory Supplies",
        is_bypassed_pmo: isOpEx,
        status: "Pending Finance Approval",
        priority: values.priority || "Normal",
        target_date: values.target_date ? values.target_date.format("YYYY-MM-DD") : dayjs().add(14, "day").format("YYYY-MM-DD"),
        total_estimated_budget: totalBudget,
        items: items.map((i, idx) => ({
          id: idx + 1,
          item_name: i.item_name,
          description: i.description || "",
          quantity: Number(i.quantity) || 1,
          unit: i.unit || "pcs",
          estimated_unit_cost: Number(i.estimated_unit_cost) || 0,
        })),
      };

      const res = await axios.post("/api/purchase-requests", payload);
      message.success(res.data?.message || "Purchase Request created successfully!");
      onCancel();
      onSuccess();

      // If HR & Training created, automatically switch to HR view to reveal it
      if (isHR && workflowView === "pmo") {
        setWorkflowView("hr_training");
      }
    } catch (err) {
      console.error("Failed to create PR:", err);
      message.error("Failed to create Purchase Request.");
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ShoppingCartOutlined className="text-blue-600" />
          <span className="font-bold text-slate-900">
            Create New Purchase Request (PR)
          </span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={740}
      destroyOnClose
    >
      <Form
        form={createForm}
        layout="vertical"
        onFinish={handleCreateSubmit}
        initialValues={{
          pr_type: "Goods (Inventoriable)",
          sub_category: "Office & School Supplies",
          priority: "Normal",
          target_date: dayjs().add(14, "day"),
          department_id: departments[0]?.id || 1,
          items: [{ item_name: "", quantity: 1, unit: "pcs", estimated_unit_cost: 0 }],
        }}
        className="pt-2"
      >
        {/* PR Type & Sub-category (Dynamic Branching) */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="pr_type"
              label={<span className="font-semibold text-slate-800">PR Type</span>}
              rules={[{ required: true, message: "Please select PR Type." }]}
            >
              <Select
                onChange={(val) => {
                  if (val === "Services/OpEx (Budget Only)") {
                    createForm.setFieldsValue({ sub_category: "HR & Training Services" });
                  } else {
                    createForm.setFieldsValue({ sub_category: "Office & School Supplies" });
                  }
                }}
              >
                <Option value="Goods (Inventoriable)">
                  <div className="flex items-center gap-1.5">
                    <ShoppingOutlined className="text-blue-600" />
                    <span>Goods (Inventoriable)</span>
                  </div>
                </Option>
                <Option value="Services/OpEx (Budget Only)">
                  <div className="flex items-center gap-1.5">
                    <DollarOutlined className="text-purple-600" />
                    <span>Services/OpEx (Budget Only)</span>
                  </div>
                </Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.pr_type !== currentValues.pr_type}
            >
              {({ getFieldValue }) => {
                const prType = getFieldValue("pr_type");
                const isOpEx = prType === "Services/OpEx (Budget Only)";

                return (
                  <Form.Item
                    name="sub_category"
                    label={<span className="font-semibold text-slate-800">Sub-Category</span>}
                    rules={[{ required: true, message: "Please select sub-category." }]}
                  >
                    {isOpEx ? (
                      <Select>
                        <Option value="HR & Training Services">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-purple-800">HR & Training Services</span>
                            <Tag color="purple" className="m-0 text-[10px]">Management Sequence</Tag>
                          </div>
                        </Option>
                        <Option value="Equipment Repair & Maintenance">Equipment Repair & Maintenance</Option>
                        <Option value="Software Subscriptions & Cloud">Software Subscriptions & Cloud</Option>
                        <Option value="Professional Consulting">Professional Consulting</Option>
                      </Select>
                    ) : (
                      <Select>
                        <Option value="Office & School Supplies">Office & School Supplies</Option>
                        <Option value="Laboratory Equipment & Reagents">Laboratory Equipment & Reagents</Option>
                        <Option value="IT Hardware & Peripherals">IT Hardware & Peripherals</Option>
                        <Option value="Facility Maintenance & Materials">Facility Maintenance & Materials</Option>
                      </Select>
                    )}
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
        </Row>

        {/* Dynamic Warning Alert for HR & Training Services */}
        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => prev.sub_category !== cur.sub_category}
        >
          {({ getFieldValue }) => {
            const subCat = getFieldValue("sub_category");
            if (subCat === "HR & Training Services") {
              return (
                <Alert
                  type="warning"
                  showIcon
                  icon={<ThunderboltOutlined className="text-purple-600" />}
                  className="border-purple-300 bg-purple-50 text-purple-950 mb-4"
                  message={<span className="font-bold text-purple-900">Dynamic Approval Sequence Activated</span>}
                  description={
                    <div className="text-xs space-y-1">
                      <p className="m-0">
                        This request will <strong>completely bypass PMO, Inventory, and Canvassing workflows</strong>.
                      </p>
                      <p className="m-0 font-medium text-purple-800">
                        Approval Sequence: <strong>Pending Dept Head ➔ Pending HR ➔ Pending Finance ➔ Pending VP Acad / VPAsa</strong>.
                      </p>
                      <p className="m-0 text-slate-500">
                        These cards will not appear in the PMO board. An executive checklist will track digital signatures before budget release.
                      </p>
                    </div>
                  }
                />
              );
            }
            return null;
          }}
        </Form.Item>

        <Form.Item
          name="purpose"
          label="Requisition Purpose / Justification"
          rules={[{ required: true, message: "Please enter purpose or justification." }]}
        >
          <Input placeholder="e.g., Annual faculty development symposium, training accreditation and materials..." />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="department_id"
              label="Requesting Department"
              rules={[{ required: true, message: "Please select department." }]}
            >
              <Select placeholder="Select department">
                {departments.map((d) => (
                  <Option key={d.id} value={d.id}>
                    {d.name || d.department_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="priority" label="Priority Level">
              <Select>
                <Option value="Urgent">Urgent</Option>
                <Option value="High">High</Option>
                <Option value="Normal">Normal</Option>
                <Option value="Low">Low</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="target_date" label="Required Date">
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" className="text-xs text-slate-500 m-0">
          Requisition Items / Expense Breakdown
        </Divider>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <div className="space-y-2 mt-2">
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2"
                >
                  <Row gutter={12}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "item_name"]}
                        label="Item / Service Name"
                        rules={[{ required: true, message: "Required" }]}
                        className="m-0"
                      >
                        <Input placeholder="e.g. Workshop Facilitation Fee, Training Manuals" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        label="Qty / Pax"
                        rules={[{ required: true, message: "Required" }]}
                        className="m-0"
                      >
                        <InputNumber min={1} className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "unit"]}
                        label="Unit"
                        className="m-0"
                      >
                        <Input placeholder="pax, sessions" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "estimated_unit_cost"]}
                        label="Est. Cost (₱)"
                        className="m-0"
                      >
                        <InputNumber min={0} className="w-full" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <div className="flex items-center justify-between pt-1">
                    <Form.Item
                      {...restField}
                      name={[name, "description"]}
                      className="m-0 flex-1 mr-2"
                    >
                      <Input placeholder="Detailed scope of services, participant inclusions..." />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button
                        danger
                        type="text"
                        size="small"
                        onClick={() => remove(name)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="dashed"
                onClick={() => add({ item_name: "", quantity: 1, unit: "pcs", estimated_unit_cost: 0 })}
                block
                icon={<PlusOutlined />}
              >
                Add Another Item / Expense
              </Button>
            </div>
          )}
        </Form.List>

        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Submit Purchase Request
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

// Subcomponent: Digital Signature Modal
function SignApprovalModal({ open, onCancel, signingTarget, onSuccess }) {
  if (!open || !signingTarget) return null;
  return (
    <SignApprovalModalInner
      open={open}
      onCancel={onCancel}
      signingTarget={signingTarget}
      onSuccess={onSuccess}
    />
  );
}

function SignApprovalModalInner({ open, onCancel, signingTarget, onSuccess }) {
  const { message } = App.useApp();
  const [signatureForm] = Form.useForm();
  const [signingLoading, setSigningLoading] = useState(false);

  const handleConfirmSignature = async () => {
    try {
      const values = await signatureForm.validateFields();
      setSigningLoading(true);

      const res = await axios.post(`/api/purchase-requests/${signingTarget.pr.id}/sign`, {
        role: signingTarget.approval.role,
        signatory_name: values.signatory_name,
        remarks: values.remarks,
      });

      message.success(res.data?.message || `Digital signature recorded for ${signingTarget.approval.role}!`);
      onSuccess(res.data?.data);
    } catch (err) {
      console.error("Signature registration failed:", err);
      message.error("Failed to record digital signature.");
    } finally {
      setSigningLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <AuditOutlined className="text-purple-600" />
          <span className="font-bold text-slate-900">
            Register Digital Signature — {signingTarget?.approval?.role}
          </span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleConfirmSignature}
      confirmLoading={signingLoading}
      okText="Sign & Advance Approval"
      okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700" }}
      width={540}
      destroyOnClose
    >
      <div className="space-y-3 pt-2">
        <Alert
          type="info"
          showIcon
          message={`Executive Stage: ${signingTarget?.approval?.stage}`}
          description={`You are registering an official digital signature for ${signingTarget?.pr?.pr_no}. This will record your credential in the audit trail and advance the Kanban board to the next approver.`}
          className="text-xs"
        />

        <Form
          form={signatureForm}
          layout="vertical"
          initialValues={{
            signatory_name: signingTarget?.approval?.signatory_name || signingTarget?.approval?.signatory_title || "",
            remarks: `Digitally endorsed and validated for ${signingTarget?.approval?.role || ""}.`,
          }}
        >
          <Form.Item
            name="signatory_name"
            label="Signatory Full Name & Designation"
            rules={[{ required: true, message: "Please enter signatory name." }]}
          >
            <Input prefix={<UserOutlined className="text-slate-400" />} />
          </Form.Item>

          <Form.Item
            name="remarks"
            label="Endorsement Remarks / Audit Justification"
            rules={[{ required: true, message: "Please enter endorsement remarks." }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="e.g. Budget validated against FY2026 Faculty Development Allocation. Approved for disbursement."
            />
          </Form.Item>
        </Form>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
          <SafetyOutlined className="text-emerald-600 text-base" />
          <span>
            Digital Signature will be timestamped with an immutable SHA-256 audit hash and permanently attached to this Purchase Request.
          </span>
        </div>
      </div>
    </Modal>
  );
}
