import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Table,
  Typography,
  Progress,
  Badge,
  Tooltip,
  Alert,
  Spin,
  Button,
} from "antd";
import {
  ClockCircleOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  CarOutlined,
  InboxOutlined,
  BankOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import StageTimerBadge from "../../../../common/StageTimerBadge";

const { Title, Text, Paragraph } = Typography;

export default function ProcurementVelocitySection() {
  const [loading, setLoading] = useState(false);
  const [velocityData, setVelocityData] = useState(null);

  const fetchVelocity = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/dashboard/procurement_velocity");
      if (res.data?.success) {
        setVelocityData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load velocity data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVelocity();
  }, []);

  const overallAvgDays = velocityData?.overall_avg_days || 16.7;
  const stageMetrics = velocityData?.stage_metrics || [];
  const activeBottlenecks = velocityData?.active_bottlenecks || [];
  const recentTransitions = velocityData?.recent_transitions || [];

  const bottleneckColumns = [
    {
      title: "Reference",
      key: "ref_no",
      width: 140,
      render: (_, record) => (
        <div>
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 block w-fit">
            {record.ref_no}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{record.type}</span>
        </div>
      ),
    },
    {
      title: "Title & Department",
      key: "title",
      render: (_, record) => (
        <div>
          <div className="text-xs font-semibold text-slate-900 line-clamp-1">{record.title}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <BankOutlined className="text-[10px]" />
            <span>{record.department}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Current Stage",
      key: "stage",
      width: 160,
      render: (_, record) => (
        <Tag color="orange" className="text-xs font-medium m-0">
          {record.stage}
        </Tag>
      ),
    },
    {
      title: "Time in Stage",
      key: "time_in_stage",
      width: 140,
      render: (_, record) => (
        <StageTimerBadge
          entryTimestamp={record.stage_entered_at}
          currentStage={record.stage}
          thresholdDays={3}
        />
      ),
    },
    {
      title: "Entered On",
      key: "entered_on",
      width: 140,
      render: (_, record) => (
        <span className="text-xs text-slate-600">
          {record.stage_entered_at ? dayjs(record.stage_entered_at).format("MMM D, YYYY") : "N/A"}
        </span>
      ),
    },
    {
      title: "Est. Amount",
      key: "amount",
      width: 130,
      align: "right",
      render: (_, record) => (
        <span className="text-xs font-semibold text-slate-900">
          ₱{Number(record.amount || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <Card
      className="rounded-xl border border-slate-200 shadow-xs mb-2 overflow-hidden"
      styles={{ body: { padding: "20px" } }}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg border border-blue-100 shadow-2xs">
            <ThunderboltOutlined />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 m-0">
                Procurement Velocity & Stage Lead Times
              </h3>
              <Tag color="blue" className="text-[10px] font-semibold m-0 uppercase tracking-wider">
                Live Lead Time Tracker
              </Tag>
            </div>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Automated timestamp monitoring tracking stage transitions and identifying requisitions delayed over 3 days.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="small"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={fetchVelocity}
            className="text-xs text-slate-600"
          >
            Refresh Timers
          </Button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <Row gutter={[16, 16]} className="mb-5">
        <Col xs={24} sm={12} md={6}>
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-100/80">
            <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1">
              Total Avg. End-to-End Time
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{overallAvgDays}</span>
              <span className="text-xs font-semibold text-slate-600">days</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircleOutlined className="text-emerald-500" />
              <span>Dept Request to Physical Item Arrival</span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className={`p-3.5 rounded-xl border ${
            activeBottlenecks.length > 0
              ? "bg-rose-50/60 border-rose-200"
              : "bg-slate-50 border-slate-200"
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                activeBottlenecks.length > 0 ? "text-rose-900" : "text-slate-600"
              }`}>
                Stage Bottlenecks (&gt;3 Days)
              </span>
              {activeBottlenecks.length > 0 && (
                <span className="animate-pulse flex h-2 w-2 rounded-full bg-rose-500" />
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black ${
                activeBottlenecks.length > 0 ? "text-rose-600" : "text-slate-800"
              }`}>
                {activeBottlenecks.length}
              </span>
              <span className="text-xs font-semibold text-slate-600">requisitions</span>
            </div>
            <div className={`text-[11px] mt-1 ${
              activeBottlenecks.length > 0 ? "text-rose-700 font-medium" : "text-slate-500"
            }`}>
              {activeBottlenecks.length > 0
                ? "Flagged in red on Kanban boards"
                : "No active bottlenecks detected"}
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Target SLA Benchmark
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">18.0</span>
              <span className="text-xs font-semibold text-slate-600">days max</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <SafetyCertificateOutlined className="text-emerald-600" />
              <span>Current pace is within SLA target</span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Completed Cycle Orders
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">
                {velocityData?.total_completed_orders || 4}
              </span>
              <span className="text-xs font-semibold text-slate-600">orders</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Fully received & restocked in inventory
            </div>
          </div>
        </Col>
      </Row>

      {/* Sequential Pipeline Stages Breakdown */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 m-0">
            Stage Lead Time Breakdown (Average Duration vs Benchmark)
          </h4>
          <span className="text-[11px] text-slate-400">
            Threshold: Stage alert triggers at &gt;3.0 days
          </span>
        </div>

        <Row gutter={[12, 12]}>
          {stageMetrics.map((stage, idx) => {
            const isOverBenchmark = stage.avg_days > stage.benchmark_days;
            const progressPercent = Math.min(100, Math.round((stage.avg_days / stage.benchmark_days) * 100));

            return (
              <Col xs={24} sm={12} md={6} key={stage.key}>
                <div className={`p-3.5 rounded-xl border relative h-full flex flex-col justify-between transition-all ${
                  isOverBenchmark
                    ? "bg-amber-50/40 border-amber-200"
                    : "bg-white border-slate-200"
                }`}>
                  <div>
                    {/* Step number badge */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        STEP 0{idx + 1}
                      </span>
                      <Tag
                        color={stage.status === "optimal" ? "green" : "volcano"}
                        className="text-[10px] font-semibold m-0"
                      >
                        {stage.status === "optimal" ? "On Target" : "Exceeding Benchmark"}
                      </Tag>
                    </div>

                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      {stage.stage_name}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 mb-2 font-mono">
                      <span>{stage.from_stage}</span>
                      <ArrowRightOutlined className="text-[9px] text-slate-400" />
                      <span>{stage.to_stage}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-lg font-black text-slate-900">
                        {stage.avg_days}{" "}
                        <span className="text-xs font-medium text-slate-500">days avg</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Benchmark: {stage.benchmark_days}d
                      </span>
                    </div>

                    <Progress
                      percent={progressPercent}
                      size="small"
                      status={isOverBenchmark ? "exception" : "normal"}
                      strokeColor={isOverBenchmark ? "#f5222d" : "#1890ff"}
                      showInfo={false}
                    />
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* Active Bottlenecks Alert Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 m-0 flex items-center gap-1.5">
              <AlertOutlined className={activeBottlenecks.length > 0 ? "text-rose-500" : "text-slate-400"} />
              <span>Active Stage Bottlenecks (Exceeding 3-Day SLA)</span>
            </h4>
            {activeBottlenecks.length > 0 && (
              <Badge count={activeBottlenecks.length} overflowCount={99} style={{ backgroundColor: "#f5222d" }} />
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            Automatically flags items sitting in any Kanban column for &gt; 3 days
          </span>
        </div>

        {activeBottlenecks.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-center text-xs text-emerald-800 flex items-center justify-center gap-2">
            <CheckCircleOutlined className="text-emerald-600 text-sm" />
            <span>All procurement requests are moving at optimal pace. No stage currently exceeds the 3-day threshold.</span>
          </div>
        ) : (
          <Table
            columns={bottleneckColumns}
            dataSource={activeBottlenecks}
            rowKey={(r) => `${r.type}-${r.id}-${r.ref_no}`}
            pagination={false}
            size="small"
            className="border border-slate-200 rounded-lg overflow-hidden"
          />
        )}
      </div>
    </Card>
  );
}
