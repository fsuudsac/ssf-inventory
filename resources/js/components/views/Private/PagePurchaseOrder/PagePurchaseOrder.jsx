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
  message,
  notification,
} from "antd";
import {
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
  CarOutlined,
  InboxOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  EyeOutlined,
  ShopOutlined,
  BankOutlined,
  CheckOutlined,
  PaperClipOutlined,
  HistoryOutlined,
  FileExcelOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import KanbanBoard, { AttachmentBadge, StageTimerBadge } from "../../../common/KanbanBoard";
import EvidenceAttachmentTab from "../../../common/EvidenceAttachmentTab";
import KanbanTransitionModal from "../../../common/KanbanTransitionModal";
import RequestTrailTimeline from "../../../common/RequestTrailTimeline";
import { useProcurementRealtime } from "../../../providers/ProcurementRealtimeProvider";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export const PO_COLUMNS = [
  { id: "Draft", title: "Draft", color: "#8c8c8c", icon: <FileDoneOutlined /> },
  { id: "Sent to Supplier", title: "Sent to Supplier", color: "#fa8c16", icon: <ExclamationCircleOutlined /> },
  { id: "In Transit", title: "In Transit", color: "#1890ff", icon: <CarOutlined /> },
  { id: "Partially Received", title: "Partially Received", color: "#722ed1", icon: <InboxOutlined /> },
  { id: "Fully Received", title: "Fully Received", color: "#52c41a", icon: <CheckCircleOutlined /> },
];

export default function PagePurchaseOrder() {
  const { message, notification } = App.useApp();
  const {
    unifiedRecords,
    readyForPORecords,
    issuedPORecords,
    purchaseOrders: contextPOs,
    generatePO,
    refreshAll,
  } = useProcurementRealtime();

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePOTab, setActivePOTab] = useState("ready_for_po"); // "ready_for_po" | "issued_pos"
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "table"
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Pipeline PO Generation Modal state
  const [generatingRecord, setGeneratingRecord] = useState(null);
  const [isGenerateDocModalOpen, setIsGenerateDocModalOpen] = useState(false);
  const [generatingLoading, setGeneratingLoading] = useState(false);
  const [generateForm] = Form.useForm();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activePO, setActivePO] = useState(null);

  // PMO Master Procurement Report state
  const [reportSearchText, setReportSearchText] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("all");
  const [reportDeptFilter, setReportDeptFilter] = useState("all");
  const [auditTrailModalRecord, setAuditTrailModalRecord] = useState(null);
  const [isAuditTrailModalOpen, setIsAuditTrailModalOpen] = useState(false);

  // Kanban Drag-and-Drop & List View Dropdown Confirmation Interception
  // pendingStatusChange state object stores recordId and newStatus
  const [pendingStatusChange, setPendingStatusChange] = useState(null); // { recordId, newStatus }
  const [transitionLoading, setTransitionLoading] = useState(false);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/purchase-orders");
      if (res.data?.data) {
        setPurchaseOrders(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load purchase orders:", err);
      message.error("Failed to fetch purchase orders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [supRes, whRes, deptRes] = await Promise.all([
        axios.get("/api/suppliers"),
        axios.get("/api/warehouses"),
        axios.get("/api/departments").catch(() => ({ data: { data: [] } })),
      ]);
      if (supRes.data?.data) setSuppliers(supRes.data.data);
      if (whRes.data?.data) setWarehouses(whRes.data.data);
      if (deptRes.data?.data) setDepartments(deptRes.data.data);
    } catch (err) {
      console.error("Failed to fetch reference data:", err);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
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

    if (!newStatus) return;

    const record = purchaseOrders.find(
      (p) => String(p.id) === String(recordId) || p.po_no === recordId
    );
    if (!record || record.status === newStatus) return;

    // Do not update the main data state yet. Store in pendingStatusChange to open confirmation modal.
    setPendingStatusChange({
      recordId: record.id,
      newStatus,
    });
  };

  // When onChange (for the List dropdown) is triggered
  const handleListStatusChange = (recordId, newStatus) => {
    const record = purchaseOrders.find(
      (p) => String(p.id) === String(recordId) || p.po_no === recordId
    );
    if (!record || record.status === newStatus) return;

    // Do not update the main data state yet. Store in pendingStatusChange to open confirmation modal.
    setPendingStatusChange({
      recordId: record.id,
      newStatus,
    });
  };

  const handleCardDrop = (recordId, sourceColId, targetColId) => {
    handleDragEnd(recordId, sourceColId, targetColId);
  };

  const pendingRecord = useMemo(() => {
    if (!pendingStatusChange) return null;
    return (
      purchaseOrders.find(
        (p) => String(p.id) === String(pendingStatusChange.recordId)
      ) || null
    );
  }, [pendingStatusChange, purchaseOrders]);

  // If the user clicks 'Accept' in the modal, apply the change from pendingStatusChange
  // to the main data state so the UI updates, then close the modal and clear the pending state.
  const handleConfirmTransition = async (remarks = "") => {
    if (!pendingStatusChange) return;
    const { recordId, newStatus } = pendingStatusChange;

    const targetPO = purchaseOrders.find((p) => String(p.id) === String(recordId));

    // 1. Apply the change from pendingStatusChange to the main data state so the UI updates
    setPurchaseOrders((prev) =>
      prev.map((p) => (String(p.id) === String(recordId) ? { ...p, status: newStatus } : p))
    );

    // 2. Close the modal and clear the pending state
    setPendingStatusChange(null);

    // 3. Persist update via server API
    setTransitionLoading(true);
    try {
      const res = await axios.patch(`/api/purchase-orders/${recordId}/status`, {
        status: newStatus,
        remarks: remarks || undefined,
        performed_by: "Property Custodian / PMO",
        role: "Purchasing Officer",
      });

      if (res.data?.data) {
        setPurchaseOrders((prev) =>
          prev.map((p) => (String(p.id) === String(recordId) ? { ...p, ...res.data.data } : p))
        );
      }

      if ((newStatus === "Fully Received" || newStatus === "Order Received") && res.data?.restockedItems?.length > 0) {
        notification.success({
          message: "Inventory Restocked Successfully!",
          description: (
            <div className="space-y-1">
              <p>{res.data.message}</p>
              <div className="text-xs text-slate-600">
                {res.data.restockedItems.map((it, idx) => (
                  <div key={idx}>
                    • <strong>{it.item_name}</strong>: +{it.received_quantity} units (Current Stock: {it.new_stock})
                  </div>
                ))}
              </div>
            </div>
          ),
          duration: 6,
        });
      } else {
        message.success(res.data?.message || `Purchase Order moved to "${newStatus}"`);
      }
    } catch (err) {
      console.error("Failed to update PO status:", err);
      message.error("Failed to update status on server. Reverting...");
      fetchPurchaseOrders();
    } finally {
      setTransitionLoading(false);
    }
  };

  // If the user clicks 'Cancel', simply close the modal and clear the pending state
  // so the UI naturally reverts to its original position.
  const handleCancelTransition = () => {
    setPendingStatusChange(null);
  };

  const handleOpenGenerateDocModal = (record) => {
    setGeneratingRecord(record);
    const suggestedPoNo = `PO-${dayjs().format("YYYY")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const winningSupplier = record.winning_supplier || record.awarded_vendor || (suppliers[0]?.supplier_name || "Preferred Vendor");
    const winningAmount = record.winning_bid_amount || record.total_amount || record.total_estimated_budget || 0;

    generateForm.setFieldsValue({
      po_no: suggestedPoNo,
      supplier_name: winningSupplier,
      total_amount: winningAmount,
      warehouse_id: warehouses[0]?.id || 1,
      payment_terms: "Net 30 Days",
      expected_delivery_date: dayjs().add(14, "day"),
      terms_and_conditions: "Standard university procurement terms. Supplier shall deliver in accordance with specified quality standards and delivery schedule.",
    });
    setIsGenerateDocModalOpen(true);
  };

  const handleIssueGeneratedPO = async () => {
    try {
      const values = await generateForm.validateFields();
      if (!generatingRecord) return;
      setGeneratingLoading(true);

      const payload = {
        po_no: values.po_no,
        supplier_name: values.supplier_name,
        total_amount: Number(values.total_amount) || 0,
        warehouse_id: values.warehouse_id || 1,
        payment_terms: values.payment_terms || "Net 30 Days",
        delivery_date: values.expected_delivery_date ? values.expected_delivery_date.format("YYYY-MM-DD") : dayjs().add(14, "day").format("YYYY-MM-DD"),
        remarks: values.terms_and_conditions || "Official PO issued via pipeline",
      };

      const res = await generatePO(generatingRecord.id, payload);

      notification.success({
        message: "Purchase Order Generated Successfully!",
        description: (
          <div>
            <p>Official <strong>{payload.po_no}</strong> issued to <strong>{payload.supplier_name}</strong> for <strong>₱{payload.total_amount.toLocaleString()}</strong>.</p>
            <p className="text-xs text-slate-500 mt-1">Status updated to <strong>'PO Issued'</strong>. Record removed from Ready for PO and added to Issued POs.</p>
          </div>
        ),
        duration: 6,
      });

      setIsGenerateDocModalOpen(false);
      setGeneratingRecord(null);
      fetchPurchaseOrders();
    } catch (err) {
      console.error("Failed to generate PO:", err);
      message.error("Failed to generate Purchase Order document.");
    } finally {
      setGeneratingLoading(false);
    }
  };

  // Render individual PO card on the Kanban board
  const renderPOCard = (po) => {
    const isFullyReceived = po.status === "Fully Received";
    const isInTransit = po.status === "Ordered";

    return (
      <Card
        size="small"
        className={`bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none ${
          isFullyReceived ? "border-emerald-200 bg-emerald-50/10" : ""
        }`}
      >
        <div className="space-y-2">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              {po.po_no}
            </span>
            <div className="flex items-center gap-1 flex-wrap justify-end">
              <StageTimerBadge
                entryTimestamp={po.stage_entered_at || po.updated_at || po.created_at}
                currentStage={po.status}
                thresholdDays={3}
                history={{
                  canvass_started_at: po.canvass_started_at,
                  pr_submitted_at: po.pr_submitted_at,
                  finance_approved_at: po.finance_approved_at,
                  po_dispatched_at: po.po_dispatched_at,
                  items_received_at: po.items_received_at,
                }}
              />
              <AttachmentBadge count={po.attachments?.length || 0} />
              {po.pr_no && (
                <Tooltip title={`Originated from Purchase Request ${po.pr_no}`}>
                  <Tag color="purple" className="m-0 text-[10px] font-mono">
                    {po.pr_no}
                  </Tag>
                </Tooltip>
              )}
              {po.canvass_no && (
                <Tooltip title={`Originated from Canvass ${po.canvass_no}`}>
                  <Tag color="cyan" className="m-0 text-[10px] font-mono">
                    {po.canvass_no}
                  </Tag>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Supplier & Requesting Department */}
          <div>
            <Text strong className="text-sm text-slate-900 block line-clamp-1">
              {po.supplier_name}
            </Text>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <Tag color="blue" className="m-0 text-[11px] font-medium flex items-center gap-1 px-1.5 py-0.5">
                <BankOutlined className="text-[10px]" />
                <span>Requested By: {po.department_name || "PMO"}</span>
              </Tag>
            </div>
            <div className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1 mt-1">
              <ShopOutlined className="text-slate-400" />
              <span>{po.warehouse_name}</span>
            </div>
          </div>

          {/* Total Amount & Items */}
          <div className="flex items-center justify-between text-xs py-1.5 border-y border-slate-100 bg-slate-50/60 -mx-3 px-3">
            <div>
              <span className="text-slate-400">Total: </span>
              <span className="font-bold text-slate-900">
                ₱{Number(po.total_amount || 0).toLocaleString()}
              </span>
            </div>
            <div className="text-slate-500 font-medium">
              {po.items?.length || 0} items
            </div>
          </div>

          {/* Delivery & Payment Terms */}
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
            <span>Due: {po.expected_delivery_date}</span>
            <span>{po.payment_terms}</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              className="text-xs text-slate-600 hover:text-blue-600 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setActivePO(po);
                setIsDetailModalOpen(true);
              }}
            >
              Inspect
            </Button>

            {!isFullyReceived && (
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardDrop(po.id, po.status, "Fully Received");
                }}
              >
                Mark Received
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Tabular columns
  const tableColumns = [
    {
      title: "PO Number",
      dataIndex: "po_no",
      key: "po_no",
      render: (text) => <span className="font-mono font-semibold text-blue-700">{text}</span>,
    },
    {
      title: "Supplier",
      dataIndex: "supplier_name",
      key: "supplier_name",
      render: (text, record) => (
        <div>
          <div className="font-medium text-slate-900">{text}</div>
          {record.canvass_no && (
            <div className="text-[11px] text-slate-400 font-mono">From: {record.canvass_no}</div>
          )}
        </div>
      ),
    },
    {
      title: "Requesting Department",
      dataIndex: "department_name",
      key: "department_name",
      render: (deptName) => (
        <span className="font-medium text-slate-800 flex items-center gap-1.5">
          <BankOutlined className="text-blue-500" />
          {deptName || "Physical Plant & Property Management Office (PMO)"}
        </span>
      ),
    },
    {
      title: "Destination Warehouse",
      dataIndex: "warehouse_name",
      key: "warehouse_name",
    },
    {
      title: "Expected Delivery",
      dataIndex: "expected_delivery_date",
      key: "expected_delivery_date",
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val) => <span className="font-semibold">₱{Number(val).toLocaleString()}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 185,
      render: (status, record) => {
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              value={status}
              className="w-full min-w-[155px]"
              onChange={(newStatus) => {
                if (newStatus === status) return;
                handleListStatusChange(record.id, newStatus);
              }}
              popupMatchSelectWidth={false}
              size="middle"
            >
              {PO_COLUMNS.map((col) => (
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
              setActivePO(record);
              setIsDetailModalOpen(true);
            }}
          >
            Details
          </Button>
          {record.status !== "Fully Received" && (
            <Button
              size="small"
              type="primary"
              className="bg-emerald-600 text-white"
              onClick={() => handleCardDrop(record.id, record.status, "Fully Received")}
            >
              Receive & Restock
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // PMO Master Procurement Report records memo
  const masterProcurementRecords = useMemo(() => {
    let source = (unifiedRecords && unifiedRecords.length > 0) ? unifiedRecords : purchaseOrders;

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
          (r.po_number && r.po_number.toLowerCase().includes(q)) ||
          (r.canvass_no && r.canvass_no.toLowerCase().includes(q)) ||
          (r.department_name && r.department_name.toLowerCase().includes(q)) ||
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.winning_supplier && r.winning_supplier.toLowerCase().includes(q)) ||
          (r.supplier_name && r.supplier_name.toLowerCase().includes(q)) ||
          (r.awarded_supplier && r.awarded_supplier.toLowerCase().includes(q)) ||
          (r.items &&
            Array.isArray(r.items) &&
            r.items.some((it) => it.item_name?.toLowerCase().includes(q)))
      );
    }

    return records;
  }, [unifiedRecords, purchaseOrders, reportStatusFilter, reportDeptFilter, reportSearchText]);

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
        "PO Number / RFQ Reference",
        "Requesting Department",
        "Winning / Awarded Supplier",
        "Current Pipeline Stage",
        "Encumbered Budget (PHP)",
        "Date Initiated",
        "Lead Time",
      ];
      const rows = masterProcurementRecords.map((r) => {
        const pr = r.pr_no || "Pending PR";
        const poRef = r.po_number || r.canvass_no || `REF-${r.id}`;
        const dept = r.department_name || r.department_code || "University Department";
        const supplier =
          r.winning_supplier ||
          r.supplier_name ||
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
          `"${poRef}"`,
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
          {r.po_number ? (
            <span className="text-[10px] text-emerald-700 font-mono block mt-0.5 font-semibold">
              PO: {r.po_number}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              RFQ: {r.canvass_no || `RFQ-${r.id}`}
            </span>
          )}
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
          r.supplier_name ||
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
              setActivePO(record);
              setIsDetailModalOpen(true);
            }}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  // Statistics metrics
  const totalPOs = purchaseOrders.length;
  const inTransitCount = purchaseOrders.filter((p) => p.status === "Ordered").length;
  const pendingApprovalCount = purchaseOrders.filter(
    (p) => p.status === "Pending Approval"
  ).length;
  const fullyReceivedCount = purchaseOrders.filter(
    (p) => p.status === "Fully Received"
  ).length;

  return (
    <div className="pmo-purchase-order-module space-y-5 p-4 max-w-7xl mx-auto">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <Title level={3} className="m-0 text-slate-900">
            Purchase Orders (Kanban Tracking)
          </Title>
          <Paragraph className="text-slate-500 m-0 text-sm">
            Monitor PO fulfillment, track delivery milestones, and automatically restock Inventory upon full receipt.
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
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Purchase Order
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border border-slate-200 bg-white">
            <Statistic
              title={<span className="text-xs text-slate-500">Total Purchase Orders</span>}
              value={totalPOs}
              prefix={<FileDoneOutlined className="text-blue-500 text-sm" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border border-slate-200 bg-white">
            <Statistic
              title={<span className="text-xs text-slate-500">Pending Approval</span>}
              value={pendingApprovalCount}
              prefix={<ExclamationCircleOutlined className="text-amber-500 text-sm" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border border-slate-200 bg-white">
            <Statistic
              title={<span className="text-xs text-slate-500">Ordered / In Transit</span>}
              value={inTransitCount}
              prefix={<CarOutlined className="text-blue-500 text-sm" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border border-slate-200 bg-white">
            <Statistic
              title={<span className="text-xs text-slate-500">Fully Received & Restocked</span>}
              value={fullyReceivedCount}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined className="text-emerald-500 text-sm" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs: Ready for PO (Strict Pipeline Filter) vs Issued Purchase Orders (Execution) */}
      <Tabs
        activeKey={activePOTab}
        onChange={setActivePOTab}
        type="card"
        className="bg-transparent"
        items={[
          {
            key: "ready_for_po",
            label: (
              <span className="font-semibold px-2 flex items-center gap-2">
                <FileDoneOutlined className="text-blue-600" />
                <span>Ready for PO (Pending Generation)</span>
                <Badge
                  count={readyForPORecords.length}
                  style={{ backgroundColor: "#1890ff" }}
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
                        <strong>Stage 6 — Strict Pipeline Filter:</strong> ONLY shows records where status ==={" "}
                        <Tag color="blue" className="font-semibold">Ready for PO</Tag>. These requisitions have successfully traversed Stage 1 (RFQ Canvass), Stage 2 (Quotations & Winning Bid Award), Stage 3 (Department Formal PR), Stage 4 (Finance Budget Clearance), and Stage 5 (VPASA Executive Sign-off). In this final stage, generate the official PO document to dispatch to the vendor and advance status to <strong>'PO Issued'</strong>.
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {readyForPORecords.length} record(s) ready for PO issuance
                      </span>
                    </div>
                  }
                />

                {readyForPORecords.length === 0 ? (
                  <Card className="rounded-xl border border-slate-200 p-12 text-center shadow-sm bg-white">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
                      <FileDoneOutlined style={{ fontSize: 32 }} />
                    </div>
                    <Title level={4} className="text-slate-800">
                      No Records Pending Purchase Order Generation
                    </Title>
                    <Paragraph className="text-slate-500 max-w-md mx-auto">
                      When a vendor bid is awarded in the Canvassing Module, the record automatically moves here with status <strong>'Ready for PO'</strong> for you to generate the official Purchase Order document.
                    </Paragraph>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {readyForPORecords.map((rec) => {
                      const amount = rec.winning_bid_amount || rec.total_amount || rec.total_estimated_budget || 0;
                      const vendor = rec.winning_supplier || rec.awarded_vendor || "Awarded Vendor";

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
                              <Tag color="cyan">Ready for PO</Tag>
                            </div>

                            <h4 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2">
                              {rec.title || rec.purpose || "Procurement Requisition"}
                            </h4>

                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1.5 mb-3">
                              <div className="flex items-center justify-between text-slate-600">
                                <span className="font-medium">{rec.department_name}</span>
                                <span className="text-slate-400">By: {rec.requested_by}</span>
                              </div>
                              <div className="pt-1.5 border-t border-slate-200 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400">Awarded Vendor:</span>
                                  <strong className="text-blue-900">{vendor}</strong>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400">Winning Amount:</span>
                                  <strong className="text-emerald-700 font-bold text-sm">
                                    ₱{amount.toLocaleString()}
                                  </strong>
                                </div>
                              </div>
                            </div>

                            {rec.items && rec.items.length > 0 && (
                              <div className="text-xs text-slate-500 mb-3">
                                <span className="font-semibold text-slate-700 block mb-1">Items ({rec.items.length}):</span>
                                <div className="space-y-0.5 max-h-20 overflow-y-auto">
                                  {rec.items.slice(0, 3).map((it, idx) => (
                                    <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                                      <span className="truncate max-w-[160px]">• {it.item_name}</span>
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

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-auto">
                            <Button
                              type="primary"
                              className="bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center justify-center gap-1.5"
                              icon={<FileDoneOutlined />}
                              onClick={() => handleOpenGenerateDocModal(rec)}
                            >
                              Generate PO Document
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
            key: "issued_pos",
            label: (
              <span className="font-semibold px-2 flex items-center gap-2">
                <CarOutlined className="text-slate-600" />
                <span>Issued Purchase Orders (Execution)</span>
                <Badge
                  count={purchaseOrders.length}
                  style={{ backgroundColor: "#52c41a" }}
                  overflowCount={99}
                />
              </span>
            ),
            children: (
              viewMode === "kanban" ? (
                <KanbanBoard
                  columns={PO_COLUMNS}
                  items={purchaseOrders}
                  onDragEnd={handleDragEnd}
                  onCardDrop={handleDragEnd}
                  renderCard={renderPOCard}
                  onCardClick={(item) => {
                    setActivePO(item);
                    setIsDetailModalOpen(true);
                  }}
                />
              ) : (
                <Card className="rounded-xl border border-slate-200 bg-white p-0">
                  <Table
                    columns={tableColumns}
                    dataSource={purchaseOrders}
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
                      placeholder="Search PR, PO, Dept, Item, Supplier..."
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
                    rowKey={(r) => r.id || r.pr_no || r.po_no || r.po_number || Math.random()}
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

      {/* ==================== CREATE PURCHASE ORDER MODAL ==================== */}
      <CreatePOModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        suppliers={suppliers}
        warehouses={warehouses}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchPurchaseOrders();
        }}
      />

      {/* ==================== PURCHASE ORDER DETAILS MODAL ==================== */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900">{activePO?.po_no}</span>
              <Tag color={PO_COLUMNS.find((c) => c.id === activePO?.status)?.color}>
                {activePO?.status}
              </Tag>
            </div>
            <AttachmentBadge count={activePO?.attachments?.length || 0} showLabel />
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>,
          activePO?.status !== "Fully Received" && activePO?.status !== "Order Received" && (
            <Button
              key="receive"
              type="primary"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setIsDetailModalOpen(false);
                handleCardDrop(activePO.id, activePO.status, "Order Received");
              }}
            >
              Receive All & Restock Inventory
            </Button>
          ),
        ]}
        width={780}
      >
        {activePO && (
          <Tabs
            defaultActiveKey="overview"
            items={[
              {
                key: "overview",
                label: "Order Details & Line Items",
                children: (
                  <div className="space-y-4 pt-1">
                    <Descriptions size="small" bordered column={2}>
                      <Descriptions.Item label="Requesting Department">
                        <span className="font-semibold text-blue-700 flex items-center gap-1.5">
                          <BankOutlined />
                          {activePO.department_name || "Physical Plant & Property Management Office (PMO)"}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Supplier">
                        <span className="font-medium">{activePO.supplier_name}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Destination">
                        {activePO.warehouse_name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Issue Date">
                        {activePO.po_date}
                      </Descriptions.Item>
                      <Descriptions.Item label="Expected Delivery">
                        {activePO.expected_delivery_date}
                      </Descriptions.Item>
                      <Descriptions.Item label="Payment Terms">
                        {activePO.payment_terms}
                      </Descriptions.Item>
                      <Descriptions.Item label="Pipeline Origin">
                        <Space>
                          {activePO.pr_no && (
                            <Tag color="purple" className="font-mono text-xs">
                              PR: {activePO.pr_no}
                            </Tag>
                          )}
                          {activePO.canvass_no && (
                            <Tag color="cyan" className="font-mono text-xs">
                              RFQ: {activePO.canvass_no}
                            </Tag>
                          )}
                          {!activePO.pr_no && !activePO.canvass_no && "Direct Order"}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Total Amount" span={2}>
                        <span className="text-base font-bold text-slate-900">
                          ₱{Number(activePO.total_amount).toLocaleString()}
                        </span>
                      </Descriptions.Item>
                    </Descriptions>

                    <Divider orientation="left" className="text-xs text-slate-500 m-0">
                      Purchased Line Items
                    </Divider>

                    <Table
                      size="small"
                      dataSource={activePO.items}
                      rowKey="id"
                      pagination={false}
                      columns={[
                        {
                          title: "Item Name",
                          dataIndex: "item_name",
                          key: "item_name",
                          render: (name, rec) => (
                            <div>
                              <div className="font-medium text-slate-800">{name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                Code: {rec.item_code} | Cat: {rec.category}
                              </div>
                            </div>
                          ),
                        },
                        { title: "Qty", dataIndex: "quantity", key: "quantity" },
                        {
                          title: "Unit Price",
                          dataIndex: "unit_price",
                          key: "unit_price",
                          render: (p) => `₱${Number(p).toLocaleString()}`,
                        },
                        {
                          title: "Total Price",
                          dataIndex: "total_price",
                          key: "total_price",
                          render: (p) => <span className="font-semibold">₱${Number(p).toLocaleString()}</span>,
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
                      count={activePO.attachments?.length || 0}
                      style={{ backgroundColor: activePO.attachments?.length ? "#52c41a" : "#d9d9d9" }}
                      size="small"
                    />
                  </span>
                ),
                children: (
                  <EvidenceAttachmentTab
                    module="purchase-orders"
                    recordId={activePO.id}
                    attachments={activePO.attachments || []}
                    currentStage="Purchase Order"
                    onAttachmentChange={(newAttachments) => {
                      setActivePO((prev) => ({
                        ...prev,
                        attachments: newAttachments,
                      }));
                      setPurchaseOrders((prev) =>
                        prev.map((p) =>
                          p.id === activePO.id
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
                      count={activePO.trail?.length || 0}
                      style={{ backgroundColor: "#1890ff" }}
                      size="small"
                    />
                  </span>
                ),
                children: (
                  <div className="pt-2">
                    <RequestTrailTimeline
                      trail={activePO.trail || []}
                      title={`Purchase Order ${activePO.po_no} Trail`}
                    />
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>

      {/* ==================== KANBAN STAGE TRANSITION CONFIRMATION MODAL ==================== */}
      <KanbanTransitionModal
        open={!!pendingStatusChange}
        item={pendingRecord}
        sourceStatus={pendingRecord?.status}
        targetStatus={pendingStatusChange?.newStatus}
        moduleName="Purchase Order"
        loading={transitionLoading}
        extraAlert={
          (pendingStatusChange?.newStatus === "Order Received" || pendingStatusChange?.newStatus === "Fully Received") && (
            <Alert
              type="success"
              showIcon
              message="Automatic Inventory Restocking"
              description={`Transitioning to "${pendingStatusChange?.newStatus}" will automatically increment on-hand stock quantities in warehouse: "${pendingRecord?.warehouse_name}".`}
            />
          )
        }
        onAccept={handleConfirmTransition}
        onCancel={handleCancelTransition}
      />

      {/* Generate PO Document Modal for Ready for PO Pipeline */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-blue-700">
            <FileDoneOutlined />
            <span>Generate Purchase Order Document</span>
          </div>
        }
        open={isGenerateDocModalOpen}
        onCancel={() => {
          setIsGenerateDocModalOpen(false);
          setGeneratingRecord(null);
        }}
        onOk={handleIssueGeneratedPO}
        okText="Issue Purchase Order"
        okButtonProps={{ className: "bg-blue-600 hover:bg-blue-700 text-white", loading: generatingLoading }}
        destroyOnClose
        width={620}
      >
        <Form form={generateForm} layout="vertical" className="pt-2">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Source Requisition:</span>
              <strong className="text-slate-800 font-mono">{generatingRecord?.pr_no || `PR-${generatingRecord?.id}`}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department:</span>
              <strong className="text-slate-800">{generatingRecord?.department_name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Purpose / Title:</span>
              <span className="text-slate-700 font-medium">{generatingRecord?.title || generatingRecord?.purpose}</span>
            </div>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="po_no"
                label="PO Number"
                rules={[{ required: true, message: "PO Number is required" }]}
              >
                <Input placeholder="PO-2026-XXXX" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="total_amount"
                label="Total Contract Amount (₱)"
                rules={[{ required: true, message: "Amount is required" }]}
              >
                <InputNumber
                  className="w-full"
                  formatter={(value) => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value.replace(/\₱\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="supplier_name"
            label="Awarded Supplier / Vendor"
            rules={[{ required: true, message: "Supplier is required" }]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="warehouse_id"
                label="Receiving Warehouse"
                rules={[{ required: true, message: "Warehouse is required" }]}
              >
                <Select placeholder="Select warehouse">
                  {warehouses.map((w) => (
                    <Option key={w.id} value={w.id}>
                      {w.warehouse_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="payment_terms"
                label="Payment Terms"
                rules={[{ required: true, message: "Payment terms are required" }]}
              >
                <Select placeholder="Select payment terms">
                  <Option value="Net 15 Days">Net 15 Days</Option>
                  <Option value="Net 30 Days">Net 30 Days</Option>
                  <Option value="Net 60 Days">Net 60 Days</Option>
                  <Option value="Progressive Billing">Progressive Billing</Option>
                  <Option value="Cash on Delivery (COD)">Cash on Delivery (COD)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="expected_delivery_date"
            label="Target Delivery Date"
            rules={[{ required: true, message: "Delivery date is required" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="terms_and_conditions"
            label="Terms & Special Instructions"
          >
            <Input.TextArea rows={3} placeholder="Standard terms, packaging requirements, delivery window..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* PMO Master Report Audit Trail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined className="text-blue-600" />
            <span className="font-bold text-slate-800">
              Procurement Audit Trail — {auditTrailModalRecord?.pr_no || auditTrailModalRecord?.po_no || auditTrailModalRecord?.po_number || "Transaction"}
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
            title={`Lifecycle Audit Trail: ${auditTrailModalRecord?.pr_no || auditTrailModalRecord?.po_no || auditTrailModalRecord?.po_number || "Procurement Lifecycle"}`}
          />
        </div>
      </Modal>
    </div>
  );
}

function CreatePOModal({ open, onCancel, suppliers, warehouses, onSuccess }) {
  if (!open) return null;
  return (
    <CreatePOModalInner
      open={open}
      onCancel={onCancel}
      suppliers={suppliers}
      warehouses={warehouses}
      onSuccess={onSuccess}
    />
  );
}

function CreatePOModalInner({ open, onCancel, suppliers, warehouses, onSuccess }) {
  const { message } = App.useApp();
  const [createForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleCreateSubmit = async (values) => {
    setSubmitting(true);
    try {
      const selectedSupplier = suppliers.find((s) => s.id === values.supplier_id);
      const selectedWarehouse = warehouses.find((w) => w.id === values.warehouse_id);

      const items = (values.items || []).map((it, idx) => ({
        id: idx + 1,
        item_name: it.item_name,
        item_code: it.item_code || `SKU-${Date.now().toString().slice(-4)}`,
        category: it.category || "General Supplies",
        quantity: it.quantity,
        unit_price: it.unit_price,
        total_price: it.quantity * it.unit_price,
      }));

      const totalAmount = items.reduce((acc, it) => acc + it.total_price, 0);

      const payload = {
        supplier_id: values.supplier_id,
        supplier_name: selectedSupplier?.name || "Independent Supplier",
        warehouse_id: values.warehouse_id,
        warehouse_name: selectedWarehouse?.name || "Main Campus Storage",
        expected_delivery_date: values.expected_delivery_date.format("YYYY-MM-DD"),
        payment_terms: values.payment_terms || "Net 30 Days",
        status: "Draft",
        total_amount: totalAmount,
        notes: values.notes,
        items,
      };

      const res = await axios.post("/api/purchase-orders", payload);
      message.success(res.data?.message || "Purchase order created!");
      onSuccess();
    } catch (err) {
      console.error("Failed to create PO:", err);
      message.error("Failed to create purchase order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Create New Purchase Order"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      destroyOnClose
    >
      <Form
        form={createForm}
        layout="vertical"
        onFinish={handleCreateSubmit}
        initialValues={{
          supplier_id: suppliers[0]?.id || 1,
          warehouse_id: warehouses[0]?.id || 1,
          expected_delivery_date: dayjs().add(10, "day"),
          payment_terms: "Net 30 Days",
          items: [
            {
              item_name: "",
              item_code: "",
              category: "Office Supplies",
              quantity: 1,
              unit_price: 0,
            },
          ],
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="supplier_id"
              label="Supplier"
              rules={[{ required: true, message: "Select supplier" }]}
            >
              <Select placeholder="Select supplier">
                {suppliers.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="warehouse_id"
              label="Receiving Warehouse"
              rules={[{ required: true, message: "Select receiving warehouse" }]}
            >
              <Select placeholder="Select warehouse">
                {warehouses.map((w) => (
                  <Option key={w.id} value={w.id}>
                    {w.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="expected_delivery_date"
              label="Expected Delivery Date"
              rules={[{ required: true }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="payment_terms" label="Payment Terms">
              <Input placeholder="e.g. Net 30 Days" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" className="text-xs text-slate-500">
          Order Items
        </Divider>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <div className="space-y-3">
              {fields.map(({ key, name, ...restField }, idx) => (
                <Card key={key} size="small" className="bg-slate-50 border border-slate-200">
                  <Row gutter={12}>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[name, "item_name"]}
                        label={`Item #${idx + 1} Name`}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input placeholder="Item name" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item {...restField} name={[name, "category"]} label="Category">
                        <Input placeholder="Category" />
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
                      <Form.Item
                        {...restField}
                        name={[name, "unit_price"]}
                        label="Unit Price (₱)"
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
                      Remove
                    </Button>
                  )}
                </Card>
              ))}

              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Item
              </Button>
            </div>
          )}
        </Form.List>

        <Form.Item name="notes" label="Special Delivery Instructions" className="mt-4">
          <Input.TextArea rows={2} placeholder="Delivery gate, inspection contact, etc." />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Save Purchase Order
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
