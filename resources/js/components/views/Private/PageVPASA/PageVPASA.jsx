import React, { useState, useMemo } from "react";
import {
  Card,
  Button,
  Tag,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  Table,
  Badge,
  Descriptions,
  Divider,
  App,
  Tooltip,
  Alert,
  Row,
  Col,
  Statistic,
  Tabs,
  Select,
} from "antd";
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  AuditOutlined,
  FileTextOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BankOutlined,
  ShopOutlined,
  SafetyOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  SearchOutlined,
  FilterOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useProcurementRealtime } from "../../../providers/ProcurementRealtimeProvider";
import RequestTrailTimeline from "../../../common/RequestTrailTimeline";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function PageVPASA() {
  const { message, notification, modal } = App.useApp();
  const {
    unifiedRecords,
    vpasaPendingRecords,
    readyForPORecords,
    authorizeVPASA,
    refreshAll,
    currentUser,
    departments: contextDepartments,
  } = useProcurementRealtime();

  const departments = contextDepartments || [];

  const [activeTabKey, setActiveTabKey] = useState("pending_authorization");
  const [activeRecord, setActiveRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signingRecord, setSigningRecord] = useState(null);
  const [signForm] = Form.useForm();
  const [signingLoading, setSigningLoading] = useState(false);
  const [reportSearchText, setReportSearchText] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("all");
  const [reportDepartmentFilter, setReportDepartmentFilter] = useState("all");
  const [auditTrailModalRecord, setAuditTrailModalRecord] = useState(null);
  const [isAuditTrailModalOpen, setIsAuditTrailModalOpen] = useState(false);

  // Records that have reached Stage 5 (Finance Approved - Pending VPASA) and beyond
  const executiveReportRecords = useMemo(() => {
    const stage5PlusStatuses = [
      "Finance Approved - Pending VPASA",
      "Ready for PO",
      "PO Issued",
      "Purchase Order Issued",
      "Sent to Supplier",
      "In Transit",
      "Partially Received",
      "Fully Received",
    ];

    let filtered = unifiedRecords.filter((r) => {
      return (
        stage5PlusStatuses.includes(r.status) ||
        Boolean(r.vpasa_authorized_at) ||
        Boolean(r.finance_approved_at)
      );
    });

    if (reportStatusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === reportStatusFilter);
    }

    if (reportDepartmentFilter !== "all") {
      filtered = filtered.filter(
        (r) =>
          r.department_name === reportDepartmentFilter ||
          String(r.department_id) === String(reportDepartmentFilter)
      );
    }

    if (reportSearchText.trim()) {
      const q = reportSearchText.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          (r.pr_no && r.pr_no.toLowerCase().includes(q)) ||
          (r.department_name && r.department_name.toLowerCase().includes(q)) ||
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.purpose && r.purpose.toLowerCase().includes(q)) ||
          (r.winning_supplier && r.winning_supplier.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [unifiedRecords, reportStatusFilter, reportDepartmentFilter, reportSearchText]);

  // Export Executive Authorization Report to CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        "PR Number",
        "Requesting Department",
        "Purpose / Project",
        "Total Cost (PHP)",
        "Finance Clearance Date",
        "VPASA Sign-off Date",
        "Status",
      ];

      const rows = executiveReportRecords.map((r) => [
        `"${r.pr_no || r.canvass_no || `PR-${r.id}`}"`,
        `"${r.department_name || ""}"`,
        `"${(r.title || r.purpose || "").replace(/"/g, '""')}"`,
        `"${Number(r.winning_bid_amount || r.total_amount || r.total_estimated_budget || 0).toFixed(2)}"`,
        `"${r.finance_approved_at || "Cleared"}"`,
        `"${r.vpasa_authorized_at || (r.status === "Ready for PO" || r.status === "PO Issued" ? r.updated_at || "Authorized" : "Pending Sign-off")}"`,
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
        `VPASA_Executive_Procurement_Report_${dayjs().format("YYYYMMDD_HHmmss")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success("Executive Authorization CSV report exported successfully.");
    } catch (err) {
      console.error("Export error:", err);
      message.error("Failed to generate CSV export.");
    }
  };

  const handleExportPDF = () => {
    message.info("Opening system print dialog for executive PDF generation...");
    window.print();
  };

  // Columns for the Executive Authorization Report
  const reportColumns = [
    {
      title: "PR Number",
      key: "pr_no",
      width: 140,
      render: (_, r) => (
        <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          {r.pr_no || r.canvass_no || `PR-${r.id}`}
        </span>
      ),
    },
    {
      title: "Requesting Department",
      dataIndex: "department_name",
      key: "department_name",
      render: (dept) => (
        <div className="flex items-center gap-1.5 font-medium text-slate-800">
          <BankOutlined className="text-purple-600" />
          <span>{dept || "General Services"}</span>
        </div>
      ),
    },
    {
      title: "Purpose / Project",
      key: "purpose",
      render: (_, r) => (
        <div>
          <div className="font-semibold text-slate-900 line-clamp-1">
            {r.title || r.purpose || "Procurement Requisition"}
          </div>
          <div className="text-[11px] text-slate-400 italic line-clamp-1">
            {r.notes || (r.items ? `${r.items.length} line item(s)` : "")}
          </div>
        </div>
      ),
    },
    {
      title: "Total Cost",
      key: "total_cost",
      width: 150,
      render: (_, r) => {
        const val = Number(
          r.winning_bid_amount || r.total_amount || r.total_estimated_budget || 0
        );
        return (
          <span className="font-bold text-emerald-700 text-sm">
            ₱{val.toLocaleString()}
          </span>
        );
      },
    },
    {
      title: "Finance Clearance Date",
      key: "finance_clearance_date",
      width: 170,
      render: (_, r) => (
        <div className="text-xs space-y-0.5">
          <div className="text-slate-700 font-medium">
            {r.finance_approved_at ? r.finance_approved_at.slice(0, 10) : "Approved"}
          </div>
          <Tag color="green" className="text-[10px] m-0">
            {r.finance_approved_by || "Finance Cleared"}
          </Tag>
        </div>
      ),
    },
    {
      title: "VPASA Sign-off Date",
      key: "vpasa_signoff_date",
      width: 180,
      render: (_, r) => {
        if (r.vpasa_authorized_at) {
          return (
            <div className="text-xs space-y-0.5">
              <div className="text-purple-900 font-semibold">
                {r.vpasa_authorized_at.slice(0, 10)}
              </div>
              <Tag color="purple" className="text-[10px] m-0">
                {r.vpasa_signatory || "Dr. Hernandez (VPASA)"}
              </Tag>
            </div>
          );
        }
        if (
          r.status === "Ready for PO" ||
          r.status === "PO Issued" ||
          r.status === "Purchase Order Issued" ||
          r.status === "Fully Received"
        ) {
          return (
            <div className="text-xs space-y-0.5">
              <div className="text-purple-900 font-semibold">
                {r.updated_at ? r.updated_at.slice(0, 10) : "Authorized"}
              </div>
              <Tag color="purple" className="text-[10px] m-0">
                Executive Signed
              </Tag>
            </div>
          );
        }
        return (
          <Tag color="gold" className="text-xs font-medium">
            Awaiting Sign-off
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 170,
      render: (status) => {
        let color = "default";
        if (status === "Finance Approved - Pending VPASA") color = "gold";
        else if (status === "Ready for PO") color = "cyan";
        else if (status === "PO Issued" || status === "Purchase Order Issued") color = "green";
        else if (status === "In Transit" || status === "Sent to Supplier") color = "blue";
        else if (status === "Fully Received") color = "success";
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
      width: 190,
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
              setActiveRecord(r);
              setIsDetailModalOpen(true);
            }}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  // Records that have already been authorized by VPASA
  const authorizedRecords = useMemo(() => {
    return unifiedRecords.filter(
      (r) =>
        r.vpasa_authorized_at ||
        r.status === "Ready for PO" ||
        r.status === "PO Issued" ||
        r.status === "Purchase Order Issued"
    );
  }, [unifiedRecords]);

  // Handle open digital executive authorization modal
  const handleOpenSignModal = (record) => {
    setSigningRecord(record);
    signForm.setFieldsValue({
      signatory_name: currentUser?.name || "Dr. Arturo M. Hernandez, Ph.D. (VPASA)",
      remarks: "Final executive clearance granted. Certified compliant with university procurement guidelines.",
    });
    setIsSignModalOpen(true);
  };

  // Submit VPASA Executive Authorization
  const handleConfirmAuthorization = async () => {
    try {
      const values = await signForm.validateFields();
      if (!signingRecord) return;
      setSigningLoading(true);

      await authorizeVPASA(signingRecord.id, {
        signatory_name: values.signatory_name,
        remarks: values.remarks,
        role: "VPASA (Vice President for Administration & Student Affairs)",
      });

      notification.success({
        message: "Executive Authorization Registered!",
        description: (
          <div className="space-y-1">
            <p>
              Requisition <strong>{signingRecord.pr_no || signingRecord.title}</strong> has received final VPASA digital sign-off.
            </p>
            <p className="text-xs text-emerald-700 font-medium">
              Status updated to <strong>'Ready for PO'</strong>. The Purchasing Office can now generate the official Purchase Order.
            </p>
          </div>
        ),
        duration: 6,
      });

      setIsSignModalOpen(false);
      setSigningRecord(null);
      if (typeof refreshAll === "function") refreshAll();
    } catch (err) {
      console.error("Authorization failed:", err);
      message.error("Failed to register executive authorization.");
    } finally {
      setSigningLoading(false);
    }
  };

  const columns = [
    {
      title: "PR / Ref No.",
      dataIndex: "pr_no",
      key: "pr_no",
      render: (text, r) => (
        <div>
          <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs">
            {text || `PR-${r.id}`}
          </span>
          {r.canvass_no && (
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              RFQ: {r.canvass_no}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Purpose & Requesting Unit",
      dataIndex: "purpose",
      key: "purpose",
      render: (text, r) => (
        <div>
          <div className="font-semibold text-slate-900 text-sm">
            {text || r.title || "University Procurement Request"}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <Tag color="blue" className="m-0 text-[11px] flex items-center gap-1">
              <BankOutlined /> {r.department_name}
            </Tag>
            <span>By: {r.requested_by || "Department Requester"}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Winning Bid & Supplier",
      key: "winning_bid",
      render: (_, r) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 font-medium text-slate-800 text-xs">
            <ShopOutlined className="text-blue-600" />
            <span>{r.winning_supplier || r.supplier_name || "Awarded Vendor"}</span>
          </div>
          <div className="font-bold text-emerald-700 text-sm">
            ₱{Number(r.winning_bid_amount || r.total_amount || r.total_estimated_budget || 0).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: "Finance Clearance",
      key: "finance_clearance",
      render: (_, r) => (
        <div className="space-y-1">
          <Tag color="green" icon={<CheckCircleOutlined />} className="text-xs">
            Budget Verified
          </Tag>
          <div className="text-[11px] text-slate-500">
            {r.finance_approved_by || "Finance Officer"}
          </div>
        </div>
      ),
    },
    {
      title: "Pipeline Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Finance Approved - Pending VPASA" ? "gold" : "cyan"} className="font-semibold">
          {status}
        </Tag>
      ),
    },
    {
      title: "Executive Action",
      key: "action",
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
              setActiveRecord(r);
              setIsDetailModalOpen(true);
            }}
          >
            Review Details
          </Button>
          {r.status === "Finance Approved - Pending VPASA" && (
            <Button
              type="primary"
              size="small"
              icon={<SafetyCertificateOutlined />}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold"
              onClick={() => handleOpenSignModal(r)}
            >
              Sign & Authorize
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="vpasa-module space-y-5 p-4 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
            <SafetyCertificateOutlined className="text-2xl" />
          </div>
          <div>
            <Title level={3} className="m-0 text-slate-900">
              Stage 5: Final Executive Authorization (VPASA)
            </Title>
            <Paragraph className="text-slate-500 m-0 text-sm">
              Vice President for Administration and Student Affairs executive digital signature portal for finance-cleared procurement requisitions.
            </Paragraph>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tag color="purple" className="px-3 py-1 text-xs font-semibold">
            Role: VPASA Executive Signatory
          </Tag>
        </div>
      </div>

      {/* KPI Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border border-slate-200 bg-white">
            <Statistic
              title={<span className="text-xs text-slate-500">Awaiting VPASA Signature</span>}
              value={vpasaPendingRecords.length}
              valueStyle={{ color: "#d48806" }}
              prefix={<ClockCircleOutlined className="text-amber-500 text-sm" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border border-slate-200 bg-white">
            <Statistic
              title={<span className="text-xs text-slate-500">Pending Value (₱)</span>}
              value={vpasaPendingRecords.reduce(
                (sum, r) => sum + Number(r.winning_bid_amount || r.total_amount || 0),
                0
              )}
              precision={2}
              prefix="₱"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border border-slate-200 bg-white">
            <Statistic
              title={<span className="text-xs text-slate-500">Ready for PO Generation</span>}
              value={readyForPORecords.length}
              valueStyle={{ color: "#08979c" }}
              prefix={<ThunderboltOutlined className="text-cyan-500 text-sm" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border border-slate-200 bg-white">
            <Statistic
              title={<span className="text-xs text-slate-500">Total Authorized (Executive)</span>}
              value={authorizedRecords.length}
              valueStyle={{ color: "#389e0d" }}
              prefix={<CheckCircleOutlined className="text-emerald-500 text-sm" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        type="card"
        items={[
          {
            key: "pending_authorization",
            label: (
              <span className="font-semibold px-2 flex items-center gap-2">
                <ClockCircleOutlined className="text-amber-500" />
                <span>Pending Executive Authorization</span>
                <Badge
                  count={vpasaPendingRecords.length}
                  style={{ backgroundColor: "#d48806" }}
                />
              </span>
            ),
            children: (
              <div className="space-y-4">
                <Alert
                  type="info"
                  showIcon
                  className="rounded-lg border-purple-200 bg-purple-50/70 text-purple-900"
                  message={
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span>
                        <strong>Stage 5 Gatekeeper Rule:</strong> Strictly filters for requisitions with status{" "}
                        <Tag color="gold" className="font-bold">Finance Approved - Pending VPASA</Tag>.
                        Executive authorization registers your digital credential and advances the status to{" "}
                        <Tag color="cyan" className="font-bold">Ready for PO</Tag>, unlocking Purchase Order creation in Stage 6.
                      </span>
                    </div>
                  }
                />

                {vpasaPendingRecords.length === 0 ? (
                  <Card className="rounded-xl border border-slate-200 p-12 text-center bg-white">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600 mb-4">
                      <SafetyCertificateOutlined style={{ fontSize: 32 }} />
                    </div>
                    <Title level={4} className="text-slate-800">
                      No Requisitions Awaiting Executive Authorization
                    </Title>
                    <Paragraph className="text-slate-500 max-w-md mx-auto">
                      All finance-approved purchase requests have been authorized. When Finance approves a Stage 4 PR, it will appear here for VPASA signoff.
                    </Paragraph>
                  </Card>
                ) : (
                  <Card className="rounded-xl border border-slate-200 shadow-xs bg-white">
                    <Table
                      dataSource={vpasaPendingRecords}
                      columns={columns}
                      rowKey="id"
                      pagination={{ pageSize: 8 }}
                    />
                  </Card>
                )}
              </div>
            ),
          },
          {
            key: "executive_report",
            label: (
              <span className="font-semibold px-2 flex items-center gap-2">
                <FileTextOutlined className="text-purple-600" />
                <span>Executive Authorization Report</span>
                <Badge
                  count={executiveReportRecords.length}
                  style={{ backgroundColor: "#722ed1" }}
                  overflowCount={999}
                />
              </span>
            ),
            children: (
              <div className="space-y-4">
                {/* Executive Report Control Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Input
                      placeholder="Search PR No, Dept, or Project..."
                      prefix={<SearchOutlined className="text-slate-400" />}
                      value={reportSearchText}
                      onChange={(e) => setReportSearchText(e.target.value)}
                      style={{ width: 260 }}
                      allowClear
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Filter Stage:</span>
                      <Select
                        value={reportStatusFilter}
                        onChange={setReportStatusFilter}
                        style={{ width: 230 }}
                      >
                        <Option value="all">All Executive Stages (Stage 5+)</Option>
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
                      <span className="text-xs text-slate-500 font-medium">Department:</span>
                      <Select
                        value={reportDepartmentFilter}
                        onChange={setReportDepartmentFilter}
                        style={{ width: 220 }}
                        placeholder="All Departments"
                      >
                        <Option value="all">All Departments</Option>
                        {departments.map((d) => (
                          <Option key={d.id} value={d.name || d.department_name}>
                            {d.name || d.department_name} ({d.code || d.abbr || "DEPT"})
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      icon={<FileExcelOutlined />}
                      className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-medium"
                      onClick={handleExportCSV}
                    >
                      Export to CSV
                    </Button>
                    <Button
                      icon={<PrinterOutlined />}
                      onClick={handleExportPDF}
                      className="font-medium"
                    >
                      Export to PDF
                    </Button>
                  </div>
                </div>

                {/* Summary Metrics Bar for the Report */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                      <FileTextOutlined className="text-base" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Filtered Transactions</div>
                      <div className="text-base font-bold text-slate-800">
                        {executiveReportRecords.length} Requisitions
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <DollarOutlined className="text-base" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Total Executive Value</div>
                      <div className="text-base font-bold text-emerald-700">
                        ₱
                        {executiveReportRecords
                          .reduce(
                            (acc, r) =>
                              acc +
                              Number(
                                r.winning_bid_amount ||
                                  r.total_amount ||
                                  r.total_estimated_budget ||
                                  0
                              ),
                            0
                          )
                          .toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                      <CheckCircleOutlined className="text-base" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Fully PO Completed</div>
                      <div className="text-base font-bold text-blue-700">
                        {
                          executiveReportRecords.filter(
                            (r) =>
                              r.status === "PO Issued" ||
                              r.status === "Purchase Order Issued" ||
                              r.status === "Fully Received"
                          ).length
                        }{" "}
                        POs
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table Component */}
                <Card className="rounded-xl border border-slate-200 shadow-xs bg-white">
                  <Table
                    dataSource={executiveReportRecords}
                    columns={reportColumns}
                    rowKey="id"
                    pagination={{ pageSize: 8, showSizeChanger: true }}
                    locale={{ emptyText: "No executive transactions match the selected filter." }}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: "authorized_history",
            label: (
              <span className="font-semibold px-2 flex items-center gap-2">
                <CheckCircleOutlined className="text-emerald-500" />
                <span>Executive Authorized Archive ({authorizedRecords.length})</span>
              </span>
            ),
            children: (
              <Card className="rounded-xl border border-slate-200 shadow-xs bg-white">
                <Table
                  dataSource={authorizedRecords}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 8 }}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Review Details Modal */}
      {activeRecord && (
        <Modal
          title={
            <div className="flex items-center gap-2">
              <FileTextOutlined className="text-purple-600" />
              <span className="font-bold text-slate-900">
                Requisition Review — {activeRecord.pr_no || activeRecord.title}
              </span>
            </div>
          }
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>,
            activeRecord.status === "Finance Approved - Pending VPASA" && (
              <Button
                key="sign"
                type="primary"
                icon={<SafetyCertificateOutlined />}
                className="bg-purple-700 hover:bg-purple-800"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenSignModal(activeRecord);
                }}
              >
                Sign & Authorize
              </Button>
            ),
          ]}
          width={700}
        >
          <div className="space-y-4 pt-2">
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="PR Number">
                <span className="font-mono font-bold text-purple-700">{activeRecord.pr_no}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color="gold">{activeRecord.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {activeRecord.department_name}
              </Descriptions.Item>
              <Descriptions.Item label="Requester">
                {activeRecord.requested_by}
              </Descriptions.Item>
              <Descriptions.Item label="Purpose" span={2}>
                {activeRecord.purpose || activeRecord.title}
              </Descriptions.Item>
              <Descriptions.Item label="Winning Supplier">
                <strong>{activeRecord.winning_supplier || activeRecord.supplier_name || "Awarded Vendor"}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Awarded Contract Amount">
                <strong className="text-emerald-700 text-sm">
                  ₱{Number(activeRecord.winning_bid_amount || activeRecord.total_amount || 0).toLocaleString()}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Finance Endorsement" span={2}>
                <div className="text-xs text-slate-700">
                  Cleared by: <strong>{activeRecord.finance_approved_by || "Finance Gatekeeper"}</strong> on{" "}
                  {activeRecord.finance_approved_at || "Recent"}
                </div>
              </Descriptions.Item>
            </Descriptions>

            {activeRecord.items && activeRecord.items.length > 0 && (
              <div>
                <Divider orientation="left" className="text-xs text-slate-500 m-0 mb-2">
                  Line Items ({activeRecord.items.length})
                </Divider>
                <Table
                  dataSource={activeRecord.items}
                  size="small"
                  pagination={false}
                  rowKey={(_, idx) => idx}
                  columns={[
                    { title: "Item", dataIndex: "item_name", key: "item_name" },
                    { title: "Qty", dataIndex: "quantity", key: "quantity", width: 80 },
                    { title: "Unit", dataIndex: "unit", key: "unit", width: 80 },
                    {
                      title: "Est. Cost",
                      dataIndex: "estimated_unit_cost",
                      key: "estimated_unit_cost",
                      render: (c) => `₱${Number(c || 0).toLocaleString()}`,
                    },
                  ]}
                />
              </div>
            )}

            {activeRecord.trail && activeRecord.trail.length > 0 && (
              <div>
                <Divider orientation="left" className="text-xs text-slate-500 m-0 mb-2">
                  Procurement Audit Trail ({activeRecord.trail.length})
                </Divider>
                <div className="max-h-60 overflow-y-auto pr-1">
                  <RequestTrailTimeline
                    trail={activeRecord.trail}
                    title={`Audit Trail: ${activeRecord.pr_no || activeRecord.title || "Requisition"}`}
                  />
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Digital Executive Signature Modal */}
      {signingRecord && (
        <Modal
          title={
            <div className="flex items-center gap-2">
              <SafetyCertificateOutlined className="text-purple-600" />
              <span className="font-bold text-slate-900">
                VPASA Executive Authorization — {signingRecord.pr_no || signingRecord.title}
              </span>
            </div>
          }
          open={isSignModalOpen}
          onCancel={() => setIsSignModalOpen(false)}
          onOk={handleConfirmAuthorization}
          confirmLoading={signingLoading}
          okText="Affix Digital Signature & Advance to PO"
          okButtonProps={{ className: "bg-purple-700 hover:bg-purple-800 font-semibold" }}
          width={560}
          destroyOnClose
        >
          <div className="space-y-3 pt-2">
            <Alert
              type="info"
              showIcon
              message="Final Stage Authorization"
              description={`Affixing executive authorization for ${signingRecord.pr_no} completes the executive gatekeeping pipeline. Status will immediately transition to 'Ready for PO'.`}
              className="text-xs"
            />

            <Form form={signForm} layout="vertical">
              <Form.Item
                name="signatory_name"
                label="Executive Signatory Name & Designation"
                rules={[{ required: true, message: "Please provide signatory name." }]}
              >
                <Input prefix={<UserOutlined className="text-slate-400" />} />
              </Form.Item>

              <Form.Item
                name="remarks"
                label="Executive Endorsement / Approval Remarks"
                rules={[{ required: true, message: "Please enter endorsement remarks." }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="e.g. Budget and comparative abstract certified compliant. Approved for Purchase Order issuance."
                />
              </Form.Item>
            </Form>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
              <SafetyOutlined className="text-purple-700 text-lg flex-shrink-0" />
              <span>
                Timestamped executive audit record with immutable verification hash will be sealed on this procurement record.
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* VPASA Module Audit Trail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined className="text-purple-600" />
            <span className="font-bold text-slate-800">
              Procurement Audit Trail — {auditTrailModalRecord?.pr_no || auditTrailModalRecord?.canvass_no || "Requisition"}
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
            title={`Lifecycle Audit Trail: ${auditTrailModalRecord?.pr_no || auditTrailModalRecord?.title || "Requisition"}`}
          />
        </div>
      </Modal>
    </div>
  );
}
