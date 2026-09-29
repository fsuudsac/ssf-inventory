import React, { useState, useEffect } from "react";
import { Modal, Tag, Input, Typography, Space, Alert } from "antd";
import {
  ArrowRightOutlined,
  ExclamationCircleOutlined,
  AuditOutlined,
  BankOutlined,
  DollarOutlined,
  ShopOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

export default function KanbanTransitionModal({
  open,
  item,
  sourceStatus,
  targetStatus,
  moduleName = "Request",
  loading = false,
  extraAlert = null,
  extraInputs = null,
  onAccept,
  onCancel,
}) {
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (open) {
      setRemarks("");
    }
  }, [open]);

  if (!item) return null;

  const refNo = item.po_no || item.canvass_no || item.pr_no || `#${item.id}`;
  const title = item.title || item.notes || item.supplier_name || `${moduleName} #${item.id}`;
  const department = item.department_name;
  const amount = item.total_amount || item.total_estimated_budget || item.winning_bid_amount;

  const handleOk = () => {
    if (onAccept) {
      onAccept(remarks.trim());
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2 text-slate-900 text-base font-semibold border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <ExclamationCircleOutlined className="text-base" />
          </div>
          <div>
            <div>Confirm Stage Transition</div>
            <div className="text-xs font-normal text-slate-500 font-mono">
              {moduleName}: {refNo}
            </div>
          </div>
        </div>
      }
      okText="Accept"
      cancelText="Cancel"
      okButtonProps={{
        className: "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4",
        loading,
      }}
      cancelButtonProps={{
        disabled: loading,
      }}
      onOk={handleOk}
      onCancel={onCancel}
      width={520}
      destroyOnClose
    >
      <div className="py-3 space-y-4">
        {/* Stage Transition Visual */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-slate-500 uppercase tracking-wide font-medium mb-1">
              Current Stage
            </div>
            <Tag color="default" className="text-xs font-medium px-2 py-1 m-0 block truncate text-center">
              {sourceStatus}
            </Tag>
          </div>

          <div className="flex flex-col items-center justify-center px-1 text-blue-600">
            <ArrowRightOutlined className="text-base" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-blue-600 uppercase tracking-wide font-medium mb-1">
              New Stage
            </div>
            <Tag color="blue" className="text-xs font-medium px-2 py-1 m-0 block truncate text-center border-blue-300">
              {targetStatus}
            </Tag>
          </div>
        </div>

        {/* Item Summary Details */}
        <div className="rounded-lg border border-slate-100 bg-white p-3 space-y-2 text-xs">
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-slate-800 line-clamp-2">{title}</span>
            {amount !== undefined && (
              <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                ₱{Number(amount).toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-600 pt-1 border-t border-slate-100">
            {department && (
              <span className="flex items-center gap-1">
                <BankOutlined className="text-slate-400" />
                <span>{department}</span>
              </span>
            )}
            {item.supplier_name && (
              <span className="flex items-center gap-1">
                <ShopOutlined className="text-slate-400" />
                <span>{item.supplier_name}</span>
              </span>
            )}
            {item.warehouse_name && (
              <span className="flex items-center gap-1">
                <ShopOutlined className="text-slate-400" />
                <span>{item.warehouse_name}</span>
              </span>
            )}
          </div>
        </div>

        {/* Extra Alert if any */}
        {extraAlert && (
          <div>
            {typeof extraAlert === "string" ? (
              <Alert message={extraAlert} type="info" showIcon />
            ) : (
              extraAlert
            )}
          </div>
        )}

        {/* Extra inputs if any (e.g. warehouse picker) */}
        {extraInputs}

        {/* Audit Trail Remarks */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
              <AuditOutlined className="text-blue-500" />
              <span>Audit Trail Remarks (Optional)</span>
            </label>
            <span className="text-[11px] text-slate-400">Logged permanently in history</span>
          </div>
          <TextArea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g., Verified physical documents, authorized by department head, vendor delivery confirmed..."
            maxLength={250}
            showCount
          />
        </div>

        {/* Informative Note on Reversion */}
        <div className="text-[11px] text-slate-400 italic bg-slate-50/70 p-2 rounded border border-slate-100">
          💡 If you click <strong>Cancel</strong>, the status will immediately revert to its previous value without modifying any record.
        </div>
      </div>
    </Modal>
  );
}
