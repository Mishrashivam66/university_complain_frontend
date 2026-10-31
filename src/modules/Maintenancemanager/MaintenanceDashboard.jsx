import { useCallback, useEffect, useRef, useState } from "react";
import { useRealtime } from "../../context/RealtimeProvider";

import { Link } from "react-router-dom";

import axios from "axios";

import toast from "react-hot-toast";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  LayoutDashboard,
  Printer,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
  Wrench,
  Zap,
  ChevronRight,
} from "lucide-react";

// ==========================================

// API CONFIGURATION

// ==========================================

const API_URL =
  "https://complaine-backend.vercel.app/api/maintenance/dashboard";

const DEFAULT_DASHBOARD = {
  totalComplaints: 0,

  pendingComplaints: 0,

  inProgressComplaints: 0,

  resolvedComplaints: 0,

  overdueComplaints: 0,

  activeWorkers: 0,

  busyWorkers: 0,

  offlineWorkers: 0,

  resolutionRate: 0,
};

// ==========================================

// HELPERS

// ==========================================

const numberValue = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const formatNumber = (value) => numberValue(value).toLocaleString("en-IN");

const clampPercent = (value) => Math.max(0, Math.min(100, numberValue(value)));

// ==========================================

// STAT CARD

// ==========================================

function StatCard({
  label,

  value,

  icon: Icon,

  iconBackground,

  iconColor,

  description,

  to,
}) {
  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_5px_22px_rgba(18,41,75,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D6AD59]/40 hover:shadow-[0_15px_35px_rgba(18,41,75,0.09)]">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBackground} ${iconColor}`}
        >
          <Icon size={23} strokeWidth={1.9} />
        </div>

        {to && (
          <Link
            to={to}
            aria-label={`Open ${label}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#102B52]"
          >
            <ArrowUpRight size={18} />
          </Link>
        )}
      </div>

      <div className="mt-5">
        <p className="text-[12px] font-semibold text-slate-500">{label}</p>

        <h3 className="mt-1 text-[31px] font-black tracking-tight text-[#102B52]">
          {formatNumber(value)}
        </h3>

        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          {description}
        </p>
      </div>

      <div className="absolute bottom-0 left-5 right-5 h-[2px] origin-left scale-x-0 bg-[#D6AD59] transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  );
}

// ==========================================

// SECTION HEADING

// ==========================================

function SectionHeading({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102B52]/[0.07] text-[#102B52]">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="text-[16px] font-extrabold text-[#102B52] sm:text-lg">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

// ==========================================

// TECHNICIAN WORKFORCE

// ==========================================

function WorkforceItem({
  label,

  value,

  icon: Icon,

  color,

  background,

  percentage,
}) {
  const barColor =
    label === "Active" ? "#10B981" : label === "Busy" ? "#D6AD59" : "#F87171";

  return (
    <div className="rounded-2xl border border-slate-100 bg-[#FAFBFD] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${background} ${color}`}
          >
            <Icon size={19} />
          </div>

          <div>
            <p className="text-[12px] font-bold text-[#102B52]">{label}</p>

            <p className="mt-0.5 text-[10px] text-slate-400">
              {percentage.toFixed(1)}% of reported workforce
            </p>
          </div>
        </div>

        <span className="text-[22px] font-black text-[#102B52]">
          {formatNumber(value)}
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,

            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
}

// ==========================================

// LOADING SKELETON

// ==========================================

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-48 rounded-3xl bg-slate-200" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-44 rounded-3xl bg-slate-200" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-80 rounded-3xl bg-slate-200" />

        <div className="h-80 rounded-3xl bg-slate-200" />
      </div>
    </div>
  );
}

// ==========================================

// MAIN MAINTENANCE DASHBOARD

// ==========================================

export default function MaintenanceDashboard() {
  const [dashboardData, setDashboardData] = useState(DEFAULT_DASHBOARD);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const { refreshKey } = useRealtime();
  const previousRefreshKeyRef = useRef(refreshKey);
  const activeRequestRef = useRef(null);
  const requestIdRef = useRef(0);

  // Fetch silently on background ticks, without clearing current data.
  const fetchDashboard = useCallback(
    async ({ showToast = false, silent = false } = {}) => {
      activeRequestRef.current?.abort();
      const controller = new AbortController();
      activeRequestRef.current = controller;
      const requestId = ++requestIdRef.current;

      if (showToast) setRefreshing(true);
      else if (!silent) setLoading(true);
      if (!silent) setError("");

      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (controller.signal.aborted || requestId !== requestIdRef.current)
          return;

        setDashboardData({
          ...DEFAULT_DASHBOARD,
          ...(response?.data?.dashboard || {}),
        });
        setError("");
        if (showToast)
          toast.success("Dashboard updated successfully", { duration: 1200 });
      } catch (err) {
        if (
          controller.signal.aborted ||
          requestId !== requestIdRef.current ||
          err?.code === "ERR_CANCELED" ||
          err?.name === "CanceledError"
        )
          return;
        console.error("Maintenance dashboard error:", err);
        if (!silent) {
          const message =
            err?.response?.data?.message || "Failed to load dashboard data";
          setError(message);
          toast.error(message, { duration: 2000 });
        }
      } finally {
        if (!controller.signal.aborted && requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void fetchDashboard();
    return () => {
      activeRequestRef.current?.abort();
      requestIdRef.current += 1;
    };
  }, [fetchDashboard]);

  useEffect(() => {
    if (previousRefreshKeyRef.current === refreshKey) return;
    previousRefreshKeyRef.current = refreshKey;
    if (document.visibilityState !== "visible") return;
    void fetchDashboard({ silent: true });
  }, [refreshKey, fetchDashboard]);

  // ========================================

  // DASHBOARD STATISTICS

  // ========================================

  const data = dashboardData;

  const total = numberValue(data.totalComplaints);

  const pending = numberValue(data.pendingComplaints);

  const inProgress = numberValue(data.inProgressComplaints);

  const resolved = numberValue(data.resolvedComplaints);

  const overdue = numberValue(data.overdueComplaints);

  const resolutionRate = clampPercent(data.resolutionRate);

  const reportedWorkforce =
    numberValue(data.activeWorkers) +
    numberValue(data.busyWorkers) +
    numberValue(data.offlineWorkers);

  const getWorkforcePercentage = (value) =>
    reportedWorkforce > 0 ? (numberValue(value) / reportedWorkforce) * 100 : 0;

  // ========================================

  // COMPLAINT RESOLUTION CHART

  // ========================================

  const complaintSegments = [
    {
      label: "Resolved",

      value: resolved,

      color: "#10B981",
    },

    {
      label: "In Progress",

      value: inProgress,

      color: "#3B82F6",
    },

    {
      label: "Pending",

      value: pending,

      color: "#D6AD59",
    },
  ];

  const segmentTotal = complaintSegments.reduce(
    (sum, item) => sum + item.value,

    0,
  );

  const donutGradient =
    segmentTotal > 0
      ? (() => {
          let position = 0;

          const stops = complaintSegments.map((item) => {
            const start = position;

            position += (item.value / segmentTotal) * 100;

            return `${item.color} ${start}% ${position}%`;
          });

          if (position < 100) {
            stops.push(`#E2E8F0 ${position}% 100%`);
          }

          return `conic-gradient(${stops.join(", ")})`;
        })()
      : "conic-gradient(#E2E8F0 0% 100%)";

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="w-full space-y-6 pb-6">
      {/* =====================================*

*&#xA0;         PREMIUM HEADER*

*&#xA0;     ===================================== */}

      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#081B35] via-[#102E55] to-[#173F6A] px-5 py-7 text-white shadow-[0_12px_35px_rgba(8,27,53,0.13)] sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border-[45px] border-white/[0.035]" />

        <div className="pointer-events-none absolute bottom-[-90px] right-24 h-52 w-52 rounded-full bg-[#D6AD59]/[0.09] blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D6AD59]/30 bg-[#D6AD59]/10 px-3 py-1.5">
              <Zap size={13} className="text-[#E8C477]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#F0D494]">
                Maintenance Command Center
              </span>
            </div>

            <h1 className="text-[25px] font-black tracking-tight sm:text-[33px]">
              Maintenance Overview
            </h1>

            <p className="mt-3 max-w-xl text-[13px] leading-6 text-slate-300">
              Monitor campus complaints, technician availability, resolution
              progress and maintenance operations from one centralized
              dashboard.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/maintenance/complaints"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#D6AD59] px-4 py-2 text-xs font-extrabold text-[#081B35] transition hover:bg-[#EAC67D]"
              >
                <ClipboardList size={16} />
                Manage Complaints
                <ArrowRight size={15} />
              </Link>

              <button
                type="button"
                disabled={refreshing}
                onClick={() =>
                  fetchDashboard({
                    showToast: true,
                  })
                }
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.07] px-4 py-2 text-xs font-bold text-white transition hover:bg-white/[0.13] disabled:opacity-60"
              >
                <RefreshCcw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />

                {refreshing ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.07] px-5 py-4 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D6AD59]/20 text-[#E8C477]">
              <ShieldCheck size={26} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                Operations Portal
              </p>

              <p className="mt-1 text-sm font-bold text-white">
                Maintenance Manager
              </p>

              <p className="mt-1 text-[11px] text-slate-300">AMI MAINT.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================*

*&#xA0;         API ERROR*

*&#xA0;     ===================================== */}

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3"
        >
          <div className="flex items-center gap-2 text-sm text-rose-700">
            <AlertTriangle size={17} />

            <span>{error}</span>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() =>
              fetchDashboard({
                showToast: true,
              })
            }
            className="text-xs font-bold text-rose-700 underline disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* =====================================*

*&#xA0;         OPERATIONS SNAPSHOT*

*&#xA0;     ===================================== */}

      <SectionHeading
        icon={LayoutDashboard}
        title="Operations Snapshot"
        subtitle="Current complaint and workforce statistics"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Complaints"
          value={total}
          icon={ClipboardList}
          iconBackground="bg-blue-50"
          iconColor="text-blue-600"
          description="Complaints registered in the system"
          to="/maintenance/complaints"
        />

        <StatCard
          label="Pending Complaints"
          value={pending}
          icon={Clock3}
          iconBackground="bg-amber-50"
          iconColor="text-amber-600"
          description="Complaints awaiting further action"
          to="/maintenance/complaints"
        />

        <StatCard
          label="In Progress"
          value={inProgress}
          icon={Wrench}
          iconBackground="bg-indigo-50"
          iconColor="text-indigo-600"
          description="Maintenance work currently underway"
          to="/maintenance/complaints"
        />

        <StatCard
          label="Overdue Complaints"
          value={overdue}
          icon={AlertTriangle}
          iconBackground="bg-rose-50"
          iconColor="text-rose-600"
          description="Complaints exceeding their deadlines"
          to="/maintenance/overdue-complaints"
        />
      </div>

      {/* =====================================*

*&#xA0;         ANALYTICS*

*&#xA0;     ===================================== */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* COMPLAINT RESOLUTION */}

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            icon={TrendingUp}
            title="Complaint Resolution"
            subtitle="Resolution rate and complaint distribution"
          />

          <div className="mt-7 flex flex-col items-center gap-7 sm:flex-row sm:justify-around">
            <div
              className="relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full"
              style={{
                background: donutGradient,
              }}
            >
              <div className="flex h-[138px] w-[138px] flex-col items-center justify-center rounded-full bg-white">
                <span className="text-[30px] font-black tracking-tight text-[#102B52]">
                  {resolutionRate.toFixed(1)}%
                </span>

                <span className="mt-1 text-[11px] font-semibold text-slate-400">
                  Resolution Rate
                </span>
              </div>
            </div>

            <div className="w-full max-w-[230px] space-y-4">
              {complaintSegments.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />

                    <span className="text-xs font-medium text-slate-500">
                      {item.label}
                    </span>
                  </div>

                  <span className="text-sm font-extrabold text-[#102B52]">
                    {formatNumber(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={23} className="shrink-0 text-emerald-600" />

              <div>
                <p className="text-sm font-extrabold text-emerald-800">
                  {formatNumber(resolved)} Resolved Complaints
                </p>

                <p className="mt-1 text-[11px] text-emerald-700">
                  Resolution statistics reported by the dashboard API
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TECHNICIAN WORKFORCE */}

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            icon={Users}
            title="Technician Workforce"
            subtitle="Reported technician availability overview"
            action={
              <Link
                to="/maintenance/workers"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#B18535] hover:underline"
              >
                View All
                <ArrowRight size={14} />
              </Link>
            }
          />

          <div className="mt-6 space-y-3">
            <WorkforceItem
              label="Active"
              value={data.activeWorkers}
              icon={UserCheck}
              color="text-emerald-600"
              background="bg-emerald-100"
              percentage={getWorkforcePercentage(data.activeWorkers)}
            />

            <WorkforceItem
              label="Busy"
              value={data.busyWorkers}
              icon={Activity}
              color="text-amber-600"
              background="bg-amber-100"
              percentage={getWorkforcePercentage(data.busyWorkers)}
            />

            <WorkforceItem
              label="Offline"
              value={data.offlineWorkers}
              icon={UserX}
              color="text-rose-600"
              background="bg-rose-100"
              percentage={getWorkforcePercentage(data.offlineWorkers)}
            />
          </div>

          <Link
            to="/maintenance/worker-performance"
            className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-[#102B52] transition hover:border-[#D6AD59]/50 hover:bg-amber-50/40"
          >
            <span>View Technician Performance</span>

            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* =====================================*

*&#xA0;         QUICK ACCESS*

*&#xA0;     ===================================== */}

      <section className="space-y-4">
        <SectionHeading
          icon={Zap}
          title="Quick Access"
          subtitle="Frequently used maintenance operations"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Complaint Management",

              desc: "Review and process requests",

              icon: ClipboardList,

              path: "/maintenance/complaints",
            },

            {
              title: "Technician Management",

              desc: "Manage assigned technicians",

              icon: Users,

              path: "/maintenance/workers",
            },

            {
              title: "Emergency Job Cards",

              desc: "View and print job cards",

              icon: Printer,

              path: "/maintenance/job-cards",
            },

            {
              title: "Reports & Analytics",

              desc: "Review maintenance reports",

              icon: FileText,

              path: "/maintenance/reports",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="group flex items-center gap-3 rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D6AD59]/50 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#102B52]/[0.06] text-[#102B52] group-hover:bg-[#102B52] group-hover:text-[#E8C477]">
                  <Icon size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-extrabold text-[#102B52]">
                    {item.title}
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-slate-400">
                    {item.desc}
                  </p>
                </div>

                <ChevronRight
                  size={16}
                  className="shrink-0 text-slate-300 group-hover:text-[#B18535]"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* =====================================*

*&#xA0;         FOOTER*

*&#xA0;     ===================================== */}

      <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-4 text-[11px] text-slate-400 sm:flex-row sm:items-center">
        <p className="font-medium">
          AMI MAINT. · University Maintenance Operations
        </p>

        <p className="flex items-center gap-1.5">
          <ShieldCheck size={13} />
          Maintenance Manager Portal
        </p>
      </footer>
    </div>
  );
}
