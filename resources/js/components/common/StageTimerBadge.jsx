import React from "react";
import { Tooltip } from "antd";
import { ClockCircleOutlined, AlertOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

/**
 * StageTimerBadge Component
 * Displays "Time in Stage" (e.g. ⏱️ 2 days).
 * Turns timer text red if card sits in a stage for > 3 days (bottleneck flag).
 */
export default function StageTimerBadge({
  entryTimestamp,
  currentStage = "Current Stage",
  thresholdDays = 3,
  history = {},
  className = "",
  showDetailsInTooltip = true,
}) {
  if (!entryTimestamp) {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 ${className}`}>
        <ClockCircleOutlined className="text-[10px]" />
        <span>Just now</span>
      </span>
    );
  }

  const now = dayjs();
  const entered = dayjs(entryTimestamp);
  const diffHours = Math.max(0, now.diff(entered, "hour"));
  const diffDays = Math.floor(diffHours / 24);
  const remHours = diffHours % 24;

  let timeString = "";
  if (diffDays >= 1) {
    timeString = diffDays === 1 ? "1 day" : `${diffDays} days`;
    if (remHours > 0 && diffDays < 3) {
      timeString += ` ${remHours}h`;
    }
  } else if (diffHours >= 1) {
    timeString = `${diffHours}h`;
  } else {
    const diffMins = Math.max(1, now.diff(entered, "minute"));
    timeString = `${diffMins}m`;
  }

  const isBottleneck = diffHours >= (thresholdDays * 24);

  const tooltipContent = (
    <div className="text-xs space-y-1.5 p-1 max-w-xs">
      <div className="flex items-center gap-1 font-semibold">
        {isBottleneck ? (
          <span className="text-red-300 flex items-center gap-1">
            <AlertOutlined /> Bottleneck Alert (&gt;{thresholdDays} Days)
          </span>
        ) : (
          <span className="text-blue-200 flex items-center gap-1">
            <ClockCircleOutlined /> Stage Duration
          </span>
        )}
      </div>

      <div className="text-slate-200">
        Sitting in <span className="font-medium text-white">{currentStage}</span> for{" "}
        <strong className={isBottleneck ? "text-red-400" : "text-white"}>{timeString}</strong>
      </div>

      <div className="text-[11px] text-slate-300 border-t border-slate-600 pt-1 mt-1">
        Entered stage: {entered.isValid() ? entered.format("MMM D, YYYY h:mm A") : entryTimestamp}
      </div>

      {(history.canvass_started_at || history.pr_submitted_at || history.finance_approved_at || history.po_dispatched_at || history.items_received_at) && (
        <div className="text-[10px] text-slate-300 border-t border-slate-700 pt-1 space-y-0.5">
          <div className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Pipeline History</div>
          {history.canvass_started_at && (
            <div>• Canvass Started: {dayjs(history.canvass_started_at).format("MMM D, YYYY")}</div>
          )}
          {history.pr_submitted_at && (
            <div>• PR Submitted: {dayjs(history.pr_submitted_at).format("MMM D, YYYY")}</div>
          )}
          {history.finance_approved_at && (
            <div>• Finance Approved: {dayjs(history.finance_approved_at).format("MMM D, YYYY")}</div>
          )}
          {history.po_dispatched_at && (
            <div>• PO Dispatched: {dayjs(history.po_dispatched_at).format("MMM D, YYYY")}</div>
          )}
          {history.items_received_at && (
            <div>• Items Received: {dayjs(history.items_received_at).format("MMM D, YYYY")}</div>
          )}
        </div>
      )}
    </div>
  );

  const badgeContent = (
    <span
      className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded border transition-colors ${
        isBottleneck
          ? "bg-red-50 border-red-200 text-red-600 font-bold"
          : "bg-slate-100 border-slate-200 text-slate-600 font-medium"
      } ${className}`}
    >
      <span className="text-[10px]">⏱️</span>
      <span className={isBottleneck ? "text-red-600 font-bold" : "text-slate-700 font-medium"}>
        {timeString}
      </span>
      {isBottleneck && (
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-red-600 bg-red-100 px-1 rounded">
          Delayed
        </span>
      )}
    </span>
  );

  if (!showDetailsInTooltip) {
    return badgeContent;
  }

  return (
    <Tooltip title={tooltipContent} placement="top">
      {badgeContent}
    </Tooltip>
  );
}
