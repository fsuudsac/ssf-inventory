import React from "react";
import { Timeline, Tag, Typography, Empty } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  UserOutlined,
  AuditOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function RequestTrailTimeline({ trail = [], title = "Request Audit Trail" }) {
  if (!trail || trail.length === 0) {
    return (
      <div className="py-6 text-center">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-xs text-slate-400">No audit trail entries recorded yet</span>}
        />
      </div>
    );
  }

  // Sort descending or display chronological
  const entries = [...trail];

  return (
    <div className="space-y-3">
      {title && (
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
          <HistoryOutlined className="text-blue-500" />
          <span>{title} ({entries.length} {entries.length === 1 ? "entry" : "entries"})</span>
        </div>
      )}

      <Timeline
        className="mt-2 text-xs"
        items={entries.map((entry, index) => {
          const isLatest = index === entries.length - 1;
          const isApproved =
            entry.to_status?.toLowerCase().includes("approved") ||
            entry.to_status?.toLowerCase().includes("received");
          const isRejected = entry.to_status?.toLowerCase().includes("rejected") || entry.to_status?.toLowerCase().includes("cancel");

          let dotColor = isLatest ? "blue" : "gray";
          if (isApproved) dotColor = "green";
          if (isRejected) dotColor = "red";

          return {
            color: dotColor,
            dot: isApproved ? (
              <CheckCircleOutlined className="text-emerald-500 text-sm" />
            ) : isLatest ? (
              <ClockCircleOutlined className="text-blue-500 text-sm" />
            ) : undefined,
            children: (
              <div className="bg-slate-50/70 border border-slate-100 rounded-md p-2.5 mb-2 hover:bg-slate-50 transition-colors">
                {/* Header: Action & Timestamp */}
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                  <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                    <AuditOutlined className="text-blue-500" />
                    <span>{entry.action}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {entry.timestamp}
                  </span>
                </div>

                {/* Transition Tags if present */}
                {(entry.from_status || entry.to_status) && (
                  <div className="flex items-center gap-1.5 my-1.5 flex-wrap">
                    {entry.from_status && (
                      <Tag color="default" className="text-[11px] m-0">
                        {entry.from_status}
                      </Tag>
                    )}
                    {entry.from_status && entry.to_status && (
                      <ArrowRightOutlined className="text-[10px] text-slate-400" />
                    )}
                    {entry.to_status && (
                      <Tag
                        color={isApproved ? "success" : isRejected ? "error" : "blue"}
                        className="text-[11px] m-0 font-medium"
                      >
                        {entry.to_status}
                      </Tag>
                    )}
                  </div>
                )}

                {/* Performer info */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                  <UserOutlined className="text-slate-400" />
                  <span className="font-medium text-slate-700">{entry.performed_by}</span>
                  {entry.role && (
                    <span className="text-slate-400">({entry.role})</span>
                  )}
                </div>

                {/* Remarks */}
                {entry.remarks && (
                  <div className="mt-1.5 text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-200/60 italic">
                    "{entry.remarks}"
                  </div>
                )}
              </div>
            ),
          };
        })}
      />
    </div>
  );
}
