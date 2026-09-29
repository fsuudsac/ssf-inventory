import React, { useState } from "react";
import { Table, Tag, Input, Space, Button, Card, Typography, Tooltip, Empty } from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  FileDoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PaperClipOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const formatPHP = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(num);
};

export default function CompletedTable({
  title = "Completed & Archived Records",
  dataSource = [],
  loading = false,
  onRefresh,
  onView,
  type = "po", // "po" | "finance" | "canvass" | "custom"
  customColumns = null,
}) {
  const [searchText, setSearchText] = useState("");

  const filteredData = dataSource.filter((item) => {
    if (!searchText) return true;
    const q = searchText.toLowerCase();
    const str = [
      item.po_no,
      item.canvass_no,
      item.pr_no,
      item.title,
      item.department_name,
      item.supplier_name,
      item.status,
      item.finance_status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return str.includes(q);
  });

  const getStatusTag = (status) => {
    switch (status) {
      case "Fully Received":
      case "Finance Approved":
      case "Approved":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            {status}
          </Tag>
        );
      case "Cancelled":
      case "Rejected":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            {status}
          </Tag>
        );
      case "Partially Received":
        return <Tag color="purple">{status}</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const defaultColumns = {
    po: [
      {
        title: "PO Number",
        dataIndex: "po_no",
        key: "po_no",
        render: (val, record) => (
          <div>
            <Text strong className="text-blue-600 font-mono text-xs">
              {val}
            </Text>
            {record.canvass_no && (
              <div className="text-[11px] text-slate-400">Ref: {record.canvass_no}</div>
            )}
          </div>
        ),
      },
      {
        title: "Supplier",
        dataIndex: "supplier_name",
        key: "supplier_name",
        render: (val) => <span className="font-medium text-slate-800 text-xs">{val}</span>,
      },
      {
        title: "Department",
        dataIndex: "department_name",
        key: "department_name",
        render: (val) => <span className="text-xs text-slate-600">{val || "General Procurement"}</span>,
      },
      {
        title: "Items / Warehouse",
        key: "warehouse_and_items",
        render: (_, record) => (
          <div className="text-xs">
            <span className="text-slate-700 font-medium">
              {record.items?.length || 0} item(s)
            </span>
            <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
              {record.warehouse_name}
            </div>
          </div>
        ),
      },
      {
        title: "Total Amount",
        dataIndex: "total_amount",
        key: "total_amount",
        align: "right",
        render: (val) => (
          <span className="font-semibold text-slate-800 text-xs">{formatPHP(val)}</span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        render: (status) => getStatusTag(status),
      },
      {
        title: "Received / Completion Date",
        key: "dates",
        render: (_, record) => (
          <span className="text-xs text-slate-500">
            {record.received_date || record.updated_at?.slice(0, 10) || record.created_at?.slice(0, 10)}
          </span>
        ),
      },
      {
        title: "Evidence",
        key: "evidence",
        align: "center",
        render: (_, record) => {
          const count = record.attachments?.length || 0;
          return count > 0 ? (
            <Tag color="cyan" className="m-0 text-xs">
              <PaperClipOutlined className="mr-1" />
              {count}
            </Tag>
          ) : (
            <span className="text-slate-300 text-xs">—</span>
          );
        },
      },
      {
        title: "Action",
        key: "action",
        align: "center",
        render: (_, record) => (
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onView && onView(record)}
            className="text-xs"
          >
            View Details
          </Button>
        ),
      },
    ],

    finance: [
      {
        title: "RFQ / PR Ref",
        dataIndex: "canvass_no",
        key: "canvass_no",
        render: (val, record) => (
          <div>
            <Text strong className="text-blue-600 font-mono text-xs">
              {val}
            </Text>
            {record.po_no && (
              <div className="text-[11px] text-emerald-600 font-medium">PO: {record.po_no}</div>
            )}
          </div>
        ),
      },
      {
        title: "Requisition Title",
        dataIndex: "title",
        key: "title",
        render: (val) => <span className="font-medium text-slate-800 text-xs">{val}</span>,
      },
      {
        title: "Department",
        dataIndex: "department_name",
        key: "department_name",
        render: (val) => <span className="text-xs text-slate-700">{val}</span>,
      },
      {
        title: "Winning Bidder",
        key: "winning_bidder",
        render: (_, record) => {
          const winningBid = record.supplier_bids?.find((b) => b.id === record.winning_bid_id);
          return (
            <div className="text-xs">
              <div className="font-medium text-slate-800">
                {winningBid?.supplier_name || "Awarded Supplier"}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {formatPHP(record.winning_bid_amount || winningBid?.bid_amount)}
              </div>
            </div>
          );
        },
      },
      {
        title: "Finance Status",
        dataIndex: "finance_status",
        key: "finance_status",
        align: "center",
        render: (status) => getStatusTag(status),
      },
      {
        title: "Evidence Attached",
        key: "evidence",
        align: "center",
        render: (_, record) => {
          const count = record.attachments?.length || 0;
          return count > 0 ? (
            <Tag color="cyan" className="m-0 text-xs">
              <PaperClipOutlined className="mr-1" />
              {count} docs
            </Tag>
          ) : (
            <span className="text-slate-300 text-xs">—</span>
          );
        },
      },
      {
        title: "Action",
        key: "action",
        align: "center",
        render: (_, record) => (
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onView && onView(record)}
            className="text-xs"
          >
            Review Record
          </Button>
        ),
      },
    ],

    canvass: [
      {
        title: "RFQ Number",
        dataIndex: "canvass_no",
        key: "canvass_no",
        render: (val) => (
          <Text strong className="text-blue-600 font-mono text-xs">
            {val}
          </Text>
        ),
      },
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        render: (val) => <span className="font-medium text-slate-800 text-xs">{val}</span>,
      },
      {
        title: "Department",
        dataIndex: "department_name",
        key: "department_name",
        render: (val) => <span className="text-xs text-slate-700">{val}</span>,
      },
      {
        title: "Line Items",
        key: "items_count",
        render: (_, record) => (
          <span className="text-xs text-slate-600">{record.items?.length || 0} item(s)</span>
        ),
      },
      {
        title: "Estimated Budget",
        dataIndex: "total_estimated_budget",
        key: "total_estimated_budget",
        align: "right",
        render: (val) => (
          <span className="font-semibold text-slate-800 text-xs">{formatPHP(val)}</span>
        ),
      },
      {
        title: "Terminal Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        render: (status) => getStatusTag(status),
      },
      {
        title: "Action",
        key: "action",
        align: "center",
        render: (_, record) => (
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onView && onView(record)}
            className="text-xs"
          >
            View Quotations
          </Button>
        ),
      },
    ],
  };

  const columns = customColumns || defaultColumns[type] || defaultColumns.po;

  return (
    <Card className="rounded-xl border border-slate-200 bg-white p-0 shadow-2xs">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Text strong className="text-sm text-slate-800 flex items-center gap-2">
            <FileDoneOutlined className="text-slate-500" />
            {title}
          </Text>
          <div className="text-xs text-slate-400">
            Archived and terminal-state records ({filteredData.length} total)
          </div>
        </div>

        <Space wrap>
          <Input
            placeholder="Search completed records..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="middle"
            className="w-64"
          />
          {onRefresh && (
            <Button icon={<ReloadOutlined />} onClick={onRefresh} size="middle">
              Refresh
            </Button>
          )}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (tot) => `Total ${tot} records` }}
        locale={{
          emptyText: (
            <div className="py-8 text-center text-slate-400">
              <FileDoneOutlined style={{ fontSize: 28 }} className="mb-2 text-slate-300" />
              <p className="text-xs m-0">No completed or archived records found in this stage.</p>
            </div>
          ),
        }}
        size="middle"
      />
    </Card>
  );
}
